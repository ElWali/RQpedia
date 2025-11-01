import json
import re
from bs4 import BeautifulSoup

def parse_v2_html(filepath):
    """
    Parses the v2.html file to extract dating information for Jebel Irhoud.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    dating_methods_data = []

    dating_method_divs = soup.find_all('div', class_='dating-method')

    # Mapping from class name to proper dating_method name
    class_to_method = {
        'osl': 'OSL',
        'tl': 'TL',
        'uranium': 'U-Series',
        'esr': 'ESR',
        'paleomag': 'Paleomagnetic',
        'aar': 'AAR'
    }

    for method_div in dating_method_divs:
        method_data = {}

        # Extract method from class name
        method_class = [c for c in method_div['class'] if c != 'dating-method']
        if not method_class:
            continue

        method_key = method_class[0]
        method_name = class_to_method.get(method_key)
        if not method_name:
            continue # Skip if it's a method we don't want (like C14)

        method_data['dating_method'] = method_name

        data_rows = method_div.find_all('div', class_='data-row')
        age_info = {}

        for row in data_rows:
            label_element = row.find('span', class_='data-label')
            value_element = row.find('span', class_='data-value')
            if not label_element or not value_element:
                continue

            label = label_element.get_text(strip=True).replace(':', '')
            value = value_element.get_text(strip=True)

            if 'age' in label.lower():
                age_info[label] = value
            elif 'reference' in label.lower():
                method_data['reference'] = value
            elif 'material' in label.lower():
                method_data['material'] = value
            elif 'laboratory' in label.lower():
                method_data['laboratory'] = value
            elif 'samples' in label.lower():
                method_data['samples'] = value


        # Logic to extract age and error
        age = None
        error = None
        unit = 'ka' # Default unit

        # Prioritize which age field to use
        age_text = ""
        if 'Primary Age' in age_info:
            age_text = age_info['Primary Age']
        elif 'Mean Age' in age_info:
            age_text = age_info['Mean Age']
        elif 'Preferred Age' in age_info:
            age_text = age_info['Preferred Age']
        elif 'Age Estimates' in age_info:
             age_text = age_info['Age Estimates']
        elif 'Age Range' in age_info:
            age_text = age_info['Age Range']
        elif 'Effective Age Range' in age_info:
            age_text = age_info['Effective Age Range']

        # Regex to find age ± error
        matches_pm = re.findall(r'(\d+\.?\d*)\s*±\s*(\d+\.?\d*)', age_text)
        # Regex to find age ranges like "190 - 320"
        matches_range = re.findall(r'(\d+\.?\d*)\s*-\s*(\d+\.?\d*)', age_text)

        if matches_pm:
            age = float(matches_pm[0][0])
            error = float(matches_pm[0][1])
        elif matches_range:
            lower = float(matches_range[0][0])
            upper = float(matches_range[0][1])
            age = (lower + upper) / 2
            error = (upper - lower) / 2
        else:
            # Try to find a single age number if no ± or range is present
            single_age_match = re.search(r'(\d+\.?\d*)', age_text)
            if single_age_match:
                age = float(single_age_match.group(1))
                error = 0 # Assume no error if not specified

        method_data['age'] = age
        method_data['error'] = error
        method_data['unit'] = unit

        # Only add if we successfully extracted an age
        if age is not None:
            dating_methods_data.append(method_data)

    return dating_methods_data

if __name__ == "__main__":
    extracted_data = parse_v2_html('C14/v2.html')
    # Add site-level information
    jebel_irhoud_site = {
        "site": "Jebel Irhoud",
        "latitude": 31.483,
        "longitude": -8.867,
        "elevation": 585, # Average of 520-650m
        "dates": extracted_data
    }

    # This will be used later to generate GeoJSON features
    print(json.dumps(jebel_irhoud_site, indent=2))
