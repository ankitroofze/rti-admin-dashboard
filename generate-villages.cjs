const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CSV_FILE = path.join(__dirname, "village-directory.csv");
const BLOCKS_FILE = path.join(__dirname, "src/data/districtBlocks.json");
const OUT_DIR = path.join(__dirname, "public/data/villages");

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const similarity = (a, b) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const grams = (s) => {
    const m = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2);
      m.set(g, (m.get(g) || 0) + 1);
    }
    return m;
  };
  const ga = grams(a);
  const gb = grams(b);
  let hit = 0;
  for (const [g, c] of ga) if (gb.has(g)) hit += Math.min(c, gb.get(g));
  return (2 * hit) / (a.length + b.length - 2);
};

const parseLine = (line) => {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else q = false;
      } else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
};

(async () => {
  const districtBlocks = JSON.parse(fs.readFileSync(BLOCKS_FILE, "utf8").replace(/^\uFEFF/, ""));

  const dbBlocks = [];
  for (const d of districtBlocks) {
    for (const b of d.blockList) {
      dbBlocks.push({ stateCode: String(d.stateCode), district: d.name, name: b.name, code: String(b.code) });
    }
  }
  const dbBlockCodes = new Set(dbBlocks.map((b) => b.code));

  const rows = [];
  const rl = readline.createInterface({ input: fs.createReadStream(CSV_FILE, "utf8"), crlfDelay: Infinity });
  let first = true;
  for await (const raw of rl) {
    if (first) { first = false; continue; }
    const line = raw.replace(/^\uFEFF/, "");
    if (!line.trim()) continue;
    const c = parseLine(line);
    const village = (c[10] || "").trim();
    if (!village) continue;
    rows.push({
      csvState: c[0],
      district: c[4] || "",
      subdistrict: c[7] || "",
      village,
      blockCode: (c[15] || "").trim(),
      blockName: c[16] || "",
    });
  }
  console.log("CSV villages:", rows.length);

  const byBlock = new Map();
  const add = (code, v) => {
    if (!byBlock.has(code)) byBlock.set(code, new Set());
    byBlock.get(code).add(v);
  };
  const csvStateOfBlock = new Map();
  for (const r of rows) {
    if (r.blockCode && dbBlockCodes.has(r.blockCode)) {
      add(r.blockCode, r.village);
      csvStateOfBlock.set(r.blockCode, r.csvState);
    }
  }

  const stateMap = new Map();
  for (const b of dbBlocks) {
    const cs = csvStateOfBlock.get(b.code);
    if (!cs) continue;
    if (!stateMap.has(b.stateCode)) stateMap.set(b.stateCode, new Set());
    stateMap.get(b.stateCode).add(cs);
  }
  const nameIndex = new Map();
  const indexRow = (key, r) => {
    let m = nameIndex.get(key);
    if (!m) nameIndex.set(key, (m = new Map()));
    const dn = norm(r.district);
    if (!m.has(dn)) m.set(dn, []);
    m.get(dn).push(r.village);
  };
  for (const r of rows) {
    if (r.blockName) indexRow(`${r.csvState}|${norm(r.blockName)}`, r);
    if (r.subdistrict) indexRow(`${r.csvState}|${norm(r.subdistrict)}`, r);
  }

  let fallbackHit = 0;
  const unmatched = [];
  for (const b of dbBlocks) {
    if (byBlock.has(b.code)) continue;
    const csvStates = stateMap.get(b.stateCode) || new Set();
    const bn = norm(b.name);
    const dn = norm(b.district);
    let best = null;
    let bestScore = 0;
    for (const cs of csvStates) {
      const m = nameIndex.get(`${cs}|${bn}`);
      if (!m) continue;
      for (const [csvDistrict, villages] of m) {
        const score = m.size === 1 ? Math.max(0.61, similarity(dn, csvDistrict)) : similarity(dn, csvDistrict);
        if (score > bestScore) { bestScore = score; best = villages; }
      }
    }
    if (best && bestScore >= 0.6) {
      best.forEach((v) => add(b.code, v));
      fallbackHit++;
    } else {
      unmatched.push(`${b.district} / ${b.name}`);
    }
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const byState = new Map();
  for (const b of dbBlocks) {
    const set = byBlock.get(b.code);
    if (!set || !set.size) continue;
    if (!byState.has(b.stateCode)) byState.set(b.stateCode, {});
    byState.get(b.stateCode)[b.code] = [...set].sort((x, y) => x.localeCompare(y, "en", { sensitivity: "base" }));
  }
  let total = 0;
  for (const [stateCode, data] of byState) {
    fs.writeFileSync(path.join(OUT_DIR, `${stateCode}.json`), JSON.stringify(data));
    for (const k of Object.keys(data)) total += data[k].length;
  }

  console.log(`✅ ${byState.size} state files -> public/data/villages/`);
  console.log(`   blocks matched by code: ${dbBlocks.length - unmatched.length - fallbackHit}, by name: ${fallbackHit}, no villages: ${unmatched.length}`);
  console.log(`   total villages written: ${total}`);
})();