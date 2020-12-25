function getForegroundHSB() {
    var hsb = app.foregroundColor.hsb;
    return ["[", hsb.hue, ", ", hsb.saturation, ", ", hsb.brightness, "]"].join("");
}

function setForegroundHSB(h, s, b) {
    app.foregroundColor.hsb.hue = h;
    app.foregroundColor.hsb.saturation = s;
    app.foregroundColor.hsb.brightness = b;
}
