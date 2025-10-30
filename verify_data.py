import json

def main():
    with open("C14/data/Output_full.json", "r") as f:
        try:
            data = json.load(f)
            print("Successfully loaded C14/data/Output_full.json")
            print(f"Total features: {len(data['features'])}")
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")

if __name__ == "__main__":
    main()
