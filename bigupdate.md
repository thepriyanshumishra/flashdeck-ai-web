# Major Update: NotebookLM Architecture Transformation

## 🎯 Goal
Refactor the single-page application into a multi-page, persistent workspace modeled after Google NotebookLM. The app will transition from a linear "Upload -> Generate" flow to a "Workspace" model where users can manage sources and choose different generation tools (starting with Flashcards).

## 🗺️ User Flow & Page Structure

### 1. Home Page (`/`)
*   **Content**: Hero Section only.
*   **Action**: "Get Started" button.
*   **Behavior**: Navigates to the Upload Page.

### 2. Upload Page (`/upload`)
*   **Content**: The existing "Upload Section".
*   **Functionality**:
    *   Select multiple files.
    *   "Add More" / "Remove" / "Clear All" functionality.
*   **Action**: "Generate" button.
*   **Behavior**: navigates to the Dashboard/Notebook Page.
    *   *Note*: This transition implies "creating a notebook" context implies holding the files in state.

### 3. Notebook Dashboard (`/notebook`)
*   **UI Design**: Replicates the 3-column NotebookLM layout (reference image).
*   **Left Column (Sources)**:
    *   Lists the files uploaded in the previous step.
    *   (Future) Ability to add more sources.
*   **Center Column (Chat/Main)**:
    *   Placeholder / "Coming Soon".
    *   (Future) Chat interface with the sources.
*   **Right Column (Studio/Tools)**:
    *   A grid of feature cards (Audio, Study Guide, Flashcards, Quiz, etc.).
    *   **Flashcards Card**: ✅ **Active**. Clicking triggers generation.
    *   **Other Cards**: 🔒 **Disabled**. Grayed out with "Coming Soon" tooltip.

### 4. Flashcards View (`/notebook/flashcards`)
*   **Trigger**: Accessed by clicking "Flashcards" in the Notebook Dashboard.
*   **Content**:
    *   The generated flashcards grid (UI similar to our current review section).
    *   **Export Controls**: Fixed bar or button at the bottom (or top) to open the Export Popup.
*   **Functionality**:
    *   View cards.
    *   Export to PDF/Image (same functionality as current Export section).

## 🛠️ Technical Implementation Strategy

### 1. Routing
*   Install `react-router-dom`.
*   Define routes for `/`, `/upload`, `/notebook`, and `/notebook/flashcards`.

### 2. State Management
*   Since we are moving between pages, we need a way to persist:
    *   Uploaded `files`.
    *   Generated `cards`.
*   **Solution**: Implement a global `DeckContext` or `AppProvider` to hold this state across routes.

### 3. New Components
*   `NotebookLayout`: The 3-column shell.
*   `SourcesPanel`: Left column component.
*   `StudioPanel`: Right column component with Feature Cards.
*   `FlashcardPage`: Dedicated page for the result view.

### 4. Refactoring
*   Break down `App.jsx` into these page components.
*   Move logic (handlers) into the Context or specific pages.
