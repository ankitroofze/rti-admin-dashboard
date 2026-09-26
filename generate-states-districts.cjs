const fs = require("fs");
const { getAllStatesWithDistricts } = require("india-states-districts");

const data = getAllStatesWithDistricts();

fs.writeFileSync(
  "./src/data/statesDistricts.json",
  JSON.stringify(data, null, 2)
);

console.log("✅ Done:", data.length, "states/UTs written to src/data/statesDistricts.json");