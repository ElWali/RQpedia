---

# AGENTS.md
**RQpedia — Archaeological Data Infrastructure for Morocco**

---

## Project Scope

RQpedia is a lightweight, open-access, academic-grade platform for the exploration and dissemination of radiocarbon and typological dating data from **archaeological sites in Morocco**. The project is currently scoped exclusively to Moroccan sites, with future expansion to pan-African contexts contingent on validation, scalability, and scholarly feedback.

A **new edition**, codenamed **C14**, is now in development. This edition will:
- Be hosted in a **new, independent directory** named `C14`
- Contain **only English-language content**
- Be **completely decoupled** from the previous implementation (`/FinalVersion`)
- Preserve and apply all prior learnings, design insights, and technical decisions from earlier work to ensure continuity of quality and academic rigor

> **Action Required**: Please create a new directory `C14` at the root of the repository to host this new edition. Do **not** reuse or reference the `/FinalVersion` directory.

---

## Design & UX Principles

### Academic Audience First
RQpedia is designed **exclusively for researchers, archaeologists, heritage professionals, and graduate students**—not for general public or amateur audiences. All UI/UX decisions prioritize:
- **Data fidelity** over visual flair
- **Precision** in chronometric and typological representation
- **Reproducibility** through transparent data provenance
- **Citation readiness** via structured references

### Language Policy
- **English only** (no French or Arabic support in the C14 edition)
- All interface text, metadata labels, and documentation will be in English
- This simplifies maintenance and focuses resources on core data quality and usability

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

> **Note**: The C14 edition will **not implement client-side data fetching logic** from external or dynamic sources. All data will be **statically embedded or loaded once** at build or load time, with no runtime query infrastructure.

---

## Implementation Standards

### Zero Placeholder Policy
- **No mock data**, **no TODOs**, **no simplified logic**
- Every function handles edge cases: empty arrays, missing properties, network errors
- All user-facing text is **localized**, **accessible**, and **semantically structured**
→ *In C14: “localized” means consistent, clear English only*

### Professional Code Quality
- **Vanilla JavaScript** (ES6+), no frameworks
- **Modular, readable functions** with clear responsibilities
- **Error boundaries**: Graceful degradation on data or runtime failure
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
- **Versioned releases**: Each stable iteration is tagged (e.g., `v1.0-c14-morocco`)
- **Contribution workflow**: Community submissions via GitHub Issues → manual curation → inclusion in dataset

> **Critical Reminder**: As you build the `C14` directory, **document and preserve all key learnings, architectural decisions, and user feedback** from prior work. These insights are essential to the success of the new edition—even if the code is rewritten from scratch.

---

> **“RQpedia is not a database—it is a scholarly interface to the evolving chronology of human presence in Morocco.”**
> — RQpedia Design Manifesto

---

*This document governs all development, design, and data decisions for the RQpedia C14 edition.*
