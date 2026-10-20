const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const PI = Math.PI;
const sqrt = Math.sqrt;

// Global variables for screen dimensions
let SCREEN_WIDTH;
let SCREEN_HEIGHT;

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
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
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

    move() {
        this.x += this.vx;
        this.y += this.vy;

        let acc = [0, 0];

        for (let i = 0; i < this.key.length; i++) {
            if (keys[this.key[i][0]]) {
                acc[0] += this.key[i][1];
                acc[1] += this.key[i][2];
            }
        }

        let inv_norm_acc = 1 / (sqrt(acc[0] * acc[0] + acc[1] * acc[1]) || 1);
        this.vx += acc[0] * inv_norm_acc * this.acc_speed;
        this.vy += acc[1] * inv_norm_acc * this.acc_speed;

        this.vx *= friction;
        this.vy *= friction;
    }

    edgeCollision(e = 0.5) {
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
        this.x = SCREEN_WIDTH / 2;
        this.y = SCREEN_HEIGHT / 2;
        this.vx = 0;//(Math.random() - 0.5) * 15;
        this.vy = 0;//(Math.random() - 0.5) * 15;
    }

    draw() {
        fillCircle(this.x, this.y, this.size, this.color);
        drawCircle(this.x, this.y, this.size, [0,0,0], 1, 2);
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= friction;
        this.vy *= friction;
    }

    edgeCollision(e = 0.9) {
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
const textColor = [50, 50, 50];
const lineWidth = 10;
const goalWidth = SCREEN_WIDTH / 15;
const goalHeight = SCREEN_HEIGHT / 3;

// Function to reset the game state and create new players and ball
function ResetGame() {
    const p1 = new Player(goalWidth * 2, SCREEN_HEIGHT / 2, [255, 0, 0], [
        ["q", -1, 0],
        ["d", 1, 0],
        ["s", 0, 1],
        ["z", 0, -1],
    ]);
    const p2 = new Player(SCREEN_WIDTH - goalWidth * 2, SCREEN_HEIGHT / 2, [0, 0, 255], [
        ["ArrowLeft", -1, 0],
        ["ArrowRight", 1, 0],
        ["ArrowDown", 0, 1],
        ["ArrowUp", 0, -1],
    ]);

    const objects = [p1, p2];
    objects.push(new Ball(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, [255, 255, 255]));
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
    drawCircle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / 4, lineColor, 1, lineWidth);
    fillCircle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / 40, lineColor);
    fillRect((SCREEN_WIDTH - lineWidth) / 2, 0, lineWidth, SCREEN_HEIGHT, lineColor);

    goal1 = [0, (SCREEN_HEIGHT - goalHeight) / 2, goalWidth, goalHeight];
    goal2 = [SCREEN_WIDTH - goalWidth, (SCREEN_HEIGHT - goalHeight) / 2, goalWidth, goalHeight];

    drawRect(goal1[0], goal1[1], goal1[2], goal1[3], [255, 0, 0], 1, lineWidth);
    drawRect(goal2[0], goal2[1], goal2[2], goal2[3], [0, 0, 255], 1, lineWidth);
    drawRect(0, (SCREEN_HEIGHT - goalHeight * 1.5) / 2, goalWidth * 1.5, goalHeight * 1.5, lineColor, 1, lineWidth);
    drawRect(SCREEN_WIDTH - goalWidth * 1.5, (SCREEN_HEIGHT - goalHeight * 1.5) / 2, goalWidth * 1.5, goalHeight * 1.5, lineColor, 1, lineWidth);
}

// Game state variables
let score1 = 0;
let score2 = 0;
let running = true;
let loops = 0;
let state = "start";

function gameLoop() {
    // Redraw
    font();
    // Game state management
    if (state === "start") {
        // drawMenu();
        objects = ResetGame();
        state = "play";
    }

    if (state === "play") {
        drawText(score1 + "/" + score2, SCREEN_WIDTH / 2 - 30, 32, 30, textColor);

        for (const obj of objects) {
            obj.draw();
        }

        // Move all objects and check for goals
        for (const obj of objects) {
            obj.move();

            if (obj.type === "ball") {
                if (isInGoal(obj, goal1)) {
                    score2++;
                    obj.reset();
                    state = "start";
                }

                if (isInGoal(obj, goal2)) {
                    score1++;
                    obj.reset();
                    state = "start";
                }
            }
        }

        // Collision detection and resolution
        const collisionPairs = [];

        for (let i = 0; i < objects.length; i++) {
            objects[i].edgeCollision();
            for (let j = i + 1; j < objects.length; j++) {
                collisionPairs.push([objects[i], objects[j]]);
            }
        }

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
    loops++;

    if (running) {
        requestAnimationFrame(gameLoop);
    }
}

// setupMenu();
gameLoop();