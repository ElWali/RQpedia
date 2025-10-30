import json

def main():
    # Load the existing data
    with open("C14/data/Output_full.json", "r") as f:
        existing_data = json.load(f)

    # Load the new data
    with open("new_data.json", "r") as f:
        new_data = json.load(f)

    # Create a set of existing lab numbers for efficient lookup
    existing_labnrs = {feature["properties"]["labnr"] for feature in existing_data["features"]}

    # Add new, unique features to the existing data
    for feature in new_data["features"]:
        if feature["properties"]["labnr"] not in existing_labnrs:
            existing_data["features"].append(feature)

    # Write the merged data back to the file
    with open("C14/data/Output_full.json", "w") as f:
        json.dump(existing_data, f, indent=2)

if __name__ == "__main__":
    main()
