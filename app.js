// Page logic: form, design picker, live preview, image upload, download.

const preview = document.getElementById('preview');
const previewCtx = preview.getContext('2d');
const grid = document.getElementById('grid');
const message = document.getElementById('message');
const sizeSelect = document.getElementById('size');

const textFields = ['title', 'subject', 'college', 'address', 'dept', 'toBody', 'byBody', 'toHeading', 'byHeading'];

let currentDesign = 0;
let logoImage = null;
let photoImage = null;
let heightRatio = 1.5;     // page height / page width
let exportWidth = 1024;    // pixels in the downloaded PNG

const thumbnails = [];


function valueOf(id) {
    return document.getElementById(id).value.trim();
}

// one non-empty line per row of a textarea
function linesOf(id) {
    return document.getElementById(id).value
        .split('\n')
        .map(function (line) { return line.trim(); })
        .filter(Boolean);
}

function readForm() {
    return {
        title: valueOf('title'),
        subject: valueOf('subject'),
        college: valueOf('college'),
        address: valueOf('address'),
        dept: valueOf('dept'),
        toHeading: valueOf('toHeading'),
        byHeading: valueOf('byHeading'),
        to: linesOf('toBody'),
        by: linesOf('byBody'),
        logo: logoImage,
        photo: photoImage
    };
}

function pageHeight() {
    return Math.round(PAGE_WIDTH * heightRatio);
}


/* ---------- drawing ---------- */

let frameRequest = 0;
let thumbTimer = 0;

function drawPreview() {
    cancelAnimationFrame(frameRequest);
    frameRequest = requestAnimationFrame(function () {
        const height = pageHeight();
        if (preview.width !== PAGE_WIDTH || preview.height !== height) {
            preview.width = PAGE_WIDTH;
            preview.height = height;
        }
        renderCover(previewCtx, DESIGNS[currentDesign], readForm(), height);
    });
}

function drawThumbnails() {
    const data = readForm();
    const height = pageHeight();

    thumbnails.forEach(function (thumb, i) {
        const scale = thumb.canvas.width / PAGE_WIDTH;
        const thumbHeight = Math.round(height * scale);
        if (thumb.canvas.height !== thumbHeight) {
            thumb.canvas.height = thumbHeight;
        }
        thumb.canvas.style.setProperty('--ratio', PAGE_WIDTH + '/' + height);

        const ctx = thumb.canvas.getContext('2d');
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        renderCover(ctx, DESIGNS[i], data, height);
    });
}

// the thumbnails are 24 small drawings, so wait until typing pauses
function refresh() {
    drawPreview();
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(drawThumbnails, 220);
}


/* ---------- design picker ---------- */

function buildGrid() {
    DESIGNS.forEach(function (design, i) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'design';
        button.setAttribute('aria-pressed', i === currentDesign);
        button.setAttribute('aria-label', 'Design ' + (i + 1) + ': ' + design.palette.name);

        const canvas = document.createElement('canvas');
        canvas.width = 170;
        canvas.height = 255;

        const label = document.createElement('span');
        label.textContent = design.palette.name;

        button.appendChild(canvas);
        button.appendChild(label);
        button.addEventListener('click', function () { selectDesign(i); });
        grid.appendChild(button);

        thumbnails.push({ canvas: canvas, button: button });
    });
}

function selectDesign(index) {
    currentDesign = index;
    thumbnails.forEach(function (thumb, i) {
        thumb.button.setAttribute('aria-pressed', i === index);
    });
    drawPreview();
}


/* ---------- image upload ---------- */

// Load an image file and shrink it so redrawing stays fast.
function loadImage(file, maxSize) {
    return new Promise(function (resolve, reject) {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = function () {
            const shrink = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.naturalWidth * shrink));
            canvas.height = Math.max(1, Math.round(img.naturalHeight * shrink));

            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            URL.revokeObjectURL(url);
            resolve(canvas);
        };
        img.onerror = function () {
            URL.revokeObjectURL(url);
            reject();
        };
        img.src = url;
    });
}

function listenForImage(inputId, maxSize, onLoaded) {
    document.getElementById(inputId).addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        message.textContent = '';
        loadImage(file, maxSize)
            .then(function (canvas) {
                onLoaded(canvas);
                refresh();
            })
            .catch(function () {
                message.textContent = 'That image could not be read. Try a PNG or JPG file.';
            });

        // clear the input so choosing the same file again still fires
        event.target.value = '';
    });
}


/* ---------- download ---------- */

function fileNameFor(title) {
    const slug = title.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    return (slug || 'cover') + '-cover-' + exportWidth + '.png';
}

function downloadPng() {
    const data = readForm();
    const height = pageHeight();
    const scale = exportWidth / PAGE_WIDTH;

    // draw into a temporary canvas at full export size
    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, canvas.height / height);
    renderCover(ctx, DESIGNS[currentDesign], data, height);

    canvas.toBlob(function (blob) {
        if (!blob) {
            message.textContent = 'Could not create the image. Try a smaller size.';
            return;
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileNameFor(data.title);
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(function () { URL.revokeObjectURL(link.href); }, 5000);
        canvas.width = canvas.height = 0;   // free the memory
    }, 'image/png');
}


/* ---------- wiring ---------- */

textFields.forEach(function (id) {
    document.getElementById(id).addEventListener('input', refresh);
});

document.getElementById('shuffle').addEventListener('click', function () {
    let next;
    do {
        next = Math.floor(Math.random() * DESIGNS.length);
    } while (next === currentDesign);
    selectDesign(next);
});

sizeSelect.addEventListener('change', function () {
    const parts = sizeSelect.value.split('|');
    exportWidth = Number(parts[0]);
    heightRatio = Number(parts[1]);
    drawPreview();
    drawThumbnails();
});

listenForImage('logoFile', 700, function (canvas) { logoImage = canvas; });
listenForImage('photoFile', 1600, function (canvas) { photoImage = canvas; });

document.getElementById('logoClear').addEventListener('click', function () {
    logoImage = null;
    refresh();
});
document.getElementById('photoClear').addEventListener('click', function () {
    photoImage = null;
    refresh();
});

document.getElementById('download').addEventListener('click', downloadPng);


/* ---------- start ---------- */

buildGrid();

const startLogo = new Image();
startLogo.onload = function () {
    logoImage = startLogo;
    refresh();
};
startLogo.src = DEFAULT_LOGO;

refresh();
drawThumbnails();
