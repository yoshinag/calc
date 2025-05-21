// download_utils.js

/**
 * ファイルダウンロードをトリガーする共通関数
 * @param {string} dataUrl - ダウンロードするデータのURL (DataURL or ObjectURL)
 * @param {string} filename - 保存するファイル名
 */
function triggerDownload(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a); // Firefoxで必要になることがある
    a.click();
    document.body.removeChild(a);
    if (dataUrl.startsWith('blob:')) { // ObjectURLの場合、解放する
        URL.revokeObjectURL(dataUrl);
    }
}

/**
 * 現在のグラフをSVGとしてダウンロードする
 * @param {SVGSVGElement} svgElement - ダウンロード対象のSVG要素
 * @param {HTMLElement} graphContainer - グラフのコンテナ要素 (現状は未使用だが、将来的なエラー表示等で利用可能性あり)
 */
async function downloadSVG(svgElement, graphContainer) {
    if (!svgElement) {
        alert('描画されたグラフが見つかりません。(downloadSVG)');
        return;
    }

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    // Add XML declaration if missing, and ensure UTF-8 encoding
    if (!svgString.match(/^<\?xml/i)) {
        svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n' + svgString;
    } else {
        // Ensure encoding is UTF-8 if declaration exists
        svgString = svgString.replace(/^<\?xml[^>]*encoding="[^"]*"[^>]*\?>/i,
            '<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
    }

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'graph.svg');
}

/**
 * 現在のグラフをPNGとしてダウンロードする
 * @param {SVGSVGElement} svgElement - ダウンロード対象のSVG要素
 * @param {HTMLElement} graphContainer - グラフのコンテナ要素 (現状は未使用だが、将来的なエラー表示等で利用可能性あり)
 */
async function downloadPNG(svgElement, graphContainer) {
    if (!svgElement) {
        alert('描画されたグラフが見つかりません。(downloadPNG)');
        return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    // Unicode文字が含まれる場合、btoaで問題が起きるため、エスケープ処理を追加
    // このエスケープ方法は非推奨ですが、多くのブラウザで動作します。
    // より堅牢な方法は、TextEncoderを使ってUTF-8バイトに変換し、それをBase64エンコードすることです。
    let svgDataUrl;
    try {
        // Attempt modern way for Base64 encoding of UTF-8
        const utf8Bytes = new TextEncoder().encode(svgString);
        let binaryString = "";
        for (let i = 0; i < utf8Bytes.length; i++) {
            binaryString += String.fromCharCode(utf8Bytes[i]);
        }
        svgDataUrl = 'data:image/svg+xml;base64,' + btoa(binaryString);
    } catch (e) {
        // Fallback for older environments or if TextEncoder fails for some reason
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
            const parts = viewBox.split(/[\s,]+/); // Handle space or comma separators
            if (parts.length === 4) {
                width = parseFloat(parts[2]);
                height = parseFloat(parts[3]);
            }
        }

        // If width/height are still 0, try getBBox as a more reliable measure
        if (!width || !height || width === 0 || height === 0) {
            try {
                const bbox = svgElement.getBBox();
                width = bbox.width;
                height = bbox.height;
            } catch (e) {
                console.warn("getBBox failed for SVG dimensions, using fallback.", e);
            }
        }

        // Ultimate fallback if all else fails
        if (!width || !height || width === 0 || height === 0) {
            console.warn("SVG dimensions are zero, invalid, or could not be determined, using default 800x600 for PNG.");
            width = 800;
            height = 600;
        }

        // Ensure positive dimensions, with a minimum size
        canvas.width = Math.max(1, Math.ceil(width));   // Ensure at least 1px, and use ceil for float dimensions
        canvas.height = Math.max(1, Math.ceil(height)); // Ensure at least 1px, and use ceil for float dimensions

        const ctx = canvas.getContext('2d');

        // Fill background with a light gray color for PNG
        ctx.fillStyle = '#f0f0f0'; // Light gray color (e.g., #f0f0f0 or rgb(240,240,240))
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the SVG image onto the canvas
        // To ensure the SVG scales correctly, especially if it uses viewBox,
        // we might need to adjust drawImage parameters if the SVG's intrinsic dimensions differ from canvas.
        // For now, direct drawing is used.
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        try {
            const pngDataUrl = canvas.toDataURL('image/png');
            triggerDownload(pngDataUrl, 'graph.png');
        } catch (e) {
            console.error("PNG conversion failed:", e);
            let alertMessage = "PNGへの変換に失敗しました。\nコンソールで詳細を確認してください。";
            if (e.name === 'SecurityError') {
                alertMessage += "\nSVG内に外部リソース（画像など）が含まれているか、SVGが汚染されている（tainted）可能性があります。";
            } else if (canvas.width === 0 || canvas.height === 0) {
                alertMessage += "\nCanvasのサイズが0のため、PNGを生成できません。SVGのサイズ情報を確認してください。";
            }
            alert(alertMessage);
        }
    };
    image.onerror = (e) => {
        console.error("Failed to load SVG into image for PNG conversion:", e);
        alert("SVG画像の読み込みに失敗しました。PNG変換できません。\nSVGが大きすぎるか、内容に問題がある可能性があります。");
    };
    image.src = svgDataUrl;
}