CREATE TABLE IF NOT EXISTS frostgale_relay (
 id INTEGER PRIMARY KEY CHECK (id = 1),
 revision INTEGER NOT NULL DEFAULT 0,
 state TEXT NOT NULL CHECK (json_valid(state))
);
