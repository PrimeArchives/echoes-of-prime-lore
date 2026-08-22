var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.ts
var SESSION_COOKIE = "prime_session";
var SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;
function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}
__name(json, "json");
function bytesToHex(bytes) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(bytesToHex, "bytesToHex");
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
__name(hexToBytes, "hexToBytes");
async function sha256(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return bytesToHex(new Uint8Array(digest));
}
__name(sha256, "sha256");
async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex),
      iterations: 1e5,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(derivedBits));
}
__name(hashPassword, "hashPassword");
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
__name(constantTimeEqual, "constantTimeEqual");
function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(
        valueParts.join("=")
      );
    }
  }
  return null;
}
__name(getCookie, "getCookie");
function sessionCookie(token) {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_DURATION_SECONDS}`
  ].join("; ");
}
__name(sessionCookie, "sessionCookie");
function expiredSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ].join("; ");
}
__name(expiredSessionCookie, "expiredSessionCookie");
async function getSessionUser(request, env) {
  const token = getCookie(
    request,
    SESSION_COOKIE
  );
  if (!token) return null;
  const tokenHash = await sha256(token);
  const user = await env.DB.prepare(
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
      `
  ).bind(tokenHash).first();
  return user ?? null;
}
__name(getSessionUser, "getSessionUser");
async function handleLogin(request, env) {
  const body = await request.json();
  const username = String(
    body.username ?? ""
  ).trim().toLowerCase();
  const password = String(
    body.password ?? ""
  );
  if (!username || !password) {
    return json(
      {
        error: "Username and password are required"
      },
      { status: 400 }
    );
  }
  const user = await env.DB.prepare(
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
      `
  ).bind(username).first();
  if (!user) {
    return json(
      {
        error: "Invalid username or password"
      },
      { status: 401 }
    );
  }
  const suppliedHash = await hashPassword(
    password,
    user.password_salt
  );
  if (!constantTimeEqual(
    suppliedHash,
    user.password_hash
  )) {
    return json(
      {
        error: "Invalid username or password"
      },
      { status: 401 }
    );
  }
  const rawToken = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const tokenHash = await sha256(rawToken);
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_SECONDS * 1e3
  ).toISOString().replace("T", " ").replace("Z", "");
  await env.DB.prepare(
    `
      INSERT INTO sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?)
      `
  ).bind(
    user.id,
    tokenHash,
    expiresAt
  ).run();
  return json(
    {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role
      }
    },
    {
      headers: {
        "Set-Cookie": sessionCookie(rawToken)
      }
    }
  );
}
__name(handleLogin, "handleLogin");
async function handleLogout(request, env) {
  const token = getCookie(
    request,
    SESSION_COOKIE
  );
  if (token) {
    const tokenHash = await sha256(token);
    await env.DB.prepare(
      `
        DELETE FROM sessions
        WHERE token_hash = ?
        `
    ).bind(tokenHash).run();
  }
  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": expiredSessionCookie()
      }
    }
  );
}
__name(handleLogout, "handleLogout");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      return handleLogin(request, env);
    }
    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      return handleLogout(request, env);
    }
    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const user = await getSessionUser(
        request,
        env
      );
      return json({
        authenticated: Boolean(user),
        user
      });
    }
    if (url.pathname === "/api/notes" && request.method === "GET") {
      const recordId = url.searchParams.get(
        "record_id"
      );
      const currentUser = await getSessionUser(
        request,
        env
      );
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
      `;
      const result = recordId ? await env.DB.prepare(
        select + `
                WHERE notes.record_id = ?
                ORDER BY notes.created_at DESC
                `
      ).bind(recordId).all() : await env.DB.prepare(
        select + `
                ORDER BY notes.created_at DESC
                `
      ).all();
      const notes = (result.results ?? []).map(
        (note) => {
          const noteUserId = note.user_id == null ? null : Number(
            note.user_id
          );
          const canDelete = currentUser !== null && (currentUser.role === "architect" || noteUserId === currentUser.id);
          return {
            ...note,
            can_delete: canDelete
          };
        }
      );
      return json(notes);
    }
    if (url.pathname === "/api/notes" && request.method === "POST") {
      const user = await getSessionUser(
        request,
        env
      );
      if (!user) {
        return json(
          {
            error: "Authentication required"
          },
          { status: 401 }
        );
      }
      const body = await request.json();
      const recordId = String(
        body.record_id ?? ""
      ).trim();
      const content = String(
        body.content ?? ""
      ).trim();
      if (!recordId || !content) {
        return json(
          {
            error: "record_id and content are required"
          },
          { status: 400 }
        );
      }
      const result = await env.DB.prepare(
        `
          INSERT INTO notes (
            record_id,
            author,
            content,
            user_id
          )
          VALUES (?, ?, ?, ?)
          `
      ).bind(
        recordId,
        user.display_name,
        content,
        user.id
      ).run();
      return json(
        {
          success: true,
          id: result.meta.last_row_id
        },
        { status: 201 }
      );
    }
    const deleteMatch = url.pathname.match(
      /^\/api\/notes\/(\d+)$/
    );
    if (deleteMatch && request.method === "DELETE") {
      const user = await getSessionUser(
        request,
        env
      );
      if (!user) {
        return json(
          {
            error: "Authentication required"
          },
          { status: 401 }
        );
      }
      const noteId = Number(deleteMatch[1]);
      const note = await env.DB.prepare(
        `
          SELECT
            id,
            user_id
          FROM notes
          WHERE id = ?
          LIMIT 1
          `
      ).bind(noteId).first();
      if (!note) {
        return json(
          {
            error: "Note not found"
          },
          { status: 404 }
        );
      }
      const ownsNote = note.user_id === user.id;
      const isArchitect = user.role === "architect";
      if (!ownsNote && !isArchitect) {
        return json(
          {
            error: "You cannot delete this annotation"
          },
          { status: 403 }
        );
      }
      await env.DB.prepare(
        `
          DELETE FROM notes
          WHERE id = ?
          `
      ).bind(noteId).run();
      return json({
        success: true
      });
    }
    return env.ASSETS.fetch(
      request
    );
  }
};

// ../../Users/rvanlaarhoven/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../Users/rvanlaarhoven/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-JP7T0I/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../Users/rvanlaarhoven/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-JP7T0I/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
