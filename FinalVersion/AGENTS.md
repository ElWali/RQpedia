# AGENTS.md  
**RQpedia — Archaeological Data Infrastructure for Morocco**

---

## Project Scope

RQpedia is a lightweight, open-access, academic-grade platform for the exploration and dissemination of radiocarbon and typological dating data from **archaeological sites in Morocco**. The project is currently scoped exclusively to Moroccan sites, with future expansion to pan-African contexts contingent on validation, scalability, and scholarly feedback.

The entire functional core of RQpedia resides in a single directory:  
**`/FinalVersion`** within the [`RQpedia`](https://github.com/ElWali/RQpedia) repository.

This directory contains **exactly three production-grade files**:

| File | Role |
|------|------|
| `DataXplorer.html` | Interactive data discovery interface with map, filters, search, and preview |
| `Profile.html` | Dynamic, single-page site profile renderer (parameter-driven) |
| `Output_full.json` | Canonical, unified GeoJSON dataset containing all measurements and metadata |

No additional HTML, JSON, or configuration files are used. The system is **self-contained**, **zero-build**, and **statically deployable**.

---

## Design & UX Principles

### Academic Audience First
RQpedia is designed **exclusively for researchers, archaeologists, heritage professionals, and graduate students**—not for general public or amateur audiences. All UI/UX decisions prioritize:
- **Data fidelity** over visual flair
- **Precision** in chronometric and typological representation
- **Reproducibility** through transparent data provenance
- **Citation readiness** via structured references

### Bilingual + Trilingual Support (EN/FR/AR)
- Full interface localization in **English**, **French**, and **Arabic**
- Arabic support includes **right-to-left (RTL) layout**, proper typography, and culturally appropriate terminology
- Language preference is persisted via `localStorage` and URL parameters (`?lang=ar`)
- All translations are **curated by domain experts**, not machine-generated

### Responsive Dual-Skin Architecture
RQpedia implements a **mobile-first, desktop-optimized** responsive strategy:
- **Mobile skin**: Prioritizes vertical flow, touch targets ≥48px, condensed typography, and minimal horizontal scrolling
- **Desktop skin**: Enables side-by-side map/data layout, richer typography (Inter font stack), and advanced interaction (hover states, keyboard nav)
- Breakpoint: `768px` (tablet portrait)
- No separate code paths—**one codebase, two adaptive skins**

---

## Data Architecture

### Unified Canonical Dataset (`Output_full.json`)
- Format: Valid `FeatureCollection` GeoJSON (RFC 7946)
- Each `Feature` represents **one measurement** (radiocarbon, TL, ESR, typological inference)
- Schema fields:
  - `geometry`: `{ type: "Point", coordinates: [lng, lat] }`
  - `properties`:
    - `labnr`, `bp`, `std`, `delta_c13`
    - `material`, `species`
    - `site`, `country` (ISO 3166-1 alpha-2)
    - `periods`: array of cultural/chronological phases
    - `references`: array of citation strings (e.g., `"Linstädter 2016"`, `"CalPal2022"`)
- **No placeholders, nulls, or dummy data**—every field is validated and populated from primary sources
- Provenance tracking via reference to source databases: **MedAfriCarbon**, **p3k14c**, **BDA**, **CalPal**

### Data Fetching & Handling
- **Single HTTP request**: `Output_full.json` is loaded once at startup (≈300–500 KB)
- **Client-side filtering**: All queries (site, material, period, country) are executed in-memory—**no server round-trips**
- **Robust parsing**: Defensive handling of malformed or missing fields (e.g., `references` as `null` → treated as empty array)
- **No external dependencies** beyond Leaflet and browser APIs

---

## Implementation Standards

### Zero Placeholder Policy
- **No mock data**, **no TODOs**, **no simplified logic**
- Every function handles edge cases: empty arrays, missing properties, network errors
- All user-facing text is **localized**, **accessible**, and **semantically structured**

### Professional Code Quality
- **Vanilla JavaScript** (ES6+), no frameworks
- **Modular, readable functions** with clear responsibilities
- **Error boundaries**: Graceful degradation on data or network failure
- **Performance optimized**: Map clustering, DOM batching, and efficient array operations

### Academic Integrity
- **Dates are never altered**: `bp` and `std` reflect original publications
- **Typological units** are preserved as reported (e.g., `"Iberomaurusian"`, `"Néolithique ancien"`)
- **Bibliographic references** are displayed verbatim for accurate citation

---

## Current Focus: Morocco-Only Validation

RQpedia is **intentionally constrained to Moroccan sites** until:
1. Data schema is validated by North African archaeologists
2. Typological period harmonization is peer-reviewed
3. Performance and UX are benchmarked against academic tools (e.g., **OxCal**, **CALPAL**, **Arches**)

**No global sites will be added** until this phase is complete. The platform must first achieve **excellence in depth** before pursuing **breadth**.

---

## Deployment & Maintenance

- **Static hosting only**: GitHub Pages, Netlify, or institutional servers
- **Versioned releases**: Each stable iteration is tagged (e.g., `v1.0-morocco-core`)
- **Contribution workflow**: Community submissions via GitHub Issues → manual curation → inclusion in `Output_full.json`

---

> **“RQpedia is not a database—it is a scholarly interface to the evolving chronology of human presence in Morocco.”**  
> — RQpedia Design Manifesto

--- 

*This document governs all development, design, and data decisions for the RQpedia `FinalVersion`.*
