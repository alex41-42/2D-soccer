const menuLabels = ["Play", "How to play", "Quit"];

function getMenuOptionBounds(index) {
    const width = Math.min(440, SCREEN_WIDTH - 40);
    const height = Math.min(58, Math.max(38, SCREEN_HEIGHT * 0.09));
    const gap = 12;
    const x = (SCREEN_WIDTH - width) * 0.5;
    const y = SCREEN_HEIGHT * 0.52 - (menuLabels.length * height + (menuLabels.length - 1) * gap) * 0.5;

    return [x, y + index * (height + gap), width, height];
}

function drawCenteredText(text, y, size, color) {
    ctx.font = `${size}px courier`;
    drawText(text, (SCREEN_WIDTH - ctx.measureText(text).width) * 0.5, y, size, color);
}

function drawMenu(selectedOption) {
    fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, fontColor);
    drawCenteredText("2D Soccer", SCREEN_HEIGHT * 0.28, Math.min(56, SCREEN_WIDTH * 0.09), textColor);

    menuLabels.forEach((label, index) => {
        const [x, y, width, height] = getMenuOptionBounds(index);
        const textY = y + (height + 24) * 0.5;
        const textSize = index === selectedOption ? 32 : 24;
        ctx.font = `${textSize}px courier`;
        drawText(label, (SCREEN_WIDTH - ctx.measureText(label).width) * 0.5, textY, textSize, textColor);
    });

    drawCenteredText("Use the arrow keys or click an option", SCREEN_HEIGHT * 0.9, 16, textColor);
}

function getMenuOptionAt(x, y) {
    for (let index = 0; index < menuLabels.length; index++) {
        const [left, top, width, height] = getMenuOptionBounds(index);
        if (x >= left && x <= left + width && y >= top && y <= top + height) {
            return index;
        }
    }

    return -1;
}

function drawHowToPlay() {
    fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, fontColor);
    const width = Math.min(600, SCREEN_WIDTH - 40);
    const height = Math.min(340, SCREEN_HEIGHT - 40);
    const x = (SCREEN_WIDTH - width) * 0.5;
    const y = (SCREEN_HEIGHT - height) * 0.5;

    // fillRect(x, y, width, height, [255, 255, 255], 0.96);
    // drawRect(x, y, width, height, textColor, 1, 3);
    drawCenteredText("HOW TO PLAY", y + 58, Math.min(34, width * 0.08), textColor);
    drawCenteredText("Red player: Z Q S D", y + 124, 20, [180, 0, 0]);
    drawCenteredText("Blue player: arrow keys", y + 164, 20, [0, 0, 180]);
    drawCenteredText("Move your player and push the ball into the opponent's goal.", y + 214, 16, textColor);
    drawCenteredText("Press Enter or Escape to return to the menu", y + height - 32, 16, textColor);
}

function drawQuitScreen() {
    fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, fontColor);
    drawCenteredText("Thanks for playing!", SCREEN_HEIGHT * 0.45, 36, textColor);
    drawCenteredText("You can close this tab to quit.", SCREEN_HEIGHT * 0.55, 20, textColor);
    drawCenteredText("Press Escape to return to the menu.", SCREEN_HEIGHT * 0.62, 16, textColor);
}
