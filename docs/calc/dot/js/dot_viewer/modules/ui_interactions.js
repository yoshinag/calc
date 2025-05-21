// js/dot_viewer/modules/ui_interactions.js

// SVG Icon definitions
const SVG_ICON_CHEVRON_UP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41-1.41z"/></svg>';
const SVG_ICON_CHEVRON_DOWN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';
const SVG_ICON_FULLSCREEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
const SVG_ICON_FULLSCREEN_EXIT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';
const SVG_ICON_COPY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
const SVG_ICON_COPY_SUCCESS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
const SVG_ICON_TRASH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
const SVG_ICON_PASTE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16zM12 6H9v2h3V6zm0 3H9v2h3V9zm0 3H9v2h3v-2z"/></svg>';
const SVG_ICON_PASTE_SUCCESS = SVG_ICON_COPY_SUCCESS;


export function setupAllPanelsToggle(buttonElement, settingsPanelElement, codePanelElement) {
    if (!buttonElement || !settingsPanelElement || !codePanelElement) {
        console.warn("One or more elements for panel toggle not found.");
        return;
    }
    buttonElement.addEventListener('click', function() {
        const SPHidden = settingsPanelElement.classList.contains('hidden');
        const CPHidden = codePanelElement.classList.contains('hidden');
        if (SPHidden || CPHidden) {
            settingsPanelElement.classList.remove('hidden');
            codePanelElement.classList.remove('hidden');
            this.innerHTML = SVG_ICON_CHEVRON_UP;
            this.title = 'パネルを隠す';
        } else {
            settingsPanelElement.classList.add('hidden');
            codePanelElement.classList.add('hidden');
            this.innerHTML = SVG_ICON_CHEVRON_DOWN;
            this.title = 'パネルを表示';
        }
    });
    const arePanelsInitiallyHidden = settingsPanelElement.classList.contains('hidden') && codePanelElement.classList.contains('hidden');
    buttonElement.innerHTML = arePanelsInitiallyHidden ? SVG_ICON_CHEVRON_DOWN : SVG_ICON_CHEVRON_UP;
    buttonElement.title = arePanelsInitiallyHidden ? 'パネルを表示' : 'パネルを隠す';
}

export function setupFullscreenToggle(buttonElement, bodyElement) {
    if (!buttonElement || !bodyElement) {
        console.warn("Button element or body element for fullscreen toggle not found.");
        return;
    }
    function updateFullscreenButtonState(isFullscreenActive) {
        buttonElement.innerHTML = isFullscreenActive ? SVG_ICON_FULLSCREEN_EXIT : SVG_ICON_FULLSCREEN;
        buttonElement.title = isFullscreenActive ? '通常表示に戻す' : '全画面表示 (ビュー)';
    }
    updateFullscreenButtonState(bodyElement.classList.contains('graph-view-fullscreen'));
    buttonElement.addEventListener('click', function() {
        bodyElement.classList.toggle('graph-view-fullscreen');
        updateFullscreenButtonState(bodyElement.classList.contains('graph-view-fullscreen'));
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && bodyElement.classList.contains('graph-view-fullscreen')) {
            bodyElement.classList.remove('graph-view-fullscreen');
            updateFullscreenButtonState(false);
        }
    });
}

export function setupClearCodeButton(clearButton, codeInputElement, afterClearCallback) {
    if (!clearButton || !codeInputElement) {
        console.warn("Clear button or code input not found for setup.");
        return;
    }
    clearButton.innerHTML = SVG_ICON_TRASH;
    clearButton.title = "コードをクリア";
    clearButton.addEventListener('click', () => {
        codeInputElement.value = '';
        codeInputElement.focus();
        if (typeof afterClearCallback === 'function') {
            afterClearCallback();
        }
    });
}

export function setupCopyCodeButton(copyButton, codeInputElement) {
    if (!copyButton || !codeInputElement) {
        console.warn("Copy button or code input not found for setup.");
        return;
    }
    copyButton.innerHTML = SVG_ICON_COPY;
    const originalCopyTitle = "コードをコピー";
    copyButton.title = originalCopyTitle;

    copyButton.addEventListener('click', () => {
        if (codeInputElement.value.trim() === '') {
            copyButton.title = 'コピーするコードがありません';
            setTimeout(() => {
                copyButton.title = originalCopyTitle;
            }, 1500);
            return;
        }

        const currentTitle = copyButton.title; // Save current title before changing to success/failure
        if (!navigator.clipboard) {
            try {
                codeInputElement.select();
                document.execCommand('copy');
                copyButton.innerHTML = SVG_ICON_COPY_SUCCESS;
                copyButton.title = 'コピーしました!';
            } catch (err) {
                console.error('Fallback copy failed:', err);
                alert('コードのコピーに失敗しました (execCommand)。');
                copyButton.title = 'コピー失敗';
            }
        } else {
            navigator.clipboard.writeText(codeInputElement.value).then(() => {
                copyButton.innerHTML = SVG_ICON_COPY_SUCCESS;
                copyButton.title = 'コピーしました!';
            }).catch(err => {
                console.error('Async copy failed:', err);
                alert('コードのコピーに失敗しました (Clipboard API)。');
                copyButton.title = 'コピー失敗';
            });
        }
        setTimeout(() => {
            copyButton.innerHTML = SVG_ICON_COPY;
            copyButton.title = originalCopyTitle; // Restore original title consistently
        }, 2000);
    });
}

export function setupPasteCodeButton(pasteButton, codeInputElement, afterPasteCallback) {
    if (!pasteButton || !codeInputElement) {
        console.warn("Paste button or code input not found for setup.");
        return;
    }
    pasteButton.innerHTML = SVG_ICON_PASTE;
    const originalPasteTitle = "コードをペースト (既存の内容はクリアされます)";
    pasteButton.title = originalPasteTitle;

    pasteButton.addEventListener('click', async () => {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            alert('このブラウザではクリップボードの読み取りがサポートされていません。');
            pasteButton.title = 'ペースト失敗';
            setTimeout(() => { pasteButton.title = originalPasteTitle; }, 2000);
            return;
        }
        try {
            const text = await navigator.clipboard.readText();
            codeInputElement.value = text; // Replace current content
            codeInputElement.focus();

            pasteButton.innerHTML = SVG_ICON_PASTE_SUCCESS;
            pasteButton.title = 'ペーストしました!';
            if (typeof afterPasteCallback === 'function') {
                afterPasteCallback();
            }
        } catch (err) {
            console.error('Paste failed:', err);
            if (err.name === 'NotAllowedError' || (err.message && err.message.toLowerCase().includes('permission denied'))) {
                alert('クリップボードへのアクセス許可が必要です。ページをクリックしてから再度お試しください。');
            } else {
                alert('クリップボードからのペーストに失敗しました。');
            }
            pasteButton.title = 'ペースト失敗';
        }
        setTimeout(() => {
            pasteButton.innerHTML = SVG_ICON_PASTE;
            pasteButton.title = originalPasteTitle;
        }, 2000);
    });
}