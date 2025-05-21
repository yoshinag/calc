// ui_interactions.js

// SVG Icon definitions
const SVG_ICON_CHEVRON_UP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41-1.41z"/></svg>';
const SVG_ICON_CHEVRON_DOWN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';

/**
 * Sets up the toggle functionality for all panels.
 * @param {HTMLElement} buttonElement - The button that triggers the toggle.
 * @param {HTMLElement} settingsPanelElement - The settings panel element.
 * @param {HTMLElement} codePanelElement - The code panel element.
 */
function setupAllPanelsToggle(buttonElement, settingsPanelElement, codePanelElement) {
    if (!buttonElement || !settingsPanelElement || !codePanelElement) {
        console.warn("One or more elements for panel toggle not found.");
        return;
    }

    buttonElement.addEventListener('click', function() {
        const SPHidden = settingsPanelElement.classList.contains('hidden');
        const CPHidden = codePanelElement.classList.contains('hidden');

        if (SPHidden || CPHidden) { // If at least one is hidden, show both
            settingsPanelElement.classList.remove('hidden');
            codePanelElement.classList.remove('hidden');
            this.innerHTML = SVG_ICON_CHEVRON_UP; // Show "hide" icon
            this.title = 'パネルを隠す';
        } else { // Both are visible, hide both
            settingsPanelElement.classList.add('hidden');
            codePanelElement.classList.add('hidden');
            this.innerHTML = SVG_ICON_CHEVRON_DOWN; // Show "show" icon
            this.title = 'パネルを表示';
        }
    });

    // Set initial button icon and title
    // Assuming panels are visible by default (no 'hidden' class in HTML)
    const arePanelsInitiallyHidden = settingsPanelElement.classList.contains('hidden') && codePanelElement.classList.contains('hidden');
    if (arePanelsInitiallyHidden) {
        buttonElement.innerHTML = SVG_ICON_CHEVRON_DOWN;
        buttonElement.title = 'パネルを表示';
    } else {
        buttonElement.innerHTML = SVG_ICON_CHEVRON_UP;
        buttonElement.title = 'パネルを隠す';
    }
}