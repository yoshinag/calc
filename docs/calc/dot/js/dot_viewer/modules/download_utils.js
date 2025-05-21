// js/dot_viewer/modules/download_utils.js

export function triggerDownload(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (dataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(dataUrl);
    }
}

export async function downloadSVG(svgElement, graphContainer) { // graphContainer unused for now
    if (!svgElement) {
        alert('描画されたグラフが見つかりません。(downloadSVG)');
        return;
    }
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    if (!svgString.match(/^<\?xml/i)) {
        svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n' + svgString;
    } else {
        svgString = svgString.replace(/^<\?xml[^>]*encoding="[^"]*"[^>]*\?>/i,
            '<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'graph.svg');
}

export async function downloadPNG(svgElement, graphContainer) { // graphContainer unused for now
    if (!svgElement) {
        alert('描画されたグラフが見つかりません。(downloadPNG)');
        return;
    }
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    let svgDataUrl;
    try {
        const utf8Bytes = new TextEncoder().encode(svgString);
        let binaryString = "";
        for (let i = 0; i < utf8Bytes.length; i++) {
            binaryString += String.fromCharCode(utf8Bytes[i]);
        }
        svgDataUrl = 'data:image/svg+xml;base64,' + btoa(binaryString);
    } catch (e) {
        console.warn("TextEncoder method for base64 failed, falling back to unescape(encodeURIComponent()).", e);
        svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }

    const image = new Image();
    image.onload = () => {
        const canvas = document.createElement('canvas');
        let width = svgElement.width.baseVal.value;
        let height = svgElement.height.baseVal.value;
        const viewBox = svgElement.getAttribute('viewBox');
        if ((!width || !height || width === 0 || height === 0) && viewBox) {
            const parts = viewBox.split(/[\s,]+/);
            if (parts.length === 4) {
                width = parseFloat(parts[2]);
                height = parseFloat(parts[3]);
            }
        }
        if (!width || !height || width === 0 || height === 0) {
            try {
                const bbox = svgElement.getBBox();
                width = bbox.width;
                height = bbox.height;
            } catch (e) { /* ignore */ }
        }
        if (!width || !height || width === 0 || height === 0) {
            width = 800; height = 600;
        }
        canvas.width = Math.max(1, Math.ceil(width));
        canvas.height = Math.max(1, Math.ceil(height));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0'; // Light gray background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
            const pngDataUrl = canvas.toDataURL('image/png');
            triggerDownload(pngDataUrl, 'graph.png');
        } catch (e) {
            console.error("PNG conversion failed:", e);
            alert("PNGへの変換に失敗しました。コンソールで詳細を確認してください。");
        }
    };
    image.onerror = (e) => {
        console.error("Failed to load SVG into image for PNG conversion:", e);
        alert("SVG画像の読み込みに失敗しました。PNG変換できません。");
    };
    image.src = svgDataUrl;
}