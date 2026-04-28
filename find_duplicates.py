import json

# Load the JSON file
with open('c:\\Apps\\pnp\\src\\json\\PlantsList.json', 'r', encoding='utf-8') as f:
    plants = json.load(f)

# Find duplicates by Name
name_counts = {}
duplicates = []

for plant in plants:
    name = plant.get('Name', '')
    if name in name_counts:
        name_counts[name] += 1
        if name not in duplicates:
            duplicates.append(name)
    else:
        name_counts[name] = 1

print("Duplicate Plant Names Found:")
print("=" * 30)

if not duplicates:
    print("No duplicate plant names found!")
else:
    for name in duplicates:
        count = name_counts[name]
        ids = [plant['id'] for plant in plants if plant.get('Name') == name]
        print(f"Name: {name}")
        print(f"Count: {count}")
        print(f"IDs: {', '.join(map(str, ids))}")
        print("-" * 20)

print(f"\nTotal unique plants: {len(plants)}")
print(f"Total duplicate names: {len(duplicates)}")