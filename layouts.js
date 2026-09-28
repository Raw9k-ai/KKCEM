// The six page layouts. Each one draws a complete cover onto the canvas.
//
// Vertical positions were planned for a 1024 x 1536 page. Multiplying them
// by `scale` stretches them to other heights, so the same layout also works
// for A4 paper. Text sizes are not scaled.

function upper(text) {
    return text.toUpperCase();
}


/* 1. Classic: centred, thin frame, the layout from the original cover */

function drawClassic(ctx, data, pal, height) {
    const scale = height / 1536;
    const sy = function (v) { return v * scale; };
    const centerX = PAGE_WIDTH / 2;

    fillBackground(ctx, pal.bg, height);
    drawPhoto(ctx, data.photo, pal.bg, 28, sy(880), PAGE_WIDTH - 56, height - 28 - sy(880), 0.22);

    // frame
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, PAGE_WIDTH - 56, height - 56);

    // heading
    drawText(ctx, upper(data.title), centerX, sy(180), {
        style: 'bold', family: SERIF, size: 150, maxWidth: 820,
        color: pal.ink, align: 'center'
    });
    drawRule(ctx, 220, 810, sy(252), pal.accent, 4);
    drawText(ctx, upper(data.subject), centerX, sy(302), {
        style: 'bold', family: SANS, size: 40, maxWidth: 800,
        color: pal.ink, align: 'center'
    });

    // logo and college
    drawLogo(ctx, data, pal, centerX, sy(520), 400, sy(320));
    drawParagraph(ctx, data.college, centerX, sy(783), {
        anchor: 'center', style: 'bold', family: SERIF, size: 66, maxWidth: 860,
        maxLines: 2, lineHeight: 1.12, color: pal.ink, align: 'center'
    });
    drawRule(ctx, 270, 755, sy(873), pal.accent, 4);
    drawText(ctx, data.address, centerX, sy(909), {
        style: 'bold', family: SERIF, size: 26, maxWidth: 820,
        color: pal.ink, align: 'center'
    });

    // "submitted to" / "submitted by" columns with a divider between them
    const headingY = sy(1011);
    ctx.fillStyle = pal.ink;
    ctx.fillRect(565, sy(1005), 3, sy(255));

    drawText(ctx, upper(data.toHeading) + ':', 305, headingY, {
        style: 'bold', family: SERIF, size: 26, spacing: 1, maxWidth: 420,
        color: pal.accent, align: 'center'
    });
    // names on the left get a highlighter-style pill behind them
    data.to.slice(0, 4).forEach(function (name, i) {
        const lineY = sy(1066) + i * 56;
        const size = fitFontSize(ctx, name, 'bold', SANS, 32, 430, 0, 16);
        const textWidth = ctx.measureText(name).width;
        ctx.fillStyle = pal.highlight;
        roundedRect(ctx, 305 - textWidth / 2 - 14, lineY - size * 0.78, textWidth + 28, size * 1.56, size * 0.5);
        ctx.fill();
        drawText(ctx, name, 305, lineY, {
            style: 'bold', family: SANS, size: size, color: pal.ink, align: 'center'
        });
    });

    drawText(ctx, upper(data.byHeading) + ':', 622, headingY, {
        style: 'bold', family: SERIF, size: 26, spacing: 1, maxWidth: 370, color: pal.accent
    });
    drawLines(ctx, data.by.slice(0, 6), 622, sy(1059), {
        size: 27, lineHeight: 48, availableHeight: sy(255), maxWidth: 370,
        style: 'bold', family: SERIF, color: pal.ink
    });

    // department with a short rule on each side
    const deptY = sy(1308);
    const dept = upper(data.dept);
    const deptSize = fitFontSize(ctx, dept, 'normal', SERIF, 23, 620, 0, 12);
    const deptWidth = ctx.measureText(dept).width;
    ctx.fillStyle = withAlpha(pal.bg, 0.88);
    roundedRect(ctx, centerX - deptWidth / 2 - 14, deptY - 21, deptWidth + 28, 42, 10);
    ctx.fill();
    drawRule(ctx, centerX - deptWidth / 2 - 96, centerX - deptWidth / 2 - 24, deptY, pal.accent, 4);
    drawRule(ctx, centerX + deptWidth / 2 + 24, centerX + deptWidth / 2 + 96, deptY, pal.accent, 4);
    drawText(ctx, dept, centerX, deptY, {
        family: SERIF, size: deptSize, color: pal.ink, align: 'center'
    });
}


/* 2. Band: coloured header, round logo badge, two boxes, footer bar */

function drawBand(ctx, data, pal, height) {
    const scale = height / 1536;
    const sy = function (v) { return v * scale; };
    const centerX = PAGE_WIDTH / 2;
    const bandHeight = sy(540);

    fillBackground(ctx, pal.bg, height);
    drawPhoto(ctx, data.photo, pal.bg, 0, sy(930), PAGE_WIDTH, height - sy(930) - 96, 0.2);

    // header band with two faint circles
    ctx.fillStyle = pal.panel;
    ctx.fillRect(0, 0, PAGE_WIDTH, bandHeight);
    ctx.fillStyle = withAlpha(pal.onPanel, 0.07);
    circlePath(ctx, 890, 50, 270);
    ctx.fill();
    circlePath(ctx, 80, bandHeight - 20, 180);
    ctx.fill();

    drawText(ctx, upper(data.title), centerX, sy(190), {
        style: '800', family: SANS, size: 150, spacing: 6, maxWidth: 860,
        color: pal.onPanel, align: 'center'
    });
    drawText(ctx, upper(data.subject), centerX, sy(295), {
        style: '600', family: SANS, size: 38, spacing: 3, maxWidth: 860,
        color: pal.accent, align: 'center'
    });
    drawRule(ctx, centerX - 100, centerX + 100, sy(345), pal.accent, 6);

    // logo badge sits on the edge of the band
    ctx.fillStyle = pal.bg;
    circlePath(ctx, centerX, bandHeight, 155);
    ctx.fill();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 7;
    ctx.stroke();
    drawLogo(ctx, data, pal, centerX, bandHeight, 250, 210);

    drawParagraph(ctx, data.college, centerX, sy(792), {
        anchor: 'center', style: 'bold', family: SERIF, size: 62, maxWidth: 860,
        maxLines: 2, lineHeight: 1.12, color: pal.ink, align: 'center'
    });
    drawText(ctx, data.address, centerX, sy(896), {
        size: 26, maxWidth: 860, color: pal.soft, align: 'center'
    });

    // the two boxes are as tall as the longer list needs
    const rows = Math.max(1, Math.min(6, Math.max(data.to.length, data.by.length)));
    const boxHeight = 110 + rows * 46;
    const boxTop = sy(965);
    const boxColor = mixColors(pal.panel, pal.bg, 0.9);
    const boxes = [
        { x: 56, heading: data.toHeading, lines: data.to },
        { x: 532, heading: data.byHeading, lines: data.by }
    ];
    boxes.forEach(function (box) {
        ctx.fillStyle = boxColor;
        ctx.fillRect(box.x, boxTop, 436, boxHeight);
        ctx.fillStyle = pal.panel;
        ctx.fillRect(box.x, boxTop, 9, boxHeight);
        drawText(ctx, upper(box.heading), box.x + 36, boxTop + 42, {
            style: 'bold', family: SANS, size: 23, spacing: 3, maxWidth: 370, color: pal.panel
        });
        drawLines(ctx, box.lines.slice(0, 6), box.x + 36, boxTop + 98, {
            size: 30, lineHeight: 46, availableHeight: boxHeight - 110, maxWidth: 380,
            family: SERIF, color: pal.ink
        });
    });

    // footer
    ctx.fillStyle = pal.panel;
    ctx.fillRect(0, height - 96, PAGE_WIDTH, 96);
    drawText(ctx, upper(data.dept), centerX, height - 48, {
        style: '600', family: SANS, size: 26, spacing: 4, maxWidth: 900,
        color: pal.onPanel, align: 'center'
    });
}


/* 3. Side stripe: left-aligned, department written up the left edge */

function drawSide(ctx, data, pal, height) {
    const scale = height / 1536;
    const sy = function (v) { return v * scale; };
    const left = 190;
    const contentWidth = 770;

    fillBackground(ctx, pal.bg, height);
    drawPhoto(ctx, data.photo, pal.bg, 130, sy(700), PAGE_WIDTH - 130, height - sy(700), 0.18);

    // faint rings, bottom right
    ctx.strokeStyle = withAlpha(pal.accent, 0.3);
    ctx.lineWidth = 3;
    [70, 120, 170].forEach(function (radius) {
        circlePath(ctx, PAGE_WIDTH - 30, sy(900), radius);
        ctx.stroke();
    });

    // stripe with the department name turned sideways
    ctx.fillStyle = pal.panel;
    ctx.fillRect(0, 0, 120, height);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(120, 0, 10, height);
    ctx.save();
    ctx.translate(60, height / 2);
    ctx.rotate(-Math.PI / 2);
    drawText(ctx, upper(data.dept), 0, 0, {
        style: '600', family: SANS, size: 28, spacing: 8, maxWidth: height - 170,
        color: pal.onPanel, align: 'center'
    });
    ctx.restore();

    // title stacks onto as many lines as it needs
    const title = drawParagraph(ctx, upper(data.title), left, sy(110), {
        anchor: 'top', style: 'bold', family: SERIF, size: 150, maxWidth: contentWidth,
        maxLines: 3, lineHeight: 0.98, color: pal.ink
    });
    ctx.fillStyle = pal.accent;
    ctx.fillRect(left, title.bottom + 18, 140, 12);

    const subject = drawParagraph(ctx, upper(data.subject), left, title.bottom + 58, {
        anchor: 'top', style: '600', family: SANS, size: 38, spacing: 2, maxWidth: contentWidth,
        maxLines: 2, color: pal.ink
    });

    // logo on the left, college name and address next to it
    const logoY = Math.max(subject.bottom + 70, sy(600)) + 95;
    drawLogo(ctx, data, pal, left + 115, logoY, 230, 190);
    const college = drawParagraph(ctx, data.college, left + 270, logoY - 95, {
        anchor: 'top', style: 'bold', family: SERIF, size: 46, maxWidth: 500,
        maxLines: 3, color: pal.ink
    });
    drawParagraph(ctx, data.address, left + 270, college.bottom + 8, {
        anchor: 'top', size: 23, maxWidth: 500, maxLines: 2, color: pal.soft
    });

    // details at the bottom
    const ruleY = sy(1040);
    drawRule(ctx, left, 960, ruleY, withAlpha(pal.ink, 0.25), 2);
    const columns = [
        { x: left, heading: data.toHeading, lines: data.to, width: 340 },
        { x: left + 400, heading: data.byHeading, lines: data.by, width: 370 }
    ];
    columns.forEach(function (col) {
        drawText(ctx, upper(col.heading), col.x, ruleY + 46, {
            style: 'bold', family: SANS, size: 23, spacing: 3, maxWidth: col.width, color: pal.panel
        });
        drawLines(ctx, col.lines.slice(0, 6), col.x, ruleY + 104, {
            size: 30, lineHeight: 46, availableHeight: height - (ruleY + 104) - 50,
            maxWidth: col.width, family: SERIF, color: pal.ink
        });
    });
}


/* 4. Certificate: double border, ornaments, everything centred */

function drawCertificate(ctx, data, pal, height) {
    const scale = height / 1536;
    const sy = function (v) { return v * scale; };
    const centerX = PAGE_WIDTH / 2;

    fillBackground(ctx, pal.bg, height);
    drawPhoto(ctx, data.photo, pal.bg, 50, sy(880), PAGE_WIDTH - 100, height - 50 - sy(880), 0.2);

    // double border with diamonds in the corners
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, PAGE_WIDTH - 60, height - 60);
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(50, 50, PAGE_WIDTH - 100, height - 100);
    [[50, 50], [PAGE_WIDTH - 50, 50], [50, height - 50], [PAGE_WIDTH - 50, height - 50]].forEach(function (corner) {
        drawDiamond(ctx, corner[0], corner[1], 13, pal.accent);
    });

    drawOrnament(ctx, centerX, sy(140), 120, pal);
    drawText(ctx, upper(data.title), centerX, sy(240), {
        family: SERIF, size: 118, spacing: 16, maxWidth: 820, color: pal.ink, align: 'center'
    });
    drawText(ctx, data.subject, centerX, sy(330), {
        style: 'italic', family: SERIF, size: 42, maxWidth: 820, color: pal.ink, align: 'center'
    });
    drawOrnament(ctx, centerX, sy(385), 120, pal);

    // logo inside a double ring
    const ringY = sy(575);
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 4;
    circlePath(ctx, centerX, ringY, 172);
    ctx.stroke();
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 1.5;
    circlePath(ctx, centerX, ringY, 162);
    ctx.stroke();
    drawLogo(ctx, data, pal, centerX, ringY, 270, 220);

    drawParagraph(ctx, data.college, centerX, sy(835), {
        anchor: 'center', style: 'bold', family: SERIF, size: 58, maxWidth: 820,
        maxLines: 2, lineHeight: 1.12, color: pal.ink, align: 'center'
    });
    drawText(ctx, data.address, centerX, sy(925), {
        style: 'italic', family: SERIF, size: 26, maxWidth: 820, color: pal.soft, align: 'center'
    });
    drawOrnament(ctx, centerX, sy(975), 120, pal);

    // two centred columns, thin line between
    const footerTop = height - 150;
    ctx.fillStyle = pal.ink;
    ctx.fillRect(centerX - 0.75, sy(1010), 1.5, footerTop - sy(1010) - 24);
    const columns = [
        { x: 290, heading: data.toHeading, lines: data.to },
        { x: 734, heading: data.byHeading, lines: data.by }
    ];
    columns.forEach(function (col) {
        drawText(ctx, upper(col.heading), col.x, sy(1035), {
            style: 'bold', family: SERIF, size: 24, spacing: 5, maxWidth: 400,
            color: pal.accent, align: 'center'
        });
        drawLines(ctx, col.lines.slice(0, 6), col.x, sy(1090), {
            size: 32, lineHeight: 46, availableHeight: footerTop - 24 - sy(1090), maxWidth: 400,
            family: SERIF, color: pal.ink, align: 'center'
        });
    });

    ctx.fillStyle = pal.panel;
    ctx.fillRect(50, footerTop, PAGE_WIDTH - 100, 74);
    drawText(ctx, upper(data.dept), centerX, footerTop + 37, {
        family: SERIF, size: 24, spacing: 5, maxWidth: 840, color: pal.ink, align: 'center'
    });
}


/* 5. Poster: dark page, huge title, details on a lower panel */

function drawPoster(ctx, data, pal, height) {
    const scale = height / 1536;
    const sy = function (v) { return v * scale; };

    fillBackground(ctx, pal.bg, height);

    // faint rings behind the title
    ctx.strokeStyle = withAlpha(pal.ink, 0.08);
    ctx.lineWidth = 3;
    [200, 300, 400].forEach(function (radius) {
        circlePath(ctx, PAGE_WIDTH - 40, sy(240), radius);
        ctx.stroke();
    });
    ctx.fillStyle = pal.accent;
    ctx.fillRect(80, sy(60), 70, 12);

    // last line of the title gets the accent colour
    const title = drawParagraph(ctx, upper(data.title), 80, sy(130), {
        anchor: 'top', style: '800', family: SANS, size: 230, maxWidth: 864,
        maxLines: 3, lineHeight: 0.92,
        color: function (i, count) { return i === count - 1 ? pal.accent : pal.ink; }
    });

    // subject in a filled tag
    const subject = upper(data.subject);
    const subjectSize = fitFontSize(ctx, subject, 'bold', SANS, 34, 800, 3, 16);
    const subjectWidth = ctx.measureText(subject).width;
    const tagY = title.bottom + 34;
    const tagHeight = subjectSize + 38;
    ctx.fillStyle = pal.accent;
    roundedRect(ctx, 80, tagY, subjectWidth + 56, tagHeight, 12);
    ctx.fill();
    drawText(ctx, subject, 108, tagY + tagHeight / 2, {
        style: 'bold', family: SANS, size: subjectSize, spacing: 3, color: pal.onAccent
    });

    // logo on a white plate so it stays readable on dark colours
    const rowY = tagY + tagHeight + 64;
    ctx.fillStyle = '#FFFFFF';
    roundedRect(ctx, 80, rowY, 210, 180, 22);
    ctx.fill();
    drawLogo(ctx, data, pal, 185, rowY + 90, 180, 150);
    const college = drawParagraph(ctx, data.college, 322, rowY, {
        anchor: 'top', style: 'bold', family: SANS, size: 46, maxWidth: 620,
        maxLines: 3, color: pal.ink
    });
    drawParagraph(ctx, data.address, 322, college.bottom + 8, {
        anchor: 'top', size: 24, maxWidth: 620, maxLines: 2, color: pal.soft
    });

    // lower panel
    const panelTop = Math.max(rowY + 240, sy(930));
    ctx.fillStyle = pal.panel;
    ctx.fillRect(0, panelTop, PAGE_WIDTH, height - panelTop);
    drawPhoto(ctx, data.photo, pal.panel, 0, panelTop, PAGE_WIDTH, height - panelTop, 0.25);

    const columns = [
        { x: 80, heading: data.toHeading, lines: data.to },
        { x: 540, heading: data.byHeading, lines: data.by }
    ];
    columns.forEach(function (col) {
        drawText(ctx, upper(col.heading), col.x, panelTop + 62, {
            style: 'bold', family: SANS, size: 23, spacing: 5, maxWidth: 400, color: pal.accent
        });
        drawLines(ctx, col.lines.slice(0, 6), col.x, panelTop + 118, {
            size: 31, lineHeight: 46, availableHeight: height - 100 - (panelTop + 118),
            maxWidth: 400, family: SERIF, color: pal.ink
        });
    });
    drawText(ctx, upper(data.dept), PAGE_WIDTH / 2, height - 52, {
        style: '600', family: SANS, size: 22, spacing: 5, maxWidth: 880,
        color: mixColors(pal.ink, pal.panel, 0.4), align: 'center'
    });
}


/* 6. Geometric: big colour circles, left-aligned text */

function drawGeometric(ctx, data, pal, height) {
    const scale = height / 1536;
    const sy = function (v) { return v * scale; };

    fillBackground(ctx, pal.bg, height);
    drawPhoto(ctx, data.photo, pal.bg, 0, sy(800), PAGE_WIDTH, height - sy(800), 0.16);

    // circles: two top right, one bottom left
    ctx.fillStyle = pal.panel;
    circlePath(ctx, PAGE_WIDTH - 30, 60, 380);
    ctx.fill();
    ctx.fillStyle = pal.accent;
    circlePath(ctx, PAGE_WIDTH - 30, 60, 215);
    ctx.fill();
    ctx.fillStyle = pal.panel;
    circlePath(ctx, 0, height, 170);
    ctx.fill();

    drawLogo(ctx, data, pal, 190, sy(175), 240, 190);
    const college = drawParagraph(ctx, data.college, 70, sy(300), {
        anchor: 'top', style: 'bold', family: SERIF, size: 44, maxWidth: 560,
        maxLines: 3, color: pal.ink
    });
    const address = drawParagraph(ctx, data.address, 70, college.bottom + 8, {
        anchor: 'top', size: 23, maxWidth: 560, maxLines: 2, color: pal.soft
    });

    const title = drawParagraph(ctx, upper(data.title), 70, Math.max(address.bottom + 50, sy(560)), {
        anchor: 'top', style: '800', family: SANS, size: 130, maxWidth: 880,
        maxLines: 2, lineHeight: 0.98, color: pal.ink
    });
    ctx.fillStyle = pal.accent;
    ctx.fillRect(70, title.bottom + 18, 160, 12);
    const subject = drawParagraph(ctx, upper(data.subject), 70, title.bottom + 56, {
        anchor: 'top', style: '600', family: SANS, size: 40, spacing: 2, maxWidth: 880,
        maxLines: 2, color: pal.ink
    });

    const detailsY = Math.max(subject.bottom + 72, sy(1020));
    const columns = [
        { x: 70, heading: data.toHeading, lines: data.to, width: 400 },
        { x: 540, heading: data.byHeading, lines: data.by, width: 420 }
    ];
    columns.forEach(function (col) {
        drawText(ctx, upper(col.heading), col.x, detailsY, {
            style: 'bold', family: SANS, size: 23, spacing: 4, maxWidth: col.width, color: pal.ink
        });
        ctx.fillStyle = pal.accent;
        ctx.fillRect(col.x, detailsY + 20, 56, 6);
        drawLines(ctx, col.lines.slice(0, 6), col.x, detailsY + 62, {
            size: 31, lineHeight: 44, availableHeight: height - 90 - (detailsY + 62),
            maxWidth: col.width, family: SERIF, color: pal.ink
        });
    });
    drawText(ctx, upper(data.dept), PAGE_WIDTH - 70, height - 46, {
        style: '600', family: SANS, size: 21, spacing: 3, maxWidth: 640,
        color: pal.ink, align: 'right'
    });
}


/* the 24 designs: layouts in order, four palettes each */

const LAYOUTS = [drawClassic, drawBand, drawSide, drawCertificate, drawPoster, drawGeometric];

const DESIGNS = PALETTE_DATA.map(function (base, i) {
    return {
        draw: LAYOUTS[Math.floor(i / 4)],
        palette: buildPalette(base)
    };
});

function renderCover(ctx, design, data, height) {
    ctx.save();
    ctx.imageSmoothingQuality = 'high';
    design.draw(ctx, data, design.palette, height);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.restore();
}
