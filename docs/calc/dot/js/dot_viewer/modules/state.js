// js/dot_viewer/modules/state.js
export let vizInstance = null;
export let allTemplates = [];

export function setVizInstance(instance) {
    vizInstance = instance;
}

export function setAllTemplates(templates) {
    allTemplates = templates;
}