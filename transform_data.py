import pandas as pd
import json

def create_geojson_feature(row):
    """Creates a GeoJSON feature from a row of the merged data."""
    feature = {
        "type": "Feature",
        "properties": {
            "labnr": row["Lab_ID"],
            "bp": row["CRA"],
            "std": row["Error"],
            "site": row["Site_Name"],
            "country": row["Country"],
            "material": row["Material"],
            "species": row["Species"],
        },
        "geometry": {
            "type": "Point",
            "coordinates": [row["Decimal_Degrees_Long"], row["Decimal_Degrees_Lat"]]
        }
    }
    return feature

def main():
    # Read the data
    date_df = pd.read_csv("dateTable.csv")
    site_df = pd.read_csv("siteTable.csv")

    # Merge the data
    merged_df = pd.merge(date_df, site_df, on="Site_ID")

    # Filter for Morocco
    morocco_df = merged_df[merged_df["Country"] == "MA"]

    # Create GeoJSON features
    features = [create_geojson_feature(row) for _, row in morocco_df.iterrows()]

    # Assemble GeoJSON FeatureCollection
    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }

    # Save to file
    with open("new_data.json", "w") as f:
        json.dump(feature_collection, f, indent=2)

if __name__ == "__main__":
    main()
