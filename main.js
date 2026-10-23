const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const PI = Math.PI;
const sqrt = Math.sqrt;

// Global variables for screen dimensions
let SCREEN_WIDTH;
let SCREEN_HEIGHT;
let goalWidth;
let goalHeight;

// Cache for color conversions to improve performance
const colorCache = new Map();

function RGBtoHEX(col, A = 1) {
    const key = `${col[0]},${col[1]},${col[2]},${A}`;

    if (!colorCache.has(key)) {
        colorCache.set(key, `rgba(${col[0]},${col[1]},${col[2]},${A})`);
    }

    return colorCache.get(key);
}

// Drawing functions
function fillRect(x, y, w, h, color, A = 1) {
    ctx.fillStyle = RGBtoHEX(color, A);
    ctx.fillRect(x, y, w, h);
}

function drawRect(x, y, w, h, color1, A = 1, L = 1) {
    ctx.strokeStyle = RGBtoHEX(color1, A);
    ctx.lineWidth = L;
    ctx.strokeRect(x, y, w, h);
}

function fillCircle(x, y, r, color, A = 1) {
    ctx.fillStyle = RGBtoHEX(color, A);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * PI);
    ctx.fill();
}

function drawCircle(x, y, r, color, A = 1, L = 1) {
    ctx.strokeStyle = RGBtoHEX(color, A);
    ctx.lineWidth = L;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * PI);
    ctx.stroke();
}

function drawText(text, x, y, s, color, A = 1) {
    ctx.font = `${s}px courier`;
    ctx.fillStyle = RGBtoHEX(color, A);
    ctx.fillText(text, x, y);
}

// Function to resize the canvas to fit the window
function resizeCanvas() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    goalWidth = SCREEN_WIDTH / 15;
    goalHeight = SCREEN_HEIGHT / 3;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const keys = {};
let score = [0, 0];
let loops = 0;
let state = "menu";
let selectedMenuOption = 0;
let lastTime = 0;
let elapsedTime = 0;
let deltaTime = 1;

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.repeat) return;

    if (state === "menu") {
        if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
            selectedMenuOption = (selectedMenuOption + 2) % 3;
            e.preventDefault();
        } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
            selectedMenuOption = (selectedMenuOption + 1) % 3;
            e.preventDefault();
        } else if (e.key === "Enter") {
            activateMenuOption(selectedMenuOption);
            e.preventDefault();
        }
        return;
    }

    if (state === "howToPlay" && (e.key === "Enter" || e.key === "Escape")) {
        state = "menu";
        e.preventDefault();
    } else if (state === "quit" && e.key === "Escape") {
        state = "menu";
        e.preventDefault();
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function activateMenuOption(index) {
    if (index === 0) {
        score = [0, 0];
        loops = 0;
        state = "start";
        keys.enterWasPressed = true;
    } else if (index === 1) {
        state = "howToPlay";
    } else if (index === 2) {
        state = "quit";
    }
}

canvas.addEventListener("click", (e) => {
    const bounds = canvas.getBoundingClientRect();
    const x = (e.clientX - bounds.left) * (canvas.width / bounds.width);
    const y = (e.clientY - bounds.top) * (canvas.height / bounds.height);

    if (state === "menu") {
        const option = getMenuOptionAt(x, y);
        if (option !== -1) {
            selectedMenuOption = option;
            activateMenuOption(option);
        }
    } else if (state === "howToPlay") {
        state = "menu";
    } else if (state === "quit") {
        state = "menu";
    }
});

// Player class representing a player in the game
class Player {
    constructor(X, Y, COLOR, KEY) {
        this.type = "player";
        this.y = Y;
        this.x = X;
        this.size = 20;
        this.mass = 10;
        this.vx = 0;
        this.vy = 0;
        this.acc_speed = 0.5;
        this.color = COLOR;
        this.key = KEY;
    }

    draw() {
        const inv_v = 1/(sqrt(this.vx * this.vx + this.vy * this.vy) || 1);

        fillCircle(this.x, this.y, this.size, this.color);
        drawCircle(this.x, this.y, this.size, [0,0,0], 1, 2);

        ctx.strokeStyle = RGBtoHEX([0, 0, 0]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (this.vx * inv_v) * this.size, this.y + (this.vy * inv_v) * this.size);
        ctx.stroke();
    }

    move(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        let acc = [0, 0];

        for (let i = 0; i < this.key.length; i++) {
            if (keys[this.key[i][0]]) {
                acc[0] += this.key[i][1];
                acc[1] += this.key[i][2];
            }
        }

        let inv_norm_acc = 1 / (sqrt(acc[0] * acc[0] + acc[1] * acc[1]) || 1);
        this.vx += acc[0] * inv_norm_acc * this.acc_speed * deltaTime;
        this.vy += acc[1] * inv_norm_acc * this.acc_speed * deltaTime;

        this.vx *= Math.pow(friction, deltaTime);
        this.vy *= Math.pow(friction, deltaTime);
    }

    edgeCollision() {
        if (this.x < this.size) {
            this.vx = 0;
            this.x = this.size;
        }

        if (this.y < this.size) {
            this.vy = 0;
            this.y = this.size;
        }

        if (this.x + this.size > SCREEN_WIDTH) {
            this.vx = 0;
            this.x = SCREEN_WIDTH - this.size;
        }

        if (this.y + this.size > SCREEN_HEIGHT) {
            this.vy = 0;
            this.y = SCREEN_HEIGHT - this.size;
        }
    }
}

// Ball class representing the ball in the game
class Ball {
    constructor(X, Y, COLOR) {
        this.type = "ball";
        this.y = Y;
        this.x = X;
        this.size = 30;
        this.mass = 1;
        this.vx = 0;//(Math.random() - 0.5) * 15;
        this.vy = 0;//(Math.random() - 0.5) * 15;
        this.color = COLOR;
    }

    reset() {
        this.x = SCREEN_WIDTH * 0.5;
        this.y = SCREEN_HEIGHT * 0.5;
        this.vx = 0;//(Math.random() - 0.5) * 15;
        this.vy = 0;//(Math.random() - 0.5) * 15;
    }

    draw() {
        fillCircle(this.x, this.y, this.size, this.color);
        drawCircle(this.x, this.y, this.size, [0,0,0], 1, 2);
    }

    move(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vx *= Math.pow(friction, deltaTime);
        this.vy *= Math.pow(friction, deltaTime);
    }

    edgeCollision(e = 0.75) {
        if (this.x < this.size) {
            this.vx *= -e;
            this.vy *= e;
            this.x = this.size;
        }

        if (this.y < this.size) {
            this.vy *= -e;
            this.vx *= e;
            this.y = this.size;
        }

        if (this.x + this.size > SCREEN_WIDTH) {
            this.vx *= -e;
            this.vy *= e;
            this.x = SCREEN_WIDTH - this.size;
        }

        if (this.y + this.size > SCREEN_HEIGHT) {
            this.vy *= -e;
            this.vx *= e;
            this.y = SCREEN_HEIGHT - this.size;
        }
    }
}

// Game constants
const friction = 0.975;
// Colors and dimensions for the game elements
const fontColor = [50, 170, 80];
const lineColor = [230, 255, 230];
const textColor = [20, 50, 20];
const lineWidth = 10;

// Function to reset the game state and create new players and ball
function ResetGame() {
    const p1 = new Player(goalWidth * 2, SCREEN_HEIGHT * 0.5, [255, 0, 0], [
        ["q", -1, 0],
        ["d", 1, 0],
        ["s", 0, 1],
        ["z", 0, -1],
    ]);
    const p2 = new Player(SCREEN_WIDTH - goalWidth * 2, SCREEN_HEIGHT * 0.5, [0, 0, 255], [
        ["ArrowLeft", -1, 0],
        ["ArrowRight", 1, 0],
        ["ArrowDown", 0, 1],
        ["ArrowUp", 0, -1],
    ]);

    const objects = [p1, p2];
    objects.push(new Ball(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5, [255, 255, 255]));
    return objects;
}

let objects = ResetGame();
let goal1;
let goal2;

function isInGoal(obj, goal) {
    return obj.x > goal[0]
        && obj.x < goal[0] + goal[2]
        && obj.y > goal[1]
        && obj.y < goal[1] + goal[3];
}

function resolveCollision(a, b, e = 0.75) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = sqrt(dx * dx + dy * dy) || 0.0001;
    const overlap = a.size + b.size - dist;
    if (overlap <= 0) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const invA = 1 / a.mass;
    const invB = 1 / b.mass;
    const sum_inv = invA + invB;

    a.x += nx * overlap * invA / sum_inv;
    a.y += ny * overlap * invA / sum_inv;
    b.x -= nx * overlap * invB / sum_inv;
    b.y -= ny * overlap * invB / sum_inv;

    const rvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (rvn > 0) return;
    const j = -(1 + e) * rvn / sum_inv;
    a.vx += j * invA * nx;
    a.vy += j * invA * ny;
    b.vx -= j * invB * nx;
    b.vy -= j * invB * ny;
}

function font() {
    // Redraw the font
    fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, fontColor);
    drawCircle(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT / 4, lineColor, 1, lineWidth);
    fillCircle(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT / 40, lineColor);
    fillRect((SCREEN_WIDTH - lineWidth) * 0.5, 0, lineWidth, SCREEN_HEIGHT, lineColor);

    goal1 = [0, (SCREEN_HEIGHT - goalHeight) * 0.5, goalWidth, goalHeight];
    goal2 = [SCREEN_WIDTH - goalWidth, (SCREEN_HEIGHT - goalHeight) * 0.5, goalWidth, goalHeight];

    drawRect(goal1[0], goal1[1], goal1[2], goal1[3], [255, 0, 0], 1, lineWidth);
    drawRect(goal2[0], goal2[1], goal2[2], goal2[3], [0, 0, 255], 1, lineWidth);
    drawRect(0, (SCREEN_HEIGHT - goalHeight * 1.5) * 0.5, goalWidth * 1.5, goalHeight * 1.5, lineColor, 1, lineWidth);
    drawRect(SCREEN_WIDTH - goalWidth * 1.5, (SCREEN_HEIGHT - goalHeight * 1.5) * 0.5, goalWidth * 1.5, goalHeight * 1.5, lineColor, 1, lineWidth);
}

function drawScore() {
    // band
    fillRect(-50, SCREEN_HEIGHT / 3, SCREEN_WIDTH + 100, SCREEN_HEIGHT / 3, [255, 255, 255]);
    drawRect(-50, SCREEN_HEIGHT / 3, SCREEN_WIDTH + 100, SCREEN_HEIGHT / 3, textColor, 1, lineWidth);
    // Text
    drawText(`${score[0]}`, SCREEN_WIDTH * 0.5 - ctx.measureText(`${score[0]}`).width - 10, SCREEN_HEIGHT * 0.5 + 50, 30, textColor);
    drawText(`${score[1]}`, SCREEN_WIDTH * 0.5 + 10, SCREEN_HEIGHT * 0.5 + 50, 30, textColor);
    drawText("/", SCREEN_WIDTH * 0.5 - 10, SCREEN_HEIGHT * 0.5 + 50, 30, textColor);
    drawText("Score:", SCREEN_WIDTH * 0.5 - ctx.measureText("Score:").width * 0.5, SCREEN_HEIGHT * 0.5 - 15, 30, textColor);
}

function displayScore(score) {
    // Display the score on the screen
    drawText(`${score[0]}`, SCREEN_WIDTH * 0.5 - ctx.measureText(`${score[0]}`).width - 10, 32, 30, textColor);
    drawText(`${score[1]}`, SCREEN_WIDTH * 0.5 + 10, 32, 30, textColor);
    drawText("/", SCREEN_WIDTH * 0.5 - 10, 32, 30, textColor);
}

function moveObjects(deltaTime) {
    for (const obj of objects) {
        obj.move(deltaTime);
    }
}

function checkGoals() {
    for (const obj of objects) {
        if (obj.type !== "ball") continue;

        if (isInGoal(obj, goal1)) {
            score[1]++;
            obj.reset();
            state = "start";
        } else if (isInGoal(obj, goal2)) {
            score[0]++;
            obj.reset();
            state = "start";
        }
    }
}

function getCollisionPairs() {
    const collisionPairs = [];

    for (let i = 0; i < objects.length; i++) {
        objects[i].edgeCollision();
        for (let j = i + 1; j < objects.length; j++) {
            collisionPairs.push([objects[i], objects[j]]);
        }
    }

    return collisionPairs;
}

function resolveObjectCollisions() {
    const collisionPairs = getCollisionPairs();

    if (loops % 2 !== 0) {
        collisionPairs.reverse();
    }

    for (let i = 0; i < 4; i++) {
        collisionPairs.reverse();
        for (const [a, b] of collisionPairs) {
            resolveCollision(a, b);
        }
    }
}

function updatePhysics() {
    moveObjects(deltaTime);
    checkGoals();
    resolveObjectCollisions();
}

function updateStartState() {
    drawScore();
    const prompt = "Press Enter to Play";
    drawCenteredText(prompt, SCREEN_HEIGHT * 0.72, 24, textColor);
    objects = ResetGame();

    if (keys["Enter"] && !keys.enterWasPressed) {
        state = "play";
        lastTime = 0;
    }

    keys.enterWasPressed = Boolean(keys["Enter"]);
}

function drawObjects() {
    for (const obj of objects) {
        obj.draw();
    }
}

function updateDeltaTime(timestamp) {
    if (lastTime === 0) {
        lastTime = timestamp;
    }

    elapsedTime = (timestamp - lastTime) / 1000;
    deltaTime = Math.min(elapsedTime * 60, 3);
    lastTime = timestamp;
}

function updatePlayState(timestamp) {
    displayScore(score);
    drawObjects();
    updateDeltaTime(timestamp);
    updatePhysics();
    loops++;
}

function gameLoop(timestamp = 0) {
    font();

    if (state === "menu") {
        drawMenu(selectedMenuOption);
    } else if (state === "howToPlay") {
        drawHowToPlay();
    } else if (state === "quit") {
        drawQuitScreen();
    } else if (state === "start") {
        updateStartState();
    } else if (state === "play") {
        updatePlayState(timestamp);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();