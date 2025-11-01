# RQpedia C14 Edition: Development Mandate

## 1. Project Overview

**RQpedia** is a specialized, open-access platform for disseminating radiocarbon and typological dating data from Moroccan archaeological sites. It serves a scholarly audience and prioritizes data integrity and academic rigor.

The **C14 Edition** is the next iteration of this platform. It will be developed in a new, independent `C14/` directory and will be a complete rewrite, decoupled from the legacy `/FinalVersion` implementation. This edition will be exclusively in English.

## 2. Core Principles

### 2.1. Audience and UX
-   **Primary Audience**: The platform is engineered for researchers, archaeologists, heritage professionals, and graduate students.
-   **Design Philosophy**: UI/UX decisions will favor data fidelity, precision, reproducibility, and citation readiness over aesthetic appeal.

### 2.2. Language and Content
-   **Language**: English is the sole language for the C14 edition. All UI text, metadata, and documentation will be in English.
-   **Content Scope**: The project is strictly limited to archaeological sites in Morocco. Expansion to other regions is deferred until the Moroccan implementation is validated and peer-reviewed.

### 2.3. Technical Architecture
-   **Technology Stack**: The C14 edition will be built with vanilla JavaScript (ES6+), HTML5, and CSS3. No external frameworks are to be used.
-   **Responsive Design**: A mobile-first, single-codebase responsive strategy will be implemented.
    -   **Mobile Viewport**: Optimized for vertical flow, touch targets (≥48px), and condensed typography.
    -   **Desktop Viewport**: (≥768px) Optimized for side-by-side map/data layouts and advanced interactions.

## 3. Data Architecture

### 3.1. Canonical Dataset
-   **Source**: All data will be sourced from a single, canonical `output_full.geojson` file.
-   **Format**: The dataset must be a valid GeoJSON `FeatureCollection` (RFC 7946).
-   **Data Integrity**: Every feature must be a validated measurement from a primary source (e.g., MedAfriCarbon, p3k14c, BDA, CalPal). No placeholders, nulls, or dummy data are permitted.

### 3.2. Data Loading
-   **Method**: All data will be statically embedded or loaded at runtime. No client-side fetching from external APIs or dynamic sources will be implemented.

## 4. Implementation Standards

### 4.1. Code Quality
-   **Modularity**: Code should be organized into modular, single-responsibility functions.
-   **Error Handling**: Implement graceful degradation for all potential data or runtime failures.
-   **Performance**: Optimize for performance through techniques such as map clustering and efficient DOM manipulation.
-   **Zero Placeholder Policy**: No mock data, TODOs, or simplified logic will be committed. All edge cases must be handled.

### 4.2. Academic Integrity
-   **Data Preservation**: Original dating information (`bp`, `std`) and typological units must be preserved verbatim.
-   **Citation**: Bibliographic references must be displayed exactly as provided to ensure accurate citation.

## 5. Deployment and Maintenance

-   **Hosting**: The application will be deployed on a static hosting environment (e.g., GitHub Pages, Netlify).
-   **Versioning**: All stable releases will be tagged (e.g., `v1.0-c14-morocco`).
-   **Contributions**: Community submissions will be managed via GitHub Issues and curated manually.

## 6. Development Continuity

All architectural decisions, design patterns, and learnings from previous iterations must be documented and applied to the C14 edition to ensure continuity of quality.

---
*This document governs all development for the RQpedia C14 Edition.*
