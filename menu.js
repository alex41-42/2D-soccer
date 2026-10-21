function drawMenu() {
    fillRect(-50, SCREEN_HEIGHT / 3, SCREEN_WIDTH + 100, SCREEN_HEIGHT / 3, [255, 255, 255]);
    drawRect(-50, SCREEN_HEIGHT / 3, SCREEN_WIDTH + 100, SCREEN_HEIGHT / 3, textColor, 1, lineWidth);
    drawText(score1 + "/" + score2, SCREEN_WIDTH / 2 - 30, SCREEN_HEIGHT / 2 + 50, 30, textColor);
    drawText("Score", SCREEN_WIDTH / 2 - 120, SCREEN_HEIGHT / 2 - 15, 30, textColor);
}