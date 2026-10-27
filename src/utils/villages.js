import districtBlocks from "../data/districtBlocks.json";

// stateCode -> Promise<{ [blockCode]: string[] }>  (ek baar load hone ke baad cache me rehta hai)
const stateCache = new Map();

const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

// District + Taluka ke naam se districtBlocks.json ka block dhoondho
// (Taluka dropdown bhi isi file se banta hai, isliye naam hamesha match hota hai)
const findBlock = (district, taluka) => {
  if (!district || !taluka) return null;
  for (const d of districtBlocks) {
    if (!same(d.name, district)) continue;
    const block = d.blockList.find((b) => same(b.name, taluka));
    if (block) return { stateCode: String(d.stateCode), blockCode: String(block.code) };
  }
  return null;
};

const loadState = (stateCode) => {
  if (!stateCache.has(stateCode)) {
    const url = `${import.meta.env.BASE_URL}data/villages/${stateCode}.json`;
    const request = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Villages file not found: ${url}`);
        return res.json();
      })
      .catch((err) => {
        stateCache.delete(stateCode); // fail hua to dobara try ho sake
        throw err;
      });
    stateCache.set(stateCode, request);
  }
  return stateCache.get(stateCode);
};

/** Selected district + taluka ke villages (sorted names). Data na mile to [] */
export const getVillagesByTaluka = async (district, taluka) => {
  const found = findBlock(district, taluka);
  if (!found) return [];
  const data = await loadState(found.stateCode);
  return data[found.blockCode] || [];
};