// js/dot_viewer/modules/template_manager.js

export async function loadTemplatesFromFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, while fetching ${filePath}`);
        }
        const templates = await response.json();
        return templates;
    } catch (error) {
        console.error("Failed to load templates:", error);
        throw error;
    }
}

export function populateTemplateSelectWithOptions(selectElement, templates) {
    if (!selectElement || !templates) {
        console.warn("Select element or templates array not provided to populateTemplateSelect.");
        return;
    }
    selectElement.innerHTML = '';
    if (templates.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'テンプレートなし';
        option.disabled = true;
        selectElement.appendChild(option);
        return;
    }
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        selectElement.appendChild(option);
    });
    if (templates.length > 0) { // Ensure there's at least one template before setting value
        selectElement.value = templates[0].id;
    }
}

export function applyTemplateToUI(selectedTemplateId, allTemplates, codeInputElement, notationRadioElements) {
    if (!allTemplates || !codeInputElement || !notationRadioElements) {
        console.warn("Missing arguments for applyTemplateToUI.");
        return null;
    }
    const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId);
    if (selectedTemplate) {
        notationRadioElements.forEach(radio => {
            radio.checked = (radio.value === selectedTemplate.notation);
        });
        codeInputElement.value = selectedTemplate.code;
        return selectedTemplate;
    } else if (allTemplates.length > 0 && !selectedTemplateId) {
        const firstTemplate = allTemplates[0];
        notationRadioElements.forEach(radio => {
            radio.checked = (radio.value === firstTemplate.notation);
        });
        codeInputElement.value = firstTemplate.code;
        return firstTemplate;
    }
    console.warn(`Template with ID "${selectedTemplateId}" not found.`);
    return null;
}