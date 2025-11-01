
import json

def standardize_and_merge():
    # Load the existing GeoJSON data
    with open('C14/data/output_full.geojson', 'r') as f:
        geojson_data = json.load(f)

    # Standardize the existing features
    for feature in geojson_data['features']:
        properties = feature['properties']

        # Create the 'dates' list if it doesn't exist
        if 'dates' not in properties:
            properties['dates'] = []

        # Move the C14 data into the 'dates' list
        if 'bp' in properties and properties['bp'] is not None:
            properties['dates'].append({
                'dating_method': 'C14',
                'age': properties['bp'],
                'error': properties.get('std'),
                'unit': 'BP'
            })

        # Remove the old properties
        for prop in ['bp', 'std', 'cal_bp', 'cal_std']:
            if prop in properties:
                del properties[prop]

    # Jebel Irhoud data
    jebel_irhoud_data = {
      "site": "Jebel Irhoud",
      "latitude": 31.85,
      "longitude": -8.883333,
      "site_type": "Cave",
      "country": "Morocco",
      "dates": [
        {
          "dating_method": "OSL",
          "reference": "Hublin et al. 2017 (Nature)",
          "laboratory": "Oxford Luminescence Laboratory, UK",
          "material": "Sediment (quartz & K-feldspar grains)",
          "samples": "15+ samples from multiple horizons",
          "age": 300.0,
          "error": 30.0,
          "unit": "ka"
        },
        {
          "dating_method": "TL",
          "reference": "Grün & Stringer (1991), Blackwell et al. (1992)",
          "laboratory": "Wollongong University, Australia",
          "material": "Burned/heated flint artifacts, pottery",
          "samples": "8-12 samples",
          "age": 255.0,
          "error": 45.0,
          "unit": "ka"
        },
        {
          "dating_method": "U-Series",
          "material": "Tooth enamel (primary), bone, calcite",
          "reference": "Grün et al. (2007)",
          "laboratory": "Multiple: Wollongong, Oxford, ANU",
          "age": 375.0,
          "error": 125.0,
          "unit": "ka"
        },
        {
          "dating_method": "ESR",
          "material": "Tooth enamel and dentin",
          "samples": "4-6 tooth specimens",
          "laboratory": "Wollongong University (Rainer Grün)",
          "reference": "Grün et al. (1998, 2007)",
          "age": 290.0,
          "error": 50.0,
          "unit": "ka"
        },
        {
          "dating_method": "AAR",
          "material": "Bone, tooth, shell, eggshell",
          "age": 100.0,
          "error": 50.0,
          "unit": "ka"
        }
      ]
    }

    # Create a new GeoJSON feature for Jebel Irhoud
    jebel_irhoud_feature = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [jebel_irhoud_data['longitude'], jebel_irhoud_data['latitude']]
        },
        'properties': {
            'site': jebel_irhoud_data['site'],
            'country': jebel_irhoud_data['country'],
            'site_type': jebel_irhoud_data['site_type'],
            'dates': jebel_irhoud_data['dates']
        }
    }

    # Add the new feature to the GeoJSON data
    geojson_data['features'].append(jebel_irhoud_feature)

    # Save the updated GeoJSON data
    with open('C14/data/output_standardized.geojson', 'w') as f:
        json.dump(geojson_data, f, indent=2)

if __name__ == '__main__':
    standardize_and_merge()
    print("Standardization and merge complete. New file created at C14/data/output_standardized.geojson")
