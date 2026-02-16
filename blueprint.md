# Product Builder Blueprint

## Overview

This document outlines the architecture, features, and implementation plan for the Product Builder application. The goal is to create a modern, single-page web application using vanilla HTML, CSS, and JavaScript, leveraging Web Components for modularity.

## Current State: Cisco Log Analyzer

The application is currently a **Cisco Log Analyzer**. It allows users to paste or upload Cisco log files, search through the content in real-time, and view filtered, highlighted results.

### Features

*   **Log Input:** A large `<textarea>` for users to paste raw log data.
*   **Real-time Search:** An `<input type="search">` field that filters the logs as the user types.
*   **Dynamic Results:** A dedicated area to display log lines that match the search query.
*   **Search Term Highlighting:** The matching search term is visually highlighted within the displayed log results.
*   **Line Count:** Shows the total number of lines and the number of matching lines.

### Architecture & Design

*   **Web Component:** The entire functionality is encapsulated within a `<log-analyzer>` custom element.
    *   **Shadow DOM:** The component's internal structure and styles are isolated from the main document, preventing CSS conflicts.
*   **Styling:**
    *   **Theme:** A dark mode theme, suitable for log analysis.
    *   **Layout:** Uses modern CSS (Flexbox and Grid) for a responsive and clean layout.
    *   **Colors:** A color palette chosen for readability (`#e0e0e0` for text, `#2c3e50` for the search background, `#f39c12` for highlighting).
*   **JavaScript:**
    *   **ES Modules:** Code is organized using native JavaScript modules.
    *   **Event Handling:** The application reacts to `input` events on the text area and search field to provide a real-time experience.

## Implementation Plan (Current Task)

1.  **[Completed]** **Create `blueprint.md`:** Document the project overview, features, and implementation plan.
2.  **[Next]** **Modify `index.html`:** Add the main structure and the `<log-analyzer>` element.
3.  **[Pending]** **Modify `style.css`:** Implement the dark mode theme and component styles.
4.  **[Pending]** **Modify `main.js`:** Create the `LogAnalyzer` web component class, implement the search/filter/highlight logic, and define the custom element.
