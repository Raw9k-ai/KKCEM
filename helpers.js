// Small drawing helpers shared by all the layouts.
// Everything is drawn on a canvas that is PAGE_WIDTH units wide; the height
// depends on the chosen paper ratio.

const PAGE_WIDTH = 1024;
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';


/* ---------- text ---------- */

function setFont(ctx, style, size, family, spacing) {
    ctx.font = style + ' ' + size + 'px ' + family;
    // letterSpacing is missing in some older browsers, just skip it there
    if ('letterSpacing' in ctx) {
        ctx.letterSpacing = (spacing || 0) + 'px';
    }
}

// shrink the font until the text fits in maxWidth, returns the size used
function fitFontSize(ctx, text, style, family, size, maxWidth, spacing, minSize) {
    minSize = minSize || 12;
    setFont(ctx, style, size, family, spacing);
    while (size > minSize && ctx.measureText(text).width > maxWidth) {
        size -= 2;
        setFont(ctx, style, size, family, spacing);
    }
    return size;
}

// one line of text, vertically centred on y
function drawText(ctx, text, x, y, opts) {
    const style = opts.style || 'normal';
    const family = opts.family || SANS;
    const spacing = opts.spacing || 0;
    const align = opts.align || 'left';

    let size = opts.size;
    if (opts.maxWidth) {
        size = fitFontSize(ctx, text, style, family, size, opts.maxWidth, spacing, opts.minSize);
    } else {
        setFont(ctx, style, size, family, spacing);
    }

    // canvas adds letter spacing after the last letter too, so nudge it back
    if (align === 'center') x += spacing / 2;
    if (align === 'right') x += spacing;

    ctx.fillStyle = opts.color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    return size;
}

function splitIntoLines(ctx, text, maxWidth) {
    const lines = [];
    let current = '';
    text.split(/\s+/).filter(Boolean).forEach(function (word) {
        const attempt = current ? current + ' ' + word : word;
        if (current && ctx.measureText(attempt).width > maxWidth) {
            lines.push(current);
            current = word;
        } else {
            current = attempt;
        }
    });
    if (current) lines.push(current);
    return lines;
}

// wrap text and lower the font size until it fits in maxLines
function wrapToFit(ctx, text, style, family, size, maxWidth, maxLines, spacing, minSize) {
    minSize = minSize || 16;
    let lines;
    while (true) {
        setFont(ctx, style, size, family, spacing);
        lines = splitIntoLines(ctx, text, maxWidth);
        const fits = lines.length <= maxLines && lines.every(function (line) {
            return ctx.measureText(line).width <= maxWidth + 1;
        });
        if (fits || size <= minSize) break;
        size -= 2;
    }
    return { lines: lines, size: size };
}

// Wrapped paragraph.
// anchor 'top': y is the top edge of the block. anchor 'center': y is its middle.
// Returns where the block ends so the next thing can be placed below it.
function drawParagraph(ctx, text, x, y, opts) {
    const style = opts.style || 'normal';
    const family = opts.family || SANS;
    const spacing = opts.spacing || 0;
    const align = opts.align || 'left';

    const fitted = wrapToFit(ctx, text, style, family, opts.size, opts.maxWidth,
        opts.maxLines || 2, spacing, opts.minSize);
    const lineHeight = fitted.size * (opts.lineHeight || 1.15);
    const count = fitted.lines.length;

    const firstLineY = opts.anchor === 'center'
        ? y - (count - 1) * lineHeight / 2
        : y + lineHeight / 2;

    setFont(ctx, style, fitted.size, family, spacing);
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    const drawX = align === 'center' ? x + spacing / 2 : x;

    fitted.lines.forEach(function (line, i) {
        // color can be a function so single lines can get their own colour
        ctx.fillStyle = typeof opts.color === 'function' ? opts.color(i, count) : opts.color;
        ctx.fillText(line, drawX, firstLineY + i * lineHeight);
    });

    return {
        bottom: firstLineY - lineHeight / 2 + count * lineHeight,
        size: fitted.size,
        lines: count
    };
}

// list of short lines (names, roll number, etc). Squeezes the spacing
// if there is not enough room for all of them.
function drawLines(ctx, lines, x, y, opts) {
    if (!lines.length) return y;

    let lineHeight = opts.lineHeight;
    if (opts.availableHeight && lines.length * lineHeight > opts.availableHeight) {
        lineHeight = opts.availableHeight / lines.length;
    }
    const size = Math.min(opts.size, lineHeight * 0.68);

    lines.forEach(function (line, i) {
        drawText(ctx, line, x, y + i * lineHeight, {
            style: opts.style,
            family: opts.family,
            size: size,
            color: opts.color,
            align: opts.align,
            maxWidth: opts.maxWidth,
            minSize: 11
        });
    });
    return y + lines.length * lineHeight;
}


/* ---------- shapes ---------- */

function roundedRect(ctx, x, y, w, h, radius) {
    radius = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function circlePath(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
}

function drawRule(ctx, x1, x2, y, color, thickness) {
    ctx.fillStyle = color;
    ctx.fillRect(x1, y - thickness / 2, x2 - x1, thickness);
}

function drawDiamond(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
}

// two thin lines with a diamond between them
function drawOrnament(ctx, centerX, y, length, pal) {
    drawRule(ctx, centerX - length - 22, centerX - 22, y, pal.accent, 2);
    drawRule(ctx, centerX + 22, centerX + length + 22, y, pal.accent, 2);
    drawDiamond(ctx, centerX, y, 9, pal.accent);
}

function fillBackground(ctx, color, height) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, PAGE_WIDTH, height);
}


/* ---------- images ---------- */

// draw the whole image inside the box without cropping it
function drawContained(ctx, img, centerX, centerY, maxW, maxH) {
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    ctx.drawImage(img, centerX - w / 2, centerY - h / 2, w, h);
}

// fill the box completely, cropping the edges of the image if needed
function drawCover(ctx, img, x, y, w, h) {
    const ratio = Math.max(w / img.width, h / img.height);
    const srcW = w / ratio;
    const srcH = h / ratio;
    ctx.drawImage(img, (img.width - srcW) / 2, (img.height - srcH) / 2, srcW, srcH, x, y, w, h);
}

// Background photo, washed out with the page colour and faded in from the top.
function drawPhoto(ctx, img, washColor, x, y, w, h, strength) {
    if (!img) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    drawCover(ctx, img, x, y, w, h);

    ctx.globalAlpha = 1 - (strength || 0.22);
    ctx.fillStyle = washColor;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;

    const fade = ctx.createLinearGradient(0, y, 0, y + h * 0.5);
    fade.addColorStop(0, washColor);
    fade.addColorStop(1, withAlpha(washColor, 0));
    ctx.fillStyle = fade;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

// "KK College of Engineering & Management" -> "KCE"
function getInitials(name) {
    const skip = /^(of|and|&|the|for|in)$/i;
    const letters = name.split(/\s+/)
        .filter(function (word) { return word && !skip.test(word); })
        .slice(0, 3)
        .map(function (word) { return word[0].toUpperCase(); })
        .join('');
    return letters || '?';
}

// the logo, or a simple monogram badge when there is none
function drawLogo(ctx, data, pal, centerX, centerY, maxW, maxH) {
    if (data.logo) {
        drawContained(ctx, data.logo, centerX, centerY, maxW, maxH);
        return;
    }

    const radius = Math.min(maxW, maxH) / 2;
    ctx.fillStyle = pal.accent;
    circlePath(ctx, centerX, centerY, radius);
    ctx.fill();

    ctx.strokeStyle = withAlpha(pal.onAccent, 0.55);
    ctx.lineWidth = 3;
    circlePath(ctx, centerX, centerY, radius - 10);
    ctx.stroke();

    const letters = getInitials(data.college);
    drawText(ctx, letters, centerX, centerY + 2, {
        style: 'bold',
        family: SERIF,
        size: radius * (letters.length > 2 ? 0.85 : 1.05),
        maxWidth: radius * 1.35,
        color: pal.onAccent,
        align: 'center'
    });
}
