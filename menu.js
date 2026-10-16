function drawMenu() {
    const panelWidth = Math.min(520, SCREEN_WIDTH - 32);
    const panelHeight = 230;
    const panelX = (SCREEN_WIDTH - panelWidth) / 2;
    const panelY = (SCREEN_HEIGHT - panelHeight) / 2;
    const titleSize = Math.min(36, panelWidth / 10);
    const actionSize = Math.min(16, (panelWidth - 48) / 24);

    fillRect(panelX, panelY, panelWidth, panelHeight, lineColor);
    drawRect(panelX, panelY, panelWidth, panelHeight, textColor, 1, 4);
    fillRect(panelX, panelY, panelWidth, 12, fontColor);

    drawText("2D SOCCER", panelX + 28, panelY + 72, titleSize, textColor);
    drawText(`SCORE  ${score1} - ${score2}`, panelX + 28, panelY + 132, 22, textColor);
    drawText("ENTREE / CLIC POUR JOUER", panelX + 24, panelY + 190, actionSize, textColor);

    if (keys["Enter"]) {
        state = "play";
    }
}

function setupMenu() {
    canvas.addEventListener("pointerdown", () => {
        if (state === "start") {
            state = "play";
        }
    });
}
