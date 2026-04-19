import { drawUI } from './systems/UI.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- UPDATED PLAYER OBJECT ---
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5,
    angle: 0,
    targetAngle: 0,
    rotationSpeed: 0.2,
    // Dash Mechanics Variables
    dashSpeed: 20,
    dashFrames: 8,         // How many frames the dash lasts
    currentDashFrame: 0,
    isDashing: false,
    canDash: true,         // Cooldown flag
    dashDirection: 1       // 1 for forward, -1 for backward
};

const DEADZONE = 0.1; 

// Track previous button states to prevent holding the button down
let prevL1 = false;
let prevL2 = false;

function update() {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; 

    if (gp) {
        let leftStickX = gp.axes[0];
        let leftStickY = gp.axes[1];

        if (Math.abs(leftStickX) < DEADZONE) leftStickX = 0;
        if (Math.abs(leftStickY) < DEADZONE) leftStickY = 0;

        // Update target angle only if the stick is being pushed
        if (leftStickX !== 0 || leftStickY !== 0) {
            player.targetAngle = Math.atan2(leftStickY, leftStickX);
        }

        // --- DASH INPUT LOGIC ---
        // L1 is buttons[4], L2 is buttons[6]
        let currentL1 = gp.buttons[4].pressed;
        let currentL2 = gp.buttons[6].pressed;

        if (player.canDash && !player.isDashing) {
            if (currentL2 && !prevL2) { 
                // Trigger Forward Dash
                player.isDashing = true;
                player.dashDirection = 1;
                player.currentDashFrame = player.dashFrames;
                player.canDash = false;
            } else if (currentL1 && !prevL1) { 
                // Trigger Backward Dash
                player.isDashing = true;
                player.dashDirection = -1;
                player.currentDashFrame = player.dashFrames;
                player.canDash = false;
            }
        }

        // Save button states for the next frame
        prevL1 = currentL1;
        prevL2 = currentL2;

        // --- MOVEMENT EXECUTION ---
        if (player.isDashing) {
            // Dash movement: Use trigonometry to shoot the player in the direction they are facing
            player.x += Math.cos(player.angle) * player.dashSpeed * player.dashDirection;
            player.y += Math.sin(player.angle) * player.dashSpeed * player.dashDirection;
            
            player.currentDashFrame--;
            
            // End the dash and start a short cooldown
            if (player.currentDashFrame <= 0) {
                player.isDashing = false;
                setTimeout(() => { player.canDash = true; }, 300); // 300ms cooldown
            }
        } else {
            // Normal joystick movement
            player.x += leftStickX * player.speed;
            player.y += leftStickY * player.speed;
        }

        // Keep the player inside the screen bounds
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
    }

    // --- SMOOTH ROTATION LOGIC ---
    let angleDiff = player.targetAngle - player.angle;
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    player.angle += angleDiff * player.rotationSpeed;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawUI(ctx);

    ctx.save();

    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    
    // Draw the main body 
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2); 
    ctx.stroke();

    // Directional dot
    ctx.beginPath();
    ctx.arc(player.radius - 8, 0, 4, 0, Math.PI * 2); 
    ctx.fillStyle = 'red';
    ctx.fill();

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
