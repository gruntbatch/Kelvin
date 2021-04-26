/** Kelvin creates swatches of cool and warm colors
    Copyright (C) 2020  Peter Gregory

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. */

const CELL_COUNT = 5;
const CELL_WIDTH = 100 / (1 /* saturation bar */ + CELL_COUNT);
const CELL_HEIGHT = 100 / (CELL_COUNT);

const H_STEP = 4;
const S_STEP = 2;
const B_STEP = 2;

// Establish a line of communication with the host
var csInterface = new CSInterface();
var extensionId = csInterface.getExtensionID();
csInterface.addEventListener(
    "com.adobe.PhotoshopJSONCallback" + extensionId,
    photoshopEventCallback);

var eventExch = 1165517672; // "Exch"
var eventRset = 1383294324; // "Rset"
var eventSetd = 1936028772; // "setd"
register(eventExch);
register(eventSetd);
register(eventRset);

// Create client graphics
createPanel();
updatePanel();

function photoshopEventCallback(event) {
    updatePanel();
}

function onClickEventCallback(event) {
    dataset = event.currentTarget.dataset;
    setForegroundColor(dataset.h, dataset.s, dataset.b);
}

function register(eventId) {
    var event = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
    event.extensionId = extensionId;
    event.data = eventId.toString();
    csInterface.dispatchEvent(event);
}

function setForegroundColor(h, s, b) {
    csInterface.evalScript(`setForegroundHSB(${h}, ${s}, ${b})`);
}

function createPanel() {
    createSaturation();
    createPalette();
}

function createSaturation() {
    var saturation = document.querySelector("#saturation");
    saturation.style.width = `${CELL_WIDTH}vw`;
    saturation.style.height = `${CELL_COUNT * CELL_HEIGHT}vh`;

    var baseCell = document.createElement("div");
    baseCell.className = "float-left";
    baseCell.style.width = `${CELL_WIDTH}vw`;
    baseCell.style.height = `${CELL_HEIGHT}vh`;
    baseCell.dataset.h = 0;
    baseCell.dataset.s = 0;
    baseCell.dataset.b = 0;

    for (y = 0; y < CELL_COUNT; y++) {
        var cell = baseCell.cloneNode();
        cell.onclick = onClickEventCallback;
        saturation.appendChild(cell);
    }
}

function createPalette() {
    var palette = document.querySelector("#palette");

    var baseRow = document.createElement("div");
    baseRow.style.width = `${CELL_COUNT * CELL_WIDTH}vw`;
    baseRow.style.height = `${CELL_HEIGHT}vh`;

    var baseCol = document.createElement("div");
    baseCol.className = "float-left";
    baseCol.style.width = `${CELL_WIDTH}vw`;
    baseCol.style.height = `${CELL_HEIGHT}vh`;
    baseCol.dataset.h = 0;
    baseCol.dataset.s = 0;
    baseCol.dataset.b = 0;

    for (y = 0; y < CELL_COUNT; y++) {
        var row = baseRow.cloneNode();
        palette.appendChild(row);
        for (x = 0; x < CELL_COUNT; x++) {
            var cell = baseCol.cloneNode();
            cell.onclick = onClickEventCallback;
            row.appendChild(cell);
        }
    }
}

function updatePanel() {
    csInterface.evalScript("getForegroundHSB()", function (result) {
        var h, s, b;
        [h, s, b] = JSON.parse(result);
        updateSaturation(h, s, b);
        updatePalette(h, s, b);
    });
}

function updateSaturation(h, s, b) {
    var h_, s_, b_, l_;
    var saturation = document.querySelector("#saturation");
    for (y = 0; y < CELL_COUNT; y++) {
        h_ = h;
        s_ = clamp(s + S_STEP * -(y - 2), 0, 100);
        b_ = clamp(b + B_STEP * -(y - 2), 0, 100);
        cell = saturation.children[y];
        cell.dataset.h = h_;
        cell.dataset.s = s_;
        cell.dataset.b = b_;
        [h_, s_, l_] = hsb_to_hsl(h_, s_, b_);
        cell.style.background = `hsl(${h_}, ${s_}%, ${l_}%)`;
    }
}

function updatePalette(h, s, b) {
    var h_, s_, b_, l_;
    var palette = document.querySelector("#palette");
    for (y = 0; y < CELL_COUNT; y++) {
        for (x = 0; x < CELL_COUNT; x++) {
            h_ = (h + H_STEP * (x - 2)) % 360;
            s_ = clamp(s + S_STEP * (y - 2), 0, 100);
            b_ = clamp(b - B_STEP * (y - 2), 0, 100);
            cell = palette.children[y].children[x];
            cell.dataset.h = h_;
            cell.dataset.s = s_;
            cell.dataset.b = b_;
            [h_, s_, l_] = hsb_to_hsl(h_, s_, b_);
            cell.style.background = `hsl(${h_}, ${s_}%, ${l_}%)`;
        }
    }
}

// https://stackoverflow.com/a/31851617
function hsb_to_hsl(h, s, v) {
    s = s / 100;
    v = v / 100;
    // both hsv and hsl values are in [0, 1]
    var l = (2 - s) * v / 2;

    if (l != 0) {
        if (l == 1) {
            s = 0
        } else if (l < 0.5) {
            s = s * v / (l * 2)
        } else {
            s = s * v / (2 - l * 2)
        }
    }

    return [h, s * 100, l * 100]
}

// Is it easier to find a clamp function on so than to write your own?
// Of course it is.
// https://stackoverflow.com/a/11410079
function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}
