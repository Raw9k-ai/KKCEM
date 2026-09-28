// Colour helpers and the 24 palettes.
// Every design is a layout plus one palette; palettes 0-3 go with the
// classic layout, 4-7 with the band layout, and so on.

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return [0, 2, 4].map(function (i) {
        return parseInt(hex.substr(i, 2), 16);
    });
}

function rgbToHex(rgb) {
    return '#' + rgb.map(function (v) {
        return Math.round(v).toString(16).padStart(2, '0');
    }).join('');
}

// blend colour a towards colour b; t is 0..1
function mixColors(a, b, t) {
    const from = hexToRgb(a);
    const to = hexToRgb(b);
    return rgbToHex(from.map(function (v, i) {
        return v + (to[i] - v) * t;
    }));
}

function withAlpha(hex, alpha) {
    const [r, g, b] = hexToRgb(hex);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function luminance(hex) {
    const [r, g, b] = hexToRgb(hex).map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// readable text colour to put on top of a background
function textOn(hex) {
    return luminance(hex) > 0.42 ? '#101A2E' : '#FFFFFF';
}

const PALETTE_DATA = [
    // classic
    { name: 'Navy & gold',         bg: '#FFFFFF', ink: '#0B2350', accent: '#D4A64A', panel: '#F5EFE0' },
    { name: 'Emerald & copper',    bg: '#FAFAF6', ink: '#0E4B3B', accent: '#C2703D', panel: '#E6F0EA' },
    { name: 'Maroon & rose',       bg: '#FFFBFA', ink: '#5B1526', accent: '#C0606F', panel: '#F7E7E7' },
    { name: 'Graphite & teal',     bg: '#FFFFFF', ink: '#1F2933', accent: '#159C96', panel: '#E4F2F1' },

    // band
    { name: 'Royal blue',          bg: '#F7F9FF', ink: '#10224A', accent: '#F2B233', panel: '#1B3FA0' },
    { name: 'Crimson',             bg: '#FFF8F5', ink: '#3B0F14', accent: '#F0A35E', panel: '#B3202F' },
    { name: 'Forest',              bg: '#F6FAF4', ink: '#12321F', accent: '#E6BE4F', panel: '#1E6B45' },
    { name: 'Violet',              bg: '#FAF7FF', ink: '#2A1650', accent: '#FF8AB0', panel: '#5B33B5' },

    // side stripe
    { name: 'Ocean',               bg: '#F4FAFC', ink: '#0B3A4A', accent: '#F26B4F', panel: '#0F5E77' },
    { name: 'Charcoal & amber',    bg: '#FAFAF8', ink: '#23272B', accent: '#F59E0B', panel: '#2D3339' },
    { name: 'Plum & mint',         bg: '#FBF8FB', ink: '#3A1F44', accent: '#2FB59A', panel: '#6A2E7F' },
    { name: 'Teal & sand',         bg: '#FBF7EE', ink: '#10403E', accent: '#D9822B', panel: '#146C68' },

    // certificate
    { name: 'Ivory & bordeaux',    bg: '#FBF6EA', ink: '#4A1420', accent: '#A67C2E', panel: '#F1E6CE' },
    { name: 'Paper & ink',         bg: '#F8F6F0', ink: '#1C2E5A', accent: '#8C6D2F', panel: '#ECE7D8' },
    { name: 'Sage & bronze',       bg: '#F3F5EC', ink: '#2C3E2A', accent: '#9A6B32', panel: '#E3E9D3' },
    { name: 'Monochrome',          bg: '#FFFFFF', ink: '#1A1A1A', accent: '#6E6E6E', panel: '#EDEDED' },

    // poster (dark backgrounds)
    { name: 'Midnight & coral',    bg: '#0D1B3D', ink: '#F5F1E8', accent: '#FF6B57', panel: '#16295A' },
    { name: 'Purple & gold',       bg: '#1B1035', ink: '#F4EEFF', accent: '#F5C542', panel: '#2A1A55' },
    { name: 'Pine & peach',        bg: '#0F2A24', ink: '#F1F5EE', accent: '#FFA87A', panel: '#173A32' },
    { name: 'Slate & cyan',        bg: '#1E2530', ink: '#EEF3F7', accent: '#3CCFE0', panel: '#2A3442' },

    // geometric
    { name: 'Sky & sun',           bg: '#FFFFFF', ink: '#12324F', accent: '#FFB400', panel: '#DCEBFA' },
    { name: 'Coral & navy',        bg: '#FFF9F6', ink: '#14213D', accent: '#FF5A4E', panel: '#FFE3DC' },
    { name: 'Mint & green',        bg: '#F5FBF8', ink: '#0C3B2E', accent: '#2BB08A', panel: '#D8F1E7' },
    { name: 'Lilac & indigo',      bg: '#FAF8FF', ink: '#22206B', accent: '#7C6CF0', panel: '#E6E2FF' }
];

// add the colours that can be worked out from the four base ones
function buildPalette(base) {
    return {
        name: base.name,
        bg: base.bg,
        ink: base.ink,
        accent: base.accent,
        panel: base.panel,
        soft: mixColors(base.ink, base.bg, 0.42),
        onPanel: textOn(base.panel),
        onAccent: textOn(base.accent),
        highlight: mixColors(base.accent, '#FFFFFF', 0.6)
    };
}
