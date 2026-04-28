import json
from collections import defaultdict

# Load the JSON file
with open('c:\\Apps\\pnp\\src\\json\\PlantsList.json', 'r', encoding='utf-8') as f:
    plants = json.load(f)

print(f"Total plants before cleanup: {len(plants)}")

# Find duplicates by Name
name_to_plants = defaultdict(list)
for plant in plants:
    name = plant.get('Name', '').strip()  # Strip whitespace to catch trailing spaces
    name_to_plants[name].append(plant)

# Identify duplicates
duplicates_found = []
unique_plants = []

for name, plant_list in name_to_plants.items():
    if len(plant_list) > 1:
        duplicates_found.append((name, len(plant_list), [p['id'] for p in plant_list]))
        # Keep the first occurrence, remove others
        unique_plants.append(plant_list[0])
    else:
        unique_plants.append(plant_list[0])

print(f"Duplicates found: {len(duplicates_found)}")
for name, count, ids in duplicates_found:
    print(f"  {name}: {count} entries (IDs: {ids})")

print(f"Total plants after cleanup: {len(unique_plants)}")

# Save the cleaned file
with open('c:\\Apps\\pnp\\src\\json\\PlantsList_Cleaned.json', 'w', encoding='utf-8') as f:
    json.dump(unique_plants, f, indent=4, ensure_ascii=False)

print("Cleaned file saved as PlantsList_Cleaned.json")