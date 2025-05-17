// template_manager.js

// このモジュールはグローバルな allTemplates 配列や特定のDOM要素に直接アクセスせず、
// 引数で受け取るか、コールバックで処理を返すように設計します。

/**
 * Loads templates from a JSON file.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of template objects.
 * @throws {Error} If fetching or parsing fails.
 */
async function loadTemplatesFromFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, while fetching ${filePath}`);
        }
        const templates = await response.json();
        return templates;
    } catch (error) {
        console.error("Failed to load templates:", error);
        throw error; // Re-throw to be caught by the caller
    }
}

/**
 * Populates a select element with template options.
 * Sets the select element's value to the ID of the first template.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 * @param {Array<Object>} templates - An array of template objects.
 */
function populateTemplateSelectWithOptions(selectElement, templates) {
    if (!selectElement || !templates) {
        console.warn("Select element or templates array not provided to populateTemplateSelect.");
        return;
    }
    selectElement.innerHTML = ''; // Clear existing options

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
    selectElement.value = templates[0].id; // Default to the first template
}

/**
 * Updates the code input and notation selection based on the selected template.
 * @param {string} selectedTemplateId - The ID of the selected template.
 * @param {Array<Object>} allTemplates - The array of all available template objects.
 * @param {HTMLTextAreaElement} codeInputElement - The textarea element for the code.
 * @param {NodeListOf<HTMLInputElement>} notationRadioElements - NodeList of notation radio buttons.
 * @returns {Object|null} The selected template object or null if not found.
 */
function applyTemplateToUI(selectedTemplateId, allTemplates, codeInputElement, notationRadioElements) {
    if (!allTemplates || !codeInputElement || !notationRadioElements) {
        console.warn("Missing arguments for applyTemplateToUI.");
        return null;
    }

    const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId);

    if (selectedTemplate) {
        // Update notation radio buttons
        notationRadioElements.forEach(radio => {
            if (radio.value === selectedTemplate.notation) {
                radio.checked = true;
            }
        });
        // Update code input
        codeInputElement.value = selectedTemplate.code;
        return selectedTemplate; // Return the applied template
    } else if (allTemplates.length > 0 && !selectedTemplateId) {
        // Fallback: if no ID provided but templates exist, apply the first one
        const firstTemplate = allTemplates[0];
        notationRadioElements.forEach(radio => {
            if (radio.value === firstTemplate.notation) {
                radio.checked = true;
            }
        });
        codeInputElement.value = firstTemplate.code;
        return firstTemplate;
    }
    console.warn(`Template with ID "${selectedTemplateId}" not found.`);
    return null;
}