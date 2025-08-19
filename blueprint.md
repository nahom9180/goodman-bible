# Divine Words Application Blueprint

## Overview

Divine Words is a personal, offline-first Bible study and presentation tool. It allows users to import their own Bible translations, create custom verse collections, and use a presentation mode with a timer for study or display. The application is built using modern, framework-less web technologies (HTML, CSS, JavaScript) and leverages IndexedDB for all client-side storage, ensuring it works seamlessly offline as a Progressive Web App (PWA).

## Core Features & Design

*   **Offline-First:** The application is designed to be fully functional without an internet connection after the initial load.
*   **PWA:** Installable on user devices for a native-like experience.
*   **Data Management:** Users can import, view, and delete multiple Bible translations and verse collections.
*   **Presentation Mode:** A clean, focused view for displaying verses, with controls for font size, family, and a countdown timer.
*   **Custom Collections:** Users can create and edit custom lists of Bible verses for focused study or presentation.
*   **Modern UI:** The interface is clean, dark-themed, and responsive, designed for ease of use on both desktop and mobile devices.
*   **Audiovisual Integration:** (Future) Support for background music and images during presentation.

---

## Current Task: Project Refactoring

**Objective:** To improve maintainability, scalability, and developer experience by restructuring the project from large, monolithic files into smaller, single-responsibility modules.

### New Directory Structure

```
.
├── js/
│   ├── core/               # Core application logic
│   │   ├── app.js
│   │   ├── bibleManager.js
│   │   ├── collectionManager.js
│   │   ├── settings.js
│   │   └── timer.js
│   ├── database/           # IndexedDB interactions
│   │   └── db.js
│   ├── pages/              # Page-specific entry points
│   │   ├── datamanager.js
│   │   └── index.js
│   ├── ui/                 # UI component logic
│   │   ├── modals.js
│   │   ├── navbar.js
│   │   ├── sidePanel.js
│   │   └── statusBar.js
│   └── utils/              # Utility functions
│       ├── constants.js
│       ├── extractor.js
│       └── parser.js
├── styles/
│   ├── components/         # CSS for specific UI components
│   │   ├── buttons.css
│   │   ├── modals.css
│   │   └── navbar.css
│   ├── pages/              # Page-specific styles
│   │   ├── datamanager.css
│   │   └── index.css
│   ├── base.css            # Root variables, base styles
│   └── style.css           # Main CSS file to import all others
│
├── index.html
├── app.html
└── ... (other files)
```

### Refactoring Steps

1.  **[COMPLETED]** **Create Blueprint & Directories:** Establish `blueprint.md` and create the new `js/*` and `styles/*` directory structures.
2.  **[In Progress]** **Refactor `index.html` Logic:**
    *   Move constants (`DB_NAME`, `DB_VERSION`) to `js/utils/constants.js`.
    *   Move all IndexedDB functions (`openDatabase`, `getBibleCount`, etc.) to `js/database/db.js`.
    *   Move the XML parsing logic to `js/utils/parser.js`.
    *   Create `js/pages/index.js` to manage the startup logic, Bible installation modal, and event listeners for `index.html`.
    *   Update `index.html` to import and use these new modules, removing the large inline `<script>` tag.
3.  **Refactor CSS:**
    *   Move CSS variables and base styles to `styles/base.css`.
    *   Extract component styles (buttons, modals, navbar) into their respective files in `styles/components/`.
    *   Create a new `styles/style.css` that uses `@import` to load all other CSS files in the correct order.
    *   Update HTML files to link only to the new main `style.css`.
4.  **Refactor Main Application (`main_app_script.js`):**
    *   Break down `main_app_script.js` into the modules defined in `js/core/` and `js/ui/`.
    *   `app.js` will become the main entry point for `app.html`.
    *   Update `app.html` to use the new `app.js` module.
5.  **Refactor Data Manager (`datamanager_script.js`):**
    *   Move the logic from `datamanager_script.js` to `js/pages/datamanager.js`.
    *   Update `datamanager.html` to use the new script.
6.  **Cleanup:**
    *   Delete the old, large script files (`main_app_script.js`, `datamanager_script.js`, `script.js`, etc.) after their logic has been successfully migrated.
    *   Remove any remaining large inline `<style>` blocks from HTML files.
