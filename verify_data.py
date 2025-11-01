import json

def main():
    with open("C14/data/output_full.geojson", "r") as f:
        try:
            data = json.load(f)
            print("Successfully loaded C14/data/output_full.geojson")
            print(f"Total features: {len(data['features'])}")
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")

if __name__ == "__main__":
    main()
