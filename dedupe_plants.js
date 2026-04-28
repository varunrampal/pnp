const fs = require('fs');
const path = require('path');
const inputPath = path.join(__dirname, 'src', 'json', 'PlantsList.json');
const outputPath = path.join(__dirname, 'src', 'json', 'PlantsList_Deduped.json');

const raw = fs.readFileSync(inputPath, 'utf8');
const plants = JSON.parse(raw);
const seen = new Set();
const deduped = [];
let duplicates = 0;

for (const plant of plants) {
  const name = (plant.Name || '').trim();
  if (!seen.has(name)) {
    seen.add(name);
    deduped.push(plant);
  } else {
    duplicates += 1;
  }
}

fs.writeFileSync(outputPath, JSON.stringify(deduped, null, 4), 'utf8');
console.log(`Total entries: ${plants.length}`);
console.log(`Unique names kept: ${deduped.length}`);
console.log(`Duplicates removed: ${duplicates}`);
console.log(`Output written to ${outputPath}`);
