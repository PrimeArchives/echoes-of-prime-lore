var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/frostgale-engine.ts
var VERSION = 22;
var PLAYERS = ["lumi", "clav", "dakka", "venn"];
var PHASES = [
  { name: "Aanvoer herstellen", goal: "Verbind de bron via controlepunt A met het aanvoerstation." },
  { name: "Verdeelnet herstellen", goal: "Verbind de bron via controlepunten A en B met het verdeelstation." },
  { name: "Zender aansluiten", goal: "Verbind de bron via A, B en C met de zender en reserveer minimaal 3 PU." }
];
var CIRCUITS = [
  { id: "heat", name: "Woonverwarming", short: "WARMTE", pu: 2, decay: 120, recovery: 75, warning: "Temperatuur daalt; bewoners zoeken beschutting." },
  { id: "food", name: "Voedselbewaring", short: "VOEDSEL", pu: 1, decay: 180, recovery: 90, warning: "Koelketen onderbroken; voedselvoorraad loopt risico." },
  { id: "perimeter", name: "Perimeterbeveiliging", short: "PERIMETER", pu: 1, decay: 100, recovery: 65, warning: "Buitensensoren vallen uit; blinde zones ontstaan." },
  { id: "medical", name: "Medische post", short: "MEDISCH", pu: 1, decay: 110, recovery: 70, warning: "Medische apparatuur verliest capaciteit." },
  { id: "7g", name: "Circuit 7-G \u2014 BUITEN GEBRUIK", short: "7-G", pu: 2, decay: 150, recovery: 100, warning: "Onverklaarde terugkoppeling. Bestemming onbekend." }
];
var BASE = [[0, 2], [0, 1], [0, 1, 3]];
var STEP = [-5, 1, 5, -1];
function ports(cell, rotation) {
  return BASE[cell.shape].map((d) => (d + rotation) % 4);
}
__name(ports, "ports");
function neighbor(i, d) {
  const j = i + STEP[d];
  return j >= 0 && j < 30 && !(d === 1 && i % 5 === 4) && !(d === 3 && i % 5 === 0) ? j : -1;
}
__name(neighbor, "neighbor");
function direction(a, b) {
  return a - b === 5 ? 0 : b - a === 1 ? 1 : b - a === 5 ? 2 : 3;
}
__name(direction, "direction");
var PATHS = [[0, 5, 10, 15, 20, 21, 16, 17, 18, 13, 12, 11, 6, 1, 2, 3, 8, 9, 14, 19, 24, 29], [0, 1, 6, 11, 12, 17, 16, 21, 20, 25, 26, 27, 28, 23, 18, 13, 8, 9, 14, 19, 24, 29], [0, 1, 2, 3, 8, 13, 12, 11, 16, 21, 20, 25, 26, 27, 22, 17, 18, 19, 24, 23, 28, 29], [0, 1, 2, 7, 8, 9, 14, 13, 18, 17, 12, 11, 6, 5, 10, 15, 16, 21, 26, 27, 28, 29], [0, 1, 6, 5, 10, 11, 12, 17, 16, 15, 20, 21, 22, 27, 28, 23, 18, 13, 14, 19, 24, 29], [0, 5, 10, 11, 6, 1, 2, 7, 12, 13, 18, 23, 22, 21, 16, 15, 20, 25, 26, 27, 28, 29], [0, 5, 6, 7, 12, 17, 16, 11, 10, 15, 20, 21, 26, 27, 28, 23, 18, 13, 14, 19, 24, 29], [0, 5, 6, 7, 12, 13, 8, 9, 14, 19, 24, 23, 18, 17, 16, 11, 10, 15, 20, 21, 22, 27, 28, 29], [0, 5, 6, 7, 2, 3, 8, 9, 14, 13, 12, 11, 10, 15, 16, 21, 22, 17, 18, 19, 24, 23, 28, 29], [0, 5, 10, 15, 16, 21, 26, 27, 22, 17, 18, 13, 12, 11, 6, 1, 2, 7, 8, 9, 14, 19, 24, 29], [0, 1, 2, 7, 6, 11, 10, 15, 20, 21, 26, 27, 28, 23, 22, 17, 12, 13, 18, 19, 24, 29], [0, 5, 6, 1, 2, 7, 8, 3, 4, 9, 14, 13, 12, 17, 18, 19, 24, 23, 22, 27, 28, 29]];
function config(player, phase = 0) {
  const k = PLAYERS.indexOf(player);
  if (k < 0 || !Number.isInteger(phase) || phase < 0 || phase > 2) throw Error("Onbekend subsystem of fase.");
  const path = PATHS[k * 3 + phase];
  let seed = 9817 + k * 381 + phase * 1127;
  const random = /* @__PURE__ */ __name(() => {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    return seed;
  }, "random");
  const cells = Array.from({ length: 30 }, (_, i) => ({ shape: random() % 3, motor: CIRCUITS[i % 5].id, damaged: false, initial: random() % 4 }));
  const solution = cells.map((c) => c.initial);
  path.forEach((i, n) => {
    const ds = [n ? direction(i, path[n - 1]) : 3, n === path.length - 1 ? 1 : direction(i, path[n + 1])];
    cells[i].shape = ds[0] % 2 === ds[1] % 2 ? 0 : 1;
    solution[i] = [0, 1, 2, 3].find((r) => ds.every((d) => ports(cells[i], r).includes(d)));
    cells[i].initial = (solution[i] + (random() >>> 12) % 4) % 4;
  });
  const hazards = [];
  path.forEach((i, n) => {
    const incoming = n ? direction(i, path[n - 1]) : 3;
    for (let r = 0; r < 4; r++) for (const d of ports(cells[i], r)) {
      const j = neighbor(i, d);
      if (ports(cells[i], r).includes(incoming) && j >= 0 && !path.includes(j) && !hazards.includes(j)) hazards.push(j);
    }
  });
  for (const j of hazards.slice(0, 3)) cells[j].damaged = true;
  if (!hazards.length) throw Error("Configuratie zonder relevante beschadiging.");
  if (ports(cells[0], cells[0].initial).includes(3)) cells[0].initial = [0, 1, 2, 3].find((r) => !ports(cells[0], r).includes(3));
  const checkpoints = Array.from({ length: phase + 1 }, (_, j) => path[Math.floor((j + 1) * path.length / (phase + 2))]);
  if (k === 1 && phase === 0) checkpoints[0] = 9;
  return { player, phase, phaseName: PHASES[phase].name, goal: PHASES[phase].goal, rows: 6, cols: 5, source: 0, target: 29, sourcePort: 3, targetPort: 1, checkpoints, cells, solution };
}
__name(config, "config");
function analyze(cfg, rotations) {
  const active = /* @__PURE__ */ new Set(), faults = /* @__PURE__ */ new Set(), breaks = [], queue = [];
  if (ports(cfg.cells[cfg.source], rotations[cfg.source]).includes(cfg.sourcePort)) {
    active.add(cfg.source);
    queue.push(cfg.source);
  }
  while (queue.length) {
    const i = queue.shift();
    for (const d of ports(cfg.cells[i], rotations[i])) {
      if (i === cfg.source && d === cfg.sourcePort || i === cfg.target && d === cfg.targetPort) continue;
      const j = neighbor(i, d);
      if (j < 0) {
        breaks.push({ i, d });
        continue;
      }
      if (cfg.cells[j].damaged) {
        faults.add(j);
        continue;
      }
      if (!ports(cfg.cells[j], rotations[j]).includes((d + 2) % 4)) {
        breaks.push({ i, d });
        continue;
      }
      if (!active.has(j)) {
        active.add(j);
        queue.push(j);
      }
    }
  }
  const checkpoints = cfg.checkpoints.map((i) => active.has(i));
  const output = active.has(cfg.target) && ports(cfg.cells[cfg.target], rotations[cfg.target]).includes(cfg.targetPort);
  let searches = 0;
  function waypointPath(i, visited, next) {
    if (++searches > 2e4) return false;
    const cp = cfg.checkpoints.indexOf(i);
    if (cp >= 0) {
      if (cp !== next) return false;
      next++;
    }
    if (i === cfg.target) return next === cfg.checkpoints.length && ports(cfg.cells[i], rotations[i]).includes(cfg.targetPort);
    for (const d of ports(cfg.cells[i], rotations[i])) {
      const j = neighbor(i, d);
      if (j < 0 || visited.has(j) || cfg.cells[j].damaged || !active.has(j) || !ports(cfg.cells[j], rotations[j]).includes((d + 2) % 4)) continue;
      visited.add(j);
      if (waypointPath(j, visited, next)) return true;
      visited.delete(j);
    }
    return false;
  }
  __name(waypointPath, "waypointPath");
  const waypointRoute = output && checkpoints.every(Boolean) && waypointPath(cfg.source, /* @__PURE__ */ new Set([cfg.source]), 0);
  return { active: [...active], faults: [...faults], breaks, checkpoints, output, waypointRoute, valid: waypointRoute && !faults.size };
}
__name(analyze, "analyze");
function fresh(now) {
  return { version: VERSION, archiveSignalLost: null, openedPhase: -1, releases: [], paused: false, online: false, onlineAt: null, requests: [], puzzles: Object.fromEntries(PLAYERS.map((player) => [player, { userId: null, phase: 0, waiting: false, history: [], rotations: config(player).cells.map((c) => c.initial), circuits: CIRCUITS.map(() => true), conditions: CIRCUITS.map(() => 100), incidents: [], last: now, completed: false, completedAt: null }])) };
}
__name(fresh, "fresh");
function upgrade(old, now) {
  const s = fresh(now);
  for (const player of PLAYERS) s.puzzles[player].userId = old.puzzles?.[player]?.userId ?? null;
  s.archiveSignalLost = true;
  s.previousVersion = old;
  return s;
}
__name(upgrade, "upgrade");
function settle(state, now) {
  for (const player of PLAYERS) {
    const p = state.puzzles[player], elapsed = Math.max(0, (now - p.last) / 1e3);
    if (state.openedPhase >= 0 && !state.paused && !p.completed && !state.online) CIRCUITS.forEach((c, k) => {
      const before = p.conditions[k], after = Math.max(0, Math.min(100, before + elapsed * (p.circuits[k] ? 100 / c.recovery : -100 / c.decay)));
      if (before > 0 && after === 0) p.incidents.push({ circuit: c.id, at: p.last + before * c.decay * 10, message: c.warning, phase: p.phase });
      p.conditions[k] = after;
    });
    p.last = now;
  }
  return state;
}
__name(settle, "settle");
function free(p) {
  return CIRCUITS.reduce((sum, c, k) => sum + (p.circuits[k] ? 0 : c.pu), 0);
}
__name(free, "free");
function readiness(s) {
  return PLAYERS.filter((player) => {
    const p = s.puzzles[player];
    return p.phase === 2 && p.history.length === 3 && p.completed && free(p) >= 3 && analyze(config(player, 2), p.rotations).valid;
  }).length;
}
__name(readiness, "readiness");
function encounter(s) {
  if (s.openedPhase < 0) return { phase: -1, nextPhase: 0, waiting: [], ready: true };
  const waiting = PLAYERS.filter((player) => s.puzzles[player].waiting && s.puzzles[player].phase === s.openedPhase);
  return { phase: s.openedPhase, nextPhase: s.openedPhase < 2 ? s.openedPhase + 1 : null, waiting, ready: s.openedPhase < 2 && waiting.length === 4 };
}
__name(encounter, "encounter");
function act(s, player, dm, b, now) {
  settle(s, now);
  if (["pause", "resume", "reset", "resetAll", "initialize", "upgrade", "release", "archives"].includes(b.action)) {
    if (!dm) throw Error("Alleen de Architect mag deze actie uitvoeren.");
    if (b.action === "pause") s.paused = true;
    if (b.action === "resume") s.paused = false;
    if (b.action === "upgrade") return s;
    if (b.action === "archives") {
      if (typeof b.lost !== "boolean") throw Error("Ongeldige archiefstatus.");
      if (!b.lost && (!s.online || readiness(s) !== 4)) throw Error("Initialiseer eerst de hoofdrelay voordat Archives wordt hersteld.");
      s.archiveSignalLost = b.lost;
    }
    if (b.action === "release") {
      const gate = encounter(s);
      if (!gate.ready || b.phase !== gate.nextPhase) throw Error("Alle vier spelers moeten de huidige fase afronden voordat de volgende kan worden vrijgegeven.");
      if (gate.nextPhase === 0) {
        s.openedPhase = 0;
        s.releases.push({ phase: 0, at: now });
        return s;
      }
      for (const name of PLAYERS) {
        const p2 = s.puzzles[name];
        if (p2.history.length !== s.openedPhase + 1 || !analyze(config(name, p2.phase), p2.rotations).valid || !p2.circuits.every(Boolean)) throw Error("De opgeslagen fasekalibraties zijn niet geldig.");
      }
      s.openedPhase++;
      s.releases.push({ phase: s.openedPhase, at: now });
      for (const name of PLAYERS) {
        const p2 = s.puzzles[name];
        p2.phase = s.openedPhase;
        p2.waiting = false;
        p2.rotations = config(name, p2.phase).cells.map((c) => c.initial);
      }
    }
    if (b.action === "resetAll") {
      const reset = fresh(now);
      for (const p2 of PLAYERS) reset.puzzles[p2].userId = s.puzzles[p2].userId;
      reset.previousVersion = s.previousVersion;
      reset.archiveSignalLost = true;
      return reset;
    }
    if (b.action === "reset") {
      if (!PLAYERS.includes(b.player)) throw Error("Onbekend subsystem.");
      const id = s.puzzles[b.player].userId;
      s.puzzles[b.player] = fresh(now).puzzles[b.player];
      s.puzzles[b.player].userId = id;
      s.online = false;
      s.onlineAt = null;
      s.archiveSignalLost = true;
    }
    if (b.action === "initialize") {
      if (readiness(s) !== 4) throw Error("Alle vier subsystemen moeten alle drie fases voltooien.");
      s.online = true;
      s.onlineAt ??= now;
    }
    return s;
  }
  if (!player) throw Error("Dit account heeft geen spelersmatrix.");
  if (s.openedPhase < 0) throw Error("De Architect heeft fase 1 nog niet vrijgegeven.");
  const p = s.puzzles[player], cfg = config(player, p.phase);
  if (s.paused || s.online || p.completed || p.waiting) throw Error("Subsystem vergrendeld: pauze, voltooiing of externe interventie.");
  if (b.phase !== p.phase) throw Error("Deze fase is gewijzigd. Vernieuw de console en probeer opnieuw.");
  if (b.action === "rotate") {
    if (!Number.isInteger(b.cell) || b.cell < 0 || b.cell >= 30) throw Error("Ongeldig knooppunt.");
    const c = cfg.cells[b.cell], column = b.cell % 5;
    if (c.damaged) throw Error("Fysieke leidingbreuk. Zoek een omweg.");
    if (p.circuits[column]) throw Error("Kolom onder spanning. Schakel " + CIRCUITS[column].name + " UIT voor onderhoud.");
    p.rotations[b.cell] = (p.rotations[b.cell] + 1) % 4;
  } else if (b.action === "toggle") {
    const k = CIRCUITS.findIndex((c) => c.id === b.circuit);
    if (k < 0 || typeof b.on !== "boolean") throw Error("Ongeldige schakelstand.");
    if (!b.on && p.circuits[k] && p.circuits.filter((on) => !on).length >= 2) throw Error("Onderhoudsbus vol: maximaal twee kolommen tegelijk vrijschakelen. Herstel eerst een circuit.");
    p.circuits[k] = b.on;
  } else if (b.action === "advance" || b.action === "complete") {
    if (!analyze(cfg, p.rotations).valid) throw Error("Verbind bron, alle controlepunten en uitgang zonder beschadigde leiding.");
    if (p.phase < 2) {
      if (b.action !== "advance") throw Error("Voltooi eerst de aanvoer en het verdeelnet.");
      if (!p.circuits.every(Boolean) || p.conditions.some((v) => v < 60)) throw Error("Herstel alle circuits en laat elke conditie minimaal 60% bereiken voor fasekalibratie.");
      p.history.push({ phase: p.phase, at: now });
      if (p.phase < s.openedPhase) {
        p.phase++;
        p.rotations = config(player, p.phase).cells.map((c) => c.initial);
      } else p.waiting = true;
    } else {
      if (b.action !== "complete" || free(p) < 3) throw Error("De eindfase vereist minstens 3 PU vrij vermogen.");
      p.history.push({ phase: 2, at: now });
      p.completed = true;
      p.completedAt = now;
    }
  } else throw Error("Onbekende actie.");
  return s;
}
__name(act, "act");

// worker/frostgale.ts
var reply = /* @__PURE__ */ __name((body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }), "reply");
async function frostgale(request, db, user) {
  if (!user) return reply({ error: "Log in met je bestaande PrimeOS-account." }, 401);
  if (!["GET", "POST"].includes(request.method)) return reply({ error: "Methode niet toegestaan." }, 405);
  const dm = user.role === "architect";
  const username = String(user.username).trim().toLowerCase();
  if (!dm && !PLAYERS.includes(username)) return reply({ error: "Dit account heeft geen Frostgale-toegang." }, 403);
  let body = null;
  if (request.method === "POST") {
    if (request.headers.get("Origin") !== new URL(request.url).origin) return reply({ error: "Ongeldige herkomst." }, 403);
    if (!request.headers.get("Content-Type")?.startsWith("application/json")) return reply({ error: "JSON vereist." }, 415);
    if (Number(request.headers.get("Content-Length") || 0) > 2048) return reply({ error: "Verzoek te groot." }, 413);
    try {
      const raw = await request.text();
      if (raw.length > 2048) return reply({ error: "Verzoek te groot." }, 413);
      body = JSON.parse(raw);
    } catch {
      return reply({ error: "Ongeldig verzoek." }, 400);
    }
    if (!body || typeof body !== "object" || typeof body.requestId !== "string" || !/^[a-zA-Z0-9-]{10,80}$/.test(body.requestId)) return reply({ error: "Ongeldig verzoek." }, 400);
  }
  try {
    await db.prepare("INSERT OR IGNORE INTO frostgale_relay (id,revision,state) VALUES (1,0,?)").bind(JSON.stringify(fresh(Date.now()))).run();
    for (let attempt = 0; attempt < 5; attempt++) {
      const row = await db.prepare("SELECT revision,state FROM frostgale_relay WHERE id=1").first();
      let state = JSON.parse(row.state);
      const now = Date.now();
      let player = PLAYERS.find((p) => state.puzzles[p].userId === user.id) || null;
      if (!dm && !player) {
        const p = state.puzzles[username];
        if (p.userId !== null && p.userId !== user.id) return reply({ error: "Accountkoppeling komt niet overeen. Neem contact op met de Architect." }, 403);
        p.userId = user.id;
        player = username;
      }
      if (state.version !== VERSION) {
        if (body?.action === "upgrade" && dm) state = upgrade(state, now);
        else if (body) return reply({ error: "De Architect moet eerst de nieuwe puzzelversie activeren." }, 403);
        else return reply({ needsUpgrade: true, dm, player, version: VERSION, paused: true, online: state.online, readiness: 0, progress: PLAYERS.map((player2) => ({ player: player2, completed: false })), puzzle: null, overview: null, circuits: CIRCUITS, serverTime: now, revision: row.revision });
      }
      settle(state, now);
      const requestKey = body ? user.id + ":" + body.requestId : null;
      if (body && !state.requests.includes(requestKey)) {
        try {
          state = act(state, player, dm, body, now);
          state.requests.push(requestKey);
          state.requests = state.requests.slice(-256);
        } catch (e) {
          return reply({ error: e.message }, 400);
        }
      }
      const result = await db.prepare("UPDATE frostgale_relay SET state=?,revision=revision+1 WHERE id=1 AND revision=?").bind(JSON.stringify(state), row.revision).run();
      if (!result.meta.changes) continue;
      const present = /* @__PURE__ */ __name((p) => {
        const cfg = config(p, state.puzzles[p].phase);
        const { solution: _, ...publicCfg } = cfg;
        const puzzle = state.puzzles[p];
        return { waiting: puzzle.waiting, nextReleased: puzzle.phase < state.openedPhase, phase: puzzle.phase, history: puzzle.history, config: publicCfg, rotations: puzzle.rotations, circuits: puzzle.circuits, conditions: puzzle.conditions, incidents: dm ? puzzle.incidents : [], completed: puzzle.completed, free: free(puzzle), analysis: analyze(cfg, puzzle.rotations), last: puzzle.last };
      }, "present");
      return reply({ needsUpgrade: false, started: state.openedPhase >= 0, archiveSignalLost: state.archiveSignalLost ?? null, version: VERSION, revision: row.revision + 1, serverTime: now, paused: state.paused, online: state.online, onlineAt: state.onlineAt, dm, player, circuits: CIRCUITS, readiness: readiness(state), encounter: encounter(state), progress: PLAYERS.map((p) => ({ player: p, completed: state.puzzles[p].completed, phase: state.puzzles[p].phase, waiting: state.puzzles[p].waiting })), puzzle: player && state.openedPhase >= 0 ? present(player) : null, overview: dm ? PLAYERS.map((p) => ({ player: p, ...present(p) })) : null });
    }
    return reply({ error: "Console bezet. Probeer opnieuw." }, 409);
  } catch {
    return reply({ error: "Frostgale-opslag niet beschikbaar. Controleer de D1-migratie." }, 503);
  }
}
__name(frostgale, "frostgale");
async function frostgaleSignal(request, db) {
  if (request.method !== "GET") return reply({ error: "Methode niet toegestaan." }, 405);
  try {
    const row = await db.prepare("SELECT state FROM frostgale_relay WHERE id=1").first();
    const state = row ? JSON.parse(row.state) : null;
    return reply({ signalLost: state?.version === VERSION && typeof state.archiveSignalLost === "boolean" ? state.archiveSignalLost : null });
  } catch {
    return reply({ signalLost: null }, 503);
  }
}
__name(frostgaleSignal, "frostgaleSignal");

// worker/index.ts
var SESSION_COOKIE = "prime_session";
var SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;
var RESTRICTED_ARCHIVE_ROUTES = {
  "/04-factions/the-frequency": ["architect", "lumi"]
};
function normalizeArchivePath(pathname) {
  const normalized = pathname.replace(/\/+/g, "/").replace(/\/$/, "");
  return normalized || "/";
}
__name(normalizeArchivePath, "normalizeArchivePath");
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
    if (url.pathname === "/api/frostgale/signal") {
      return frostgaleSignal(request, env.DB);
    }
    if (url.pathname === "/api/frostgale") {
      return frostgale(request, env.DB, await getSessionUser(request, env));
    }
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
    if (url.pathname === "/api/messages/read-state" && request.method === "GET") {
      const user = await getSessionUser(
        request,
        env
      );
      if (!user) {
        return json({
          authenticated: false,
          read_message_ids: []
        });
      }
      const result = await env.DB.prepare(
        `
          SELECT message_id
          FROM message_reads
          WHERE user_id = ?
          ORDER BY read_at ASC
          `
      ).bind(user.id).all();
      return json({
        authenticated: true,
        read_message_ids: (result.results ?? []).map((row) => row.message_id).filter(
          (messageId) => typeof messageId === "string"
        )
      });
    }
    const messageReadMatch = url.pathname.match(
      /^\/api\/messages\/(MSG-\d+)\/read$/i
    );
    if (messageReadMatch && request.method === "POST") {
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
      const messageId = messageReadMatch[1].toUpperCase();
      await env.DB.prepare(
        `
          INSERT INTO message_reads (
            user_id,
            message_id
          )
          VALUES (?, ?)
          ON CONFLICT(user_id, message_id)
          DO UPDATE SET
            read_at = CURRENT_TIMESTAMP
          `
      ).bind(
        user.id,
        messageId
      ).run();
      return json({
        success: true,
        message_id: messageId,
        read: true
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
    const archivePath = normalizeArchivePath(url.pathname);
    const allowedUsers = RESTRICTED_ARCHIVE_ROUTES[archivePath];
    if (allowedUsers) {
      const user = await getSessionUser(request, env);
      const username = user?.username?.trim().toLowerCase() ?? "";
      if (!username || !allowedUsers.includes(username)) {
        return new Response("Not Found", {
          status: 404,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store"
          }
        });
      }
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

// .wrangler/tmp/bundle-Itdlwu/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-Itdlwu/middleware-loader.entry.ts
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
