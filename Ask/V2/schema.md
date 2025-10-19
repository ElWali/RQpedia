# RQpedia Database Schema

This document outlines the database schema for the RQpedia project, as inferred from the application code and the official documentation at [database](./database).

The schema is centered around the concept of an **archaeological object** (`arch_object`), which represents a dated artifact or sample with archaeological context.

## Main Entity: `arch_object`

This is the central table in the database, where each row corresponds to a single archaeological object or sample. In the context of the web application, this corresponds to each object in the `output.json` array.

| Field | Data Type | Description |
|---|---|---|
| `id` | Integer | Unique identifier for the record. |
| `site` | String | Name of the archaeological site. |
| `country` | String | Country where the site is located. |
| `lat` | Float | Latitude of the site in decimal degrees. |
| `lng` | Float | Longitude of the site in decimal degrees. |
| `feature` | String | Description of the archaeological feature. |
| `feature_type` | String | Type of the archaeological feature. |
| `material` | String | The material of the sample (e.g., charcoal, bone). |
| `species` | String | The species of the sample. |

## Radiocarbon Dates (`c14_measurement`)

Radiocarbon dates are linked to an `arch_object`. A single object can have multiple C14 measurements.

| Field | Data Type | Description |
|---|---|---|
| `labnr` | String | The unique laboratory number for the sample. |
| `bp` | Integer | Radiocarbon age in years Before Present (BP). |
| `std` | Integer | Standard deviation of the radiocarbon age. |
| `cal_bp_start`| Integer | The start of the calibrated age range in cal BP. |
| `cal_bp_end` | Integer | The end of the calibrated age range in cal BP. |

In `output.json`, C14 data is sometimes stored in a doubly-stringified JSON field called `c14`.

## Typological Dates (`typochronological_unit` and `period`)

Typological dates are also linked to an `arch_object`.

| Field | Data Type | Description |
|---|---|---|
| `periode` | String | The name of the typological period (e.g., "Neolithic"). |

In `output.json`, this information is stored in the `periods` and `typochronological_units` fields, which are doubly-stringified JSON arrays.

## References

Bibliographic references are associated with archaeological objects.

| Field | Data Type | Description |
|---|---|---|
| `reference` | String | The full bibliographic citation. |

In `output.json`, references are stored in the `reference` field as a doubly-stringified JSON array.
