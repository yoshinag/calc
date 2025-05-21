// js/dot_viewer/modules/graph_utils.js
import { notationRadios } from './dom_elements.js';

export function getSelectedNotation() {
    for (const radio of notationRadios) {
        if (radio.checked) return radio.value;
    }
    return 'mermaid'; // Default or fallback
}