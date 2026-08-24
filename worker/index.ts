interface Env {
  ASSETS: Fetcher
  DB: D1Database
}

type UserRole = "player" | "architect"

interface SessionUser {
  id: number
  username: string
  display_name: string
  role: UserRole
}

const SESSION_COOKIE = "prime_session"
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30

const RESTRICTED_ARCHIVE_ROUTES: Record<string, string[]> = {
  "/04-factions/the-frequency": ["architect", "lumi"],
}

function normalizeArchivePath(pathname: string) {
  const normalized = pathname.replace(/\/+/g, "/").replace(/\/$/, "")
  return normalized || "/"
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json; charset=utf-8")

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  })
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }

  return bytes
}

async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", encoded)

  return bytesToHex(new Uint8Array(digest))
}

async function hashPassword(
  password: string,
  saltHex: string,
): Promise<string> {
  const encoder = new TextEncoder()

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )

  return bytesToHex(new Uint8Array(derivedBits))
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let result = 0

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

function getCookie(
  request: Request,
  name: string,
): string | null {
  const cookieHeader = request.headers.get("Cookie")

  if (!cookieHeader) return null

  for (const part of cookieHeader.split(";")) {
    const [key, ...valueParts] =
      part.trim().split("=")

    if (key === name) {
      return decodeURIComponent(
        valueParts.join("="),
      )
    }
  }

  return null
}

function sessionCookie(token: string): string {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_DURATION_SECONDS}`,
  ].join("; ")
}

function expiredSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ")
}

async function getSessionUser(
  request: Request,
  env: Env,
): Promise<SessionUser | null> {
  const token = getCookie(
    request,
    SESSION_COOKIE,
  )

  if (!token) return null

  const tokenHash = await sha256(token)

  const user = await env.DB
    .prepare(
      `
      SELECT
        users.id,
        users.username,
        users.display_name,
        users.role
      FROM sessions
      JOIN users
        ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
        AND sessions.expires_at > CURRENT_TIMESTAMP
      LIMIT 1
      `,
    )
    .bind(tokenHash)
    .first<SessionUser>()

  return user ?? null
}

async function handleLogin(
  request: Request,
  env: Env,
): Promise<Response> {
  const body = await request.json<{
    username?: string
    password?: string
  }>()

  const username = String(
    body.username ?? "",
  )
    .trim()
    .toLowerCase()

  const password = String(
    body.password ?? "",
  )

  if (!username || !password) {
    return json(
      {
        error:
          "Username and password are required",
      },
      { status: 400 },
    )
  }

  const user = await env.DB
    .prepare(
      `
      SELECT
        id,
        username,
        display_name,
        password_hash,
        password_salt,
        role
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
    )
    .bind(username)
    .first<{
      id: number
      username: string
      display_name: string
      password_hash: string
      password_salt: string
      role: UserRole
    }>()

  if (!user) {
    return json(
      {
        error:
          "Invalid username or password",
      },
      { status: 401 },
    )
  }

  const suppliedHash =
    await hashPassword(
      password,
      user.password_salt,
    )

  if (
    !constantTimeEqual(
      suppliedHash,
      user.password_hash,
    )
  ) {
    return json(
      {
        error:
          "Invalid username or password",
      },
      { status: 401 },
    )
  }

  const rawToken = crypto.randomUUID()
    .replaceAll("-", "") +
    crypto.randomUUID()
      .replaceAll("-", "")

  const tokenHash =
    await sha256(rawToken)

  const expiresAt = new Date(
    Date.now() +
      SESSION_DURATION_SECONDS * 1000,
  )
    .toISOString()
    .replace("T", " ")
    .replace("Z", "")

  await env.DB
    .prepare(
      `
      INSERT INTO sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?)
      `,
    )
    .bind(
      user.id,
      tokenHash,
      expiresAt,
    )
    .run()

  return json(
    {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role,
      },
    },
    {
      headers: {
        "Set-Cookie":
          sessionCookie(rawToken),
      },
    },
  )
}

async function handleLogout(
  request: Request,
  env: Env,
): Promise<Response> {
  const token = getCookie(
    request,
    SESSION_COOKIE,
  )

  if (token) {
    const tokenHash =
      await sha256(token)

    await env.DB
      .prepare(
        `
        DELETE FROM sessions
        WHERE token_hash = ?
        `,
      )
      .bind(tokenHash)
      .run()
  }

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie":
          expiredSessionCookie(),
      },
    },
  )
}

export default {
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    const url = new URL(request.url)

    // ============================================================
    // AUTH
    // ============================================================

    if (
      url.pathname === "/api/auth/login" &&
      request.method === "POST"
    ) {
      return handleLogin(request, env)
    }

    if (
      url.pathname === "/api/auth/logout" &&
      request.method === "POST"
    ) {
      return handleLogout(request, env)
    }

    if (
      url.pathname === "/api/auth/me" &&
      request.method === "GET"
    ) {
      const user =
        await getSessionUser(
          request,
          env,
        )

      return json({
        authenticated:
          Boolean(user),
        user,
      })
    }

    // ============================================================
    // MESSAGES — PERSONAL READ STATE
    // ============================================================

    if (
      url.pathname === "/api/messages/read-state" &&
      request.method === "GET"
    ) {
      const user =
        await getSessionUser(
          request,
          env,
        )

      if (!user) {
        return json({
          authenticated: false,
          read_message_ids: [],
        })
      }

      const result = await env.DB
        .prepare(
          `
          SELECT message_id
          FROM message_reads
          WHERE user_id = ?
          ORDER BY read_at ASC
          `,
        )
        .bind(user.id)
        .all<{ message_id: string }>()

      return json({
        authenticated: true,
        read_message_ids:
          (result.results ?? [])
            .map((row) => row.message_id)
            .filter(
              (messageId): messageId is string =>
                typeof messageId === "string",
            ),
      })
    }

    const messageReadMatch =
      url.pathname.match(
        /^\/api\/messages\/(MSG-\d+)\/read$/i,
      )

    if (
      messageReadMatch &&
      request.method === "POST"
    ) {
      const user =
        await getSessionUser(
          request,
          env,
        )

      if (!user) {
        return json(
          {
            error:
              "Authentication required",
          },
          { status: 401 },
        )
      }

      const messageId =
        messageReadMatch[1].toUpperCase()

      await env.DB
        .prepare(
          `
          INSERT INTO message_reads (
            user_id,
            message_id
          )
          VALUES (?, ?)
          ON CONFLICT(user_id, message_id)
          DO UPDATE SET
            read_at = CURRENT_TIMESTAMP
          `,
        )
        .bind(
          user.id,
          messageId,
        )
        .run()

      return json({
        success: true,
        message_id: messageId,
        read: true,
      })
    }

    // ============================================================
    // NOTES — READ
    // ============================================================

    if (
      url.pathname === "/api/notes" &&
      request.method === "GET"
    ) {
      const recordId =
        url.searchParams.get(
          "record_id",
        )

      const currentUser =
        await getSessionUser(
          request,
          env,
        )

      const select = `
        SELECT
          notes.id,
          notes.record_id,
          notes.content,
          notes.created_at,
          notes.user_id,
          COALESCE(
            users.display_name,
            notes.author
          ) AS author,
          users.username AS username,
          users.role AS author_role
        FROM notes
        LEFT JOIN users
          ON users.id = notes.user_id
      `

      const result = recordId
        ? await env.DB
            .prepare(
              select +
                `
                WHERE notes.record_id = ?
                ORDER BY notes.created_at DESC
                `,
            )
            .bind(recordId)
            .all()
        : await env.DB
            .prepare(
              select +
                `
                ORDER BY notes.created_at DESC
                `,
            )
            .all()

      const notes =
        (result.results ?? []).map(
          (
            note: Record<
              string,
              unknown
            >,
          ) => {
            const noteUserId =
              note.user_id == null
                ? null
                : Number(
                    note.user_id,
                  )

            const canDelete =
              currentUser !== null &&
              (
                currentUser.role ===
                  "architect" ||
                noteUserId ===
                  currentUser.id
              )

            return {
              ...note,
              can_delete: canDelete,
            }
          },
        )

      return json(notes)
    }

    // ============================================================
    // NOTES — CREATE
    // ============================================================

    if (
      url.pathname === "/api/notes" &&
      request.method === "POST"
    ) {
      const user =
        await getSessionUser(
          request,
          env,
        )

      if (!user) {
        return json(
          {
            error:
              "Authentication required",
          },
          { status: 401 },
        )
      }

      const body =
        await request.json<{
          record_id?: string
          content?: string
        }>()

      const recordId =
        String(
          body.record_id ?? "",
        ).trim()

      const content =
        String(
          body.content ?? "",
        ).trim()

      if (
        !recordId ||
        !content
      ) {
        return json(
          {
            error:
              "record_id and content are required",
          },
          { status: 400 },
        )
      }

      const result = await env.DB
        .prepare(
          `
          INSERT INTO notes (
            record_id,
            author,
            content,
            user_id
          )
          VALUES (?, ?, ?, ?)
          `,
        )
        .bind(
          recordId,
          user.display_name,
          content,
          user.id,
        )
        .run()

      return json(
        {
          success: true,
          id:
            result.meta
              .last_row_id,
        },
        { status: 201 },
      )
    }

    // ============================================================
    // NOTES — DELETE
    // ============================================================

    const deleteMatch =
      url.pathname.match(
        /^\/api\/notes\/(\d+)$/,
      )

    if (
      deleteMatch &&
      request.method === "DELETE"
    ) {
      const user =
        await getSessionUser(
          request,
          env,
        )

      if (!user) {
        return json(
          {
            error:
              "Authentication required",
          },
          { status: 401 },
        )
      }

      const noteId =
        Number(deleteMatch[1])

      const note = await env.DB
        .prepare(
          `
          SELECT
            id,
            user_id
          FROM notes
          WHERE id = ?
          LIMIT 1
          `,
        )
        .bind(noteId)
        .first<{
          id: number
          user_id:
            | number
            | null
        }>()

      if (!note) {
        return json(
          {
            error:
              "Note not found",
          },
          { status: 404 },
        )
      }

      const ownsNote =
        note.user_id === user.id

      const isArchitect =
        user.role === "architect"

      if (
        !ownsNote &&
        !isArchitect
      ) {
        return json(
          {
            error:
              "You cannot delete this annotation",
          },
          { status: 403 },
        )
      }

      await env.DB
        .prepare(
          `
          DELETE FROM notes
          WHERE id = ?
          `,
        )
        .bind(noteId)
        .run()

      return json({
        success: true,
      })
    }

    // ============================================================
    // RESTRICTED ARCHIVE ROUTES
    // ============================================================

    const archivePath = normalizeArchivePath(url.pathname)
    const allowedUsers = RESTRICTED_ARCHIVE_ROUTES[archivePath]

    if (allowedUsers) {
      const user = await getSessionUser(request, env)
      const username = user?.username?.trim().toLowerCase() ?? ""

      if (!username || !allowedUsers.includes(username)) {
        return new Response("Not Found", {
          status: 404,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        })
      }
    }

    // ============================================================
    // QUARTZ STATIC SITE
    // ============================================================

    return env.ASSETS.fetch(
      request,
    )
  },
}