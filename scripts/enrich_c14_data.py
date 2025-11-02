import json
import pandas as pd
import requests
import zipfile
import io
import os

def enrich_c14_data():
    """
    Enriches the C14/data/output_standardized.geojson file with data from the
    MedAfriCarbon dataset from Zenodo.
    """
    print("Starting data enrichment...")

    # --- Download and Extract ---
    print("Downloading MedAfriCarbon data from Zenodo...")
    url = "https://zenodo.org/records/3689716/files/data_v1.0.3.zip"
    try:
        r = requests.get(url)
        r.raise_for_status()
        z = zipfile.ZipFile(io.BytesIO(r.content))
    except requests.exceptions.RequestException as e:
        print(f"Error downloading data: {e}")
        return

    # --- Process Data ---
    print("Processing downloaded data...")
    try:
        with z.open('siteTable.csv') as site_file:
            site_table = pd.read_csv(site_file, dtype=str)
        with z.open('dateTable.csv') as date_file:
            date_table = pd.read_csv(date_file, dtype=str)
    except KeyError as e:
        print(f"Error: A required file was not found in the zip archive: {e}")
        return

    # Filter for sites in Morocco and Western Sahara
    morocco_sites = site_table[site_table['Country'].isin(['MA', 'EH'])]

    if morocco_sites.empty:
        print("No sites found for Morocco or Western Sahara in the dataset.")
        return

    # Merge date and site tables
    merged_data = pd.merge(date_table, morocco_sites, on='Site_ID')

    # --- Merge into GeoJSON ---
    print("Merging data into C14/data/output_standardized.geojson...")
    geojson_path = 'C14/data/output_standardized.geojson'
    with open(geojson_path, 'r') as f:
        geojson_data = json.load(f)

    existing_features = {
        feature['properties'].get('labnr'): feature
        for feature in geojson_data['features']
        if feature['properties'].get('labnr')
    }

    existing_sites = {feature['properties'].get('site') for feature in geojson_data['features']}

    new_samples_count = 0
    updated_samples_count = 0
    new_sites = set()

    # Mapping from MedAfriCarbon to our schema
    field_map = {
        'CRA': 'bp',
        'Error': 'std',
        'Material': 'material',
        'Species': 'species',
        'Site_Name': 'site',
        'Country': 'country'
    }

    for _, row in merged_data.iterrows():
        labnr = row.get('Lab_ID')
        if not labnr or pd.isna(labnr):
            continue

        site_name = row.get('Site_Name')

        if labnr in existing_features:
            # Update existing record
            feature = existing_features[labnr]
            properties = feature['properties']
            is_updated = False

            for source_field, dest_field in field_map.items():
                # Update only if the destination field is missing or empty
                is_missing = dest_field not in properties or properties[dest_field] is None or properties[dest_field] == ""
                if is_missing and source_field in row and pd.notna(row[source_field]):
                    properties[dest_field] = row[source_field]
                    is_updated = True

            if is_updated:
                updated_samples_count += 1

        else:
            # Add new record
            new_samples_count += 1
            if site_name not in existing_sites:
                new_sites.add(site_name)

            # Handle coordinates
            lon = row.get('Decimal_Degrees_Long')
            lat = row.get('Decimal_Degrees_Lat')
            geometry = None
            if pd.notna(lon) and pd.notna(lat):
                geometry = {
                    "type": "Point",
                    "coordinates": [float(lon), float(lat)]
                }

            new_feature = {
                "type": "Feature",
                "properties": {
                    "labnr": labnr,
                    "bp": int(float(row['CRA'])) if pd.notna(row.get('CRA')) else None,
                    "std": int(float(row['Error'])) if pd.notna(row.get('Error')) else None,
                    "material": row.get('Material'),
                    "species": row.get('Species'),
                    "site": site_name,
                    "country": row.get('Country'),
                },
                "geometry": geometry
            }
            geojson_data['features'].append(new_feature)

    with open(geojson_path, 'w') as f:
        json.dump(geojson_data, f, indent=2)

    print("\n--- Enrichment Report ---")
    print(f"New sites added: {len(new_sites)}")
    print(f"New samples added: {new_samples_count}")
    print(f"Existing samples updated: {updated_samples_count}")
    print("-------------------------\n")
    print("Data enrichment complete.")

if __name__ == '__main__':
    enrich_c14_data()
