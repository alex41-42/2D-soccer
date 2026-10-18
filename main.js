const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const PI = Math.PI;
const sqrt = Math.sqrt;

let SCREEN_WIDTH;
let SCREEN_HEIGHT;

const colorCache = new Map();

function RGBtoHEX(col, A = 1) {
    const key = `${col[0]},${col[1]},${col[2]},${A}`;

    if (!colorCache.has(key)) {
        colorCache.set(key, `rgba(${col[0]},${col[1]},${col[2]},${A})`);
    }

    return colorCache.get(key);
}

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

class Player {
    constructor(X, Y, COLOR, KEY) {
        this.type = "player";
        this.y = Y;
        this.x = X;
        this.size = 20;
        this.mass = 100;
        this.vx = 0;
        this.vy = 0;
        this.color = COLOR;
        this.key = KEY;
    }

    draw() {
        const inv_v = 1/(sqrt(this.vx * this.vx + this.vy * this.vy) || 1);

        drawCircle(this.x, this.y, this.size, this.color, 1, 2);
        ctx.strokeStyle = RGBtoHEX(this.color);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (this.vx * inv_v) * this.size, this.y + (this.vy * inv_v) * this.size);
        ctx.stroke();
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= friction / 1.075;
        this.vy *= friction / 1.075;

        for (let i = 0; i < this.key.length; i++) {
            if (keys[this.key[i][0]]) {
                this.vx += this.key[i][1];
                this.vy += this.key[i][2];
            }
        }

        if (this.x < this.size) {
            this.vx *= -1;
            this.x = this.size;
        }

        if (this.y < this.size) {
            this.vy *= -1;
            this.y = this.size;
        }

        if (this.x + this.size > SCREEN_WIDTH) {
            this.vx *= -1;
            this.x = SCREEN_WIDTH - this.size;
        }

        if (this.y + this.size > SCREEN_HEIGHT) {
            this.vy *= -1;
            this.y = SCREEN_HEIGHT - this.size;
        }
    }
}

class Ball {
    constructor(X, Y, COLOR) {
        this.type = "ball";
        this.y = Y;
        this.x = X;
        this.size = 15;
        this.mass = 1;
        this.vx = 0;//(Math.random() - 0.5) * 15;
        this.vy = 0;//(Math.random() - 0.5) * 15;
        this.color = COLOR;
        this.color2 = [0, 0, 0];
    }

    reset() {
        this.x = SCREEN_WIDTH / 2;
        this.y = SCREEN_HEIGHT / 2;
        this.vx = 0;//(Math.random() - 0.5) * 15;
        this.vy = 0;//(Math.random() - 0.5) * 15;
    }

    draw() {
        fillCircle(this.x, this.y, this.size, this.color);
        drawCircle(this.x, this.y, this.size, this.color2, 1, 2);
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= friction;
        this.vy *= friction;

        if (this.x < this.size) {
            this.vx *= -1;
            this.x = this.size;
        }

        if (this.y < this.size) {
            this.vy *= -1;
            this.y = this.size;
        }

        if (this.x + this.size > SCREEN_WIDTH) {
            this.vx *= -1;
            this.x = SCREEN_WIDTH - this.size;
        }

        if (this.y + this.size > SCREEN_HEIGHT) {
            this.vy *= -1;
            this.y = SCREEN_HEIGHT - this.size;
        }
    }
}

const friction = 0.98;
const fontColor = [50, 170, 80];
const lineColor = [230, 255, 230];
const textColor = [50, 50, 50];
const lineWidth = 10;
const goalWidth = SCREEN_WIDTH / 15;
const goalHeight = SCREEN_HEIGHT / 3;

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

let score1 = 0;
let score2 = 0;
let running = true;
let state = "start";

function gameLoop() {
    fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, fontColor);
    drawCircle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / 4, lineColor, 1, lineWidth);
    fillCircle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / 40, lineColor);
    fillRect((SCREEN_WIDTH - lineWidth) / 2, 0, lineWidth, SCREEN_HEIGHT, lineColor);

    goal1 = [0, (SCREEN_HEIGHT - goalHeight) / 2, goalWidth, goalHeight];
    goal2 = [SCREEN_WIDTH - goalWidth, (SCREEN_HEIGHT - goalHeight) / 2, goalWidth, goalHeight];

    drawRect(goal1[0], goal1[1], goal1[2], goal1[3], [255, 0, 0], 1, lineWidth);
    drawRect(goal2[0], goal2[1], goal2[2], goal2[3], [0, 0, 255], 1, lineWidth);
    drawRect(0, (SCREEN_HEIGHT - goalHeight * 1.5) / 2, goalWidth * 1.5, goalHeight * 1.5, lineColor, 1, lineWidth);
    drawRect(
        SCREEN_WIDTH - goalWidth * 1.5,
        (SCREEN_HEIGHT - goalHeight * 1.5) / 2,
        goalWidth * 1.5,
        goalHeight * 1.5,
        lineColor,
        1,
        lineWidth,
    );

    if (state === "start") {
        drawMenu();
        objects = ResetGame();
    }

    if (state === "play") {
        drawText(score1 + "/" + score2, SCREEN_WIDTH / 2 - 30, 32, 30, textColor);

        for (const obj of objects) {
            obj.draw();
        }

        const players = objects.filter((obj) => obj.type === "player");
        const balls = objects.filter((obj) => obj.type === "ball");

        // Collisions joueur-joueur uniquement (physique normale)
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                const o1 = players[i];
                const o2 = players[j];
                const Size = o1.size + o2.size;
                const xd = o1.x - o2.x;
                const yd = o1.y - o2.y;
                const dist = sqrt(xd * xd + yd * yd);

                if (dist < Size) {
                    const Mass = o1.mass + o2.mass;
                    const V1 = sqrt(o1.vx * o1.vx + o1.vy * o1.vy);
                    const V2 = sqrt(o2.vx * o2.vx + o2.vy * o2.vy);
                    const V = V1 + V2;
                    const nx = xd / dist;
                    const ny = yd / dist;

                    o1.vx = nx * V * (o2.mass / Mass);
                    o1.vy = ny * V * (o2.mass / Mass);
                    o2.vx = -nx * V * (o1.mass / Mass);
                    o2.vy = -ny * V * (o1.mass / Mass);
                }
            }
        }

        // Balle libre : collision physique avec les joueurs
        for (const b of balls) {
            for (const p of players) {
                const Size = p.size + b.size;
                const xd = b.x - p.x;
                const yd = b.y - p.y;
                const dist = sqrt(xd * xd + yd * yd);

                if (dist < Size) {
                    const Mass = p.mass + b.mass;
                    const V1 = sqrt(b.vx * b.vx + b.vy * b.vy);
                    const V2 = sqrt(p.vx * p.vx + p.vy * p.vy);
                    const V = V1 + V2;
                    const nx = xd / dist;
                    const ny = yd / dist;

                    b.vx = nx * V * (p.mass / Mass);
                    b.vy = ny * V * (p.mass / Mass);
                    p.vx = -nx * V * (b.mass / Mass);
                    p.vy = -ny * V * (b.mass / Mass);
                }
            }
        }

        // Déplacement
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
    }

    if (running) {
        requestAnimationFrame(gameLoop);
    }
}

setupMenu();
gameLoop();