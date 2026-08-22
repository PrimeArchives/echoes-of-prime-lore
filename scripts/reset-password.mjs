import crypto from "node:crypto"
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import readline from "node:readline"

const PROJECT_ROOT =
  "C:\\Echoes of Prime\\QuartzSetup"

const TEMP_SQL_FILE = path.join(
  PROJECT_ROOT,
  "scripts",
  ".reset-password-temp.sql",
)

const username = process.argv[2]
  ?.trim()
  .toLowerCase()

if (!username) {
  console.error(
    "Usage: node ./scripts/reset-password.mjs <username>",
  )
  process.exit(1)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

function hashPassword(
  password,
  saltHex,
) {
  return crypto
    .pbkdf2Sync(
      password,
      Buffer.from(saltHex, "hex"),
      100_000,
      32,
      "sha256",
    )
    .toString("hex")
}

function sqlEscape(value) {
  return String(value).replaceAll(
    "'",
    "''",
  )
}

function cleanup() {
  try {
    if (fs.existsSync(TEMP_SQL_FILE)) {
      fs.unlinkSync(TEMP_SQL_FILE)
    }
  } catch {
    // Best effort cleanup.
  }
}

try {
  let password = ""

  while (password.length < 8) {
    password = await ask(
      `New production password for ${username} (minimum 8 characters): `,
    )

    if (password.length < 8) {
      console.log(
        "Password must contain at least 8 characters.",
      )
    }
  }

  const salt =
    crypto.randomBytes(16).toString("hex")

  const passwordHash =
    hashPassword(password, salt)

  const safeUsername =
    sqlEscape(username)

  const sql = `
UPDATE users
SET
  password_hash = '${passwordHash}',
  password_salt = '${salt}'
WHERE username = '${safeUsername}';

DELETE FROM sessions
WHERE user_id = (
  SELECT id
  FROM users
  WHERE username = '${safeUsername}'
);
`

  fs.writeFileSync(
    TEMP_SQL_FILE,
    sql,
    "utf8",
  )

  console.log(
    `Resetting production password for ${username}...`,
  )

  const command = [
    "npx wrangler d1 execute prime-archives",
    "--remote",
    `--file="${TEMP_SQL_FILE}"`,
  ].join(" ")

  const result = spawnSync(
    command,
    {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
      shell: true,
    },
  )

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(
      `Wrangler exited with code ${result.status}`,
    )
  }

  password = ""

  console.log("")
  console.log(
    `✓ Password reset for ${username}`,
  )
  console.log(
    "✓ Existing sessions invalidated",
  )
} catch (error) {
  console.error("")
  console.error(
    "Password reset failed:",
  )
  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
} finally {
  cleanup()
  rl.close()
}