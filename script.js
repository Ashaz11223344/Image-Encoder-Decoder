/* ================================
   GLOBAL ELEMENTS
================================ */

const themeToggleElement = document.getElementById("themeToggle");
const themeIcon = themeToggleElement ? themeToggleElement.querySelector("i") : null;

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

/* Encode */
const encodeUploadArea = document.getElementById("encodeUploadArea");
let encodeFileInput = document.getElementById("encodeFileInput");
let encodeBrowseBtn = document.getElementById("encodeBrowseBtn");
const encodeOriginalPreview = document.getElementById("encodeOriginalPreview");
const encodeOriginalPlaceholder = document.getElementById("encodeOriginalPlaceholder");
const encodeEncodedPreview = document.getElementById("encodeEncodedPreview");
const encodeEncodedPlaceholder = document.getElementById("encodeEncodedPlaceholder");
const encodePreview = document.getElementById("encodePreview");
const encodeIntensity = document.getElementById("encodeIntensity");
const encodeIntensityValue = document.getElementById("encodeIntensityValue");
const encodeProgress = document.getElementById("encodeProgress");
const encodeProgressFill = document.getElementById("encodeProgressFill");
const encodeProgressText = document.getElementById("encodeProgressText");
const encodeAlert = document.getElementById("encodeAlert");
const encodeBtn = document.getElementById("encodeBtn");
const downloadEncodedBtn = document.getElementById("downloadEncodedBtn");
const resetEncodeBtn = document.getElementById("resetEncodeBtn");

/* Decode */
const decodeUploadArea = document.getElementById("decodeUploadArea");
let decodeFileInput = document.getElementById("decodeFileInput");
let decodeBrowseBtn = document.getElementById("decodeBrowseBtn");
const decodeEncodedPreview = document.getElementById("decodeEncodedPreview");
const decodeEncodedPlaceholder = document.getElementById("decodeEncodedPlaceholder");
const decodeDecodedPreview = document.getElementById("decodeDecodedPreview");
const decodeDecodedPlaceholder = document.getElementById("decodeDecodedPlaceholder");
const decodePreview = document.getElementById("decodePreview");
const decodeProgress = document.getElementById("decodeProgress");
const decodeProgressFill = document.getElementById("decodeProgressFill");
const decodeProgressText = document.getElementById("decodeProgressText");
const decodeAlert = document.getElementById("decodeAlert");
const decodeBtn = document.getElementById("decodeBtn");
const downloadDecodedBtn = document.getElementById("downloadDecodedBtn");
const resetDecodeBtn = document.getElementById("resetDecodeBtn");

/* Canvas */
const encodeCanvas = document.createElement("canvas");
const encodeCtx = encodeCanvas.getContext("2d");
const decodeCanvas = document.createElement("canvas");
const decodeCtx = decodeCanvas.getContext("2d");

let originalImage = null;
let encodedImageUrl = null;
let decodedImageUrl = null;
let currentTheme = localStorage.getItem("theme") || "light";

/* ================================
   INIT
================================ */

window.addEventListener("DOMContentLoaded", init);

function init() {
    setTheme(currentTheme);

    if (themeToggleElement) {
        themeToggleElement.addEventListener("click", toggleTheme);
    }

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            switchTab(btn.dataset.tab);
        });
    });

    encodeBrowseBtn.addEventListener("click", () => encodeFileInput.click());
    encodeFileInput.addEventListener("change", handleEncodeFile);
    setupDragDrop(encodeUploadArea, encodeFileInput, handleEncodeFile);

    decodeBrowseBtn.addEventListener("click", () => decodeFileInput.click());
    decodeFileInput.addEventListener("change", handleDecodeFile);
    setupDragDrop(decodeUploadArea, decodeFileInput, handleDecodeFile);

    encodeBtn.addEventListener("click", encodeImage);
    decodeBtn.addEventListener("click", decodeImage);

    resetEncodeBtn.addEventListener("click", resetEncode);
    resetDecodeBtn.addEventListener("click", resetDecode);

    downloadEncodedBtn.addEventListener("click", downloadEncodedImage);
    downloadDecodedBtn.addEventListener("click", downloadDecodedImage);

    encodeIntensity.addEventListener("input", updateIntensityValue);

    updateIntensityValue();
    switchTab("encode");
}

/* ================================
   THEME
================================ */

function setTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    currentTheme = theme;

    if (themeIcon) {
        themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
}

function toggleTheme() {
    setTheme(currentTheme === "light" ? "dark" : "light");
}

/* ================================
   TABS
================================ */

function switchTab(tab) {
    tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    tabContents.forEach(c => c.classList.toggle("active", c.id === tab));
}

/* ================================
   DRAG & DROP
================================ */

function setupDragDrop(area, input, handler) {
    ["dragenter", "dragover"].forEach(e =>
        area.addEventListener(e, ev => {
            ev.preventDefault();
            area.classList.add("active-drop");
        })
    );

    ["dragleave", "drop"].forEach(e =>
        area.addEventListener(e, ev => {
            ev.preventDefault();
            area.classList.remove("active-drop");
        })
    );

    area.addEventListener("drop", e => {
        input.files = e.dataTransfer.files;
        handler({ target: input });
    });
}

/* ================================
   FILE HANDLING
================================ */

function handleEncodeFile(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image")) return;

    const reader = new FileReader();
    reader.onload = ev => {
        originalImage = new Image();
        originalImage.onload = () => {
            encodeOriginalPreview.src = ev.target.result;
            encodeOriginalPreview.style.display = "block";
            encodeOriginalPlaceholder.style.display = "none";
            encodePreview.style.display = "flex";
            encodeBtn.disabled = false;
        };
        originalImage.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function handleDecodeFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
        decodeEncodedPreview.src = ev.target.result;
        decodeEncodedPreview.style.display = "block";
        decodeEncodedPlaceholder.style.display = "none";
        decodePreview.style.display = "flex";
        decodeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

/* ================================
   ENCODE / DECODE
================================ */

function applyAlgorithm(imageData, power, encode = true) {
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
        const key = (i + power * 17) % 255;

        if (encode) {
            d[i] ^= key;
            d[i + 1] ^= key;
            d[i + 2] ^= key;
        } else {
            d[i] ^= key;
            d[i + 1] ^= key;
            d[i + 2] ^= key;
        }
    }
    return imageData;
}

function encodeImage() {
    encodeCanvas.width = originalImage.width;
    encodeCanvas.height = originalImage.height;
    encodeCtx.drawImage(originalImage, 0, 0);

    const imgData = encodeCtx.getImageData(0, 0, encodeCanvas.width, encodeCanvas.height);
    const result = applyAlgorithm(imgData, encodeIntensity.value, true);

    encodeCtx.putImageData(result, 0, 0);
    encodedImageUrl = encodeCanvas.toDataURL("image/png");

    encodeEncodedPreview.src = encodedImageUrl;
    encodeEncodedPreview.style.display = "block";
    encodeEncodedPlaceholder.style.display = "none";

    downloadEncodedBtn.disabled = false;
}

function decodeImage() {
    const img = new Image();
    img.onload = () => {
        decodeCanvas.width = img.width;
        decodeCanvas.height = img.height;
        decodeCtx.drawImage(img, 0, 0);

        const data = decodeCtx.getImageData(0, 0, img.width, img.height);
        const decoded = applyAlgorithm(data, 5, false);

        decodeCtx.putImageData(decoded, 0, 0);
        decodedImageUrl = decodeCanvas.toDataURL("image/png");

        decodeDecodedPreview.src = decodedImageUrl;
        decodeDecodedPreview.style.display = "block";
        decodeDecodedPlaceholder.style.display = "none";

        downloadDecodedBtn.disabled = false;
    };
    img.src = decodeEncodedPreview.src;
}

/* ================================
   UTILITIES
================================ */

function updateIntensityValue() {
    const v = encodeIntensity.value;
    encodeIntensityValue.textContent = v <= 3 ? "Low" : v <= 7 ? "Medium" : "High";
}

function downloadEncodedImage() {
    download(encodedImageUrl, "encoded.png");
}

function downloadDecodedImage() {
    download(decodedImageUrl, "decoded.png");
}

function download(url, name) {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
}

function resetEncode() {
    encodeFileInput.value = "";
    encodePreview.style.display = "none";
    encodeBtn.disabled = true;
    downloadEncodedBtn.disabled = true;
}

function resetDecode() {
    decodeFileInput.value = "";
    decodePreview.style.display = "none";
    decodeBtn.disabled = true;
    downloadDecodedBtn.disabled = true;
}
