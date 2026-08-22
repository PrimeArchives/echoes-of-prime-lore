import crypto from "node:crypto"
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import readline from "node:readline"

const PROJECT_ROOT = "C:\\Echoes of Prime\\QuartzSetup"

const TEMP_SQL_FILE = path.join(
  PROJECT_ROOT,
  "scripts",
  ".provision-user-temp.sql",
)

const accounts = [
  {
    username: "lumi",
    displayName: "Lumi",
    role: "player",
  },
  {
    username: "clav",
    displayName: "Clav",
    role: "player",
  },
  {
    username: "dakka",
    displayName: "Dakka",
    role: "player",
  },
  {
    username: "venn",
    displayName: "Venn",
    role: "player",
  },
  {
    username: "architect",
    displayName: "The Architect",
    role: "architect",
  },
]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

function hashPassword(password, saltHex) {
  return crypto
    .pbkdf2Sync(
      password,
      Buffer.from(saltHex, "hex"),
      210_000,
      32,
      "sha256",
    )
    .toString("hex")
}

function sqlEscape(value) {
  return String(value).replaceAll("'", "''")
}

function deleteTempFile() {
  try {
    if (fs.existsSync(TEMP_SQL_FILE)) {
      fs.unlinkSync(TEMP_SQL_FILE)
    }
  } catch {
    // Best-effort cleanup.
  }
}

function runWrangler() {
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
}

console.log("")
console.log(
  "Prime Archives — Remote User Provisioning",
)
console.log(
  "-----------------------------------------",
)
console.log(
  "Target: remote D1 database 'prime-archives'",
)
console.log("")

try {
  for (const account of accounts) {
    let password = ""

    while (password.length < 8) {
      password = await ask(
        `New password for ${account.displayName} (minimum 8 characters): `,
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

    const username =
      sqlEscape(account.username)

    const displayName =
      sqlEscape(account.displayName)

    const role =
      sqlEscape(account.role)

    const sql = `
INSERT INTO users (
  username,
  display_name,
  password_hash,
  password_salt,
  role
)
VALUES (
  '${username}',
  '${displayName}',
  '${passwordHash}',
  '${salt}',
  '${role}'
)
ON CONFLICT(username) DO UPDATE SET
  display_name = excluded.display_name,
  password_hash = excluded.password_hash,
  password_salt = excluded.password_salt,
  role = excluded.role;
`

    fs.writeFileSync(
      TEMP_SQL_FILE,
      sql,
      {
        encoding: "utf8",
      },
    )

    console.log("")
    console.log(
      `Provisioning ${account.displayName}...`,
    )

    runWrangler()

    deleteTempFile()

    password = ""

    console.log(
      `✓ ${account.displayName}`,
    )
    console.log("")
  }

  console.log(
    "-----------------------------------------",
  )
  console.log(
    "All five production accounts provisioned.",
  )
} catch (error) {
  console.error("")
  console.error(
    "Provisioning failed:",
  )

  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
} finally {
  deleteTempFile()
  rl.close()
}