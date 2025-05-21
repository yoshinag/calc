// ui_interactions.js

// SVG Icon definitions
const SVG_ICON_CHEVRON_UP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41-1.41z"/></svg>';
const SVG_ICON_CHEVRON_DOWN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';

const SVG_ICON_FULLSCREEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
const SVG_ICON_FULLSCREEN_EXIT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';

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
    const arePanelsInitiallyHidden = settingsPanelElement.classList.contains('hidden') && codePanelElement.classList.contains('hidden');
    if (arePanelsInitiallyHidden) {
        buttonElement.innerHTML = SVG_ICON_CHEVRON_DOWN;
        buttonElement.title = 'パネルを表示';
    } else {
        buttonElement.innerHTML = SVG_ICON_CHEVRON_UP;
        buttonElement.title = 'パネルを隠す';
    }
}

/**
 * Sets up the toggle functionality for a "page-level" fullscreen view of the graph.
 * This will toggle a class on the body, and CSS will handle making #graph-container fill the viewport.
 * @param {HTMLElement} buttonElement - The button that triggers the view change.
 * @param {HTMLElement} bodyElement - The document body element.
 */
function setupFullscreenToggle(buttonElement, bodyElement) {
    if (!buttonElement || !bodyElement) {
        console.warn("Button element or body element for fullscreen toggle not found.");
        return;
    }

    function updateFullscreenButtonState(isFullscreenActive) {
        if (isFullscreenActive) {
            buttonElement.innerHTML = SVG_ICON_FULLSCREEN_EXIT;
            buttonElement.title = '通常表示に戻す';
        } else {
            buttonElement.innerHTML = SVG_ICON_FULLSCREEN;
            buttonElement.title = '全画面表示 (ビュー)';
        }
    }

    // Set initial button icon and title
    updateFullscreenButtonState(bodyElement.classList.contains('graph-view-fullscreen'));

    buttonElement.addEventListener('click', function() {
        bodyElement.classList.toggle('graph-view-fullscreen');
        updateFullscreenButtonState(bodyElement.classList.contains('graph-view-fullscreen'));

        // Optional: If the graph rendering needs to be explicitly updated on resize/view change.
        // For SVG, this is often not necessary as it scales.
        // If needed, you might call a global renderGraph function after a short delay to allow CSS to apply.
        // setTimeout(() => {
        //     if (typeof window.renderGraph === 'function') {
        //         window.renderGraph();
        //     }
        // }, 50); // Small delay
    });

    // Listen for ESC key to exit this "page-level" fullscreen mode
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && bodyElement.classList.contains('graph-view-fullscreen')) {
            bodyElement.classList.remove('graph-view-fullscreen');
            updateFullscreenButtonState(false);
            // Optional: Trigger re-render if necessary
            // if (typeof window.renderGraph === 'function') { window.renderGraph(); }
        }
    });
}