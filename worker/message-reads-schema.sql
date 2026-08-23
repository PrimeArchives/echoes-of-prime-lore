-- Prime Archives
-- Per-user message read receipts.
--
-- Apply locally:
--   npx wrangler d1 execute prime-archives --local --file="./worker/message-reads-schema.sql"
--
-- Apply to production only after local testing:
--   npx wrangler d1 execute prime-archives --remote --file="./worker/message-reads-schema.sql"

CREATE TABLE IF NOT EXISTS message_reads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  message_id TEXT NOT NULL,
  read_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, message_id),

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_reads_user
ON message_reads(user_id);

CREATE INDEX IF NOT EXISTS idx_message_reads_message
ON message_reads(message_id);