import { drawUI } from './systems/UI.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5,
    angle: 0,
    targetAngle: 0,       // Track where the player WANTS to look
    rotationSpeed: 0.2    // How fast they turn (0.01 is slow, 1.0 is instant)
};

const DEADZONE = 0.1; 

function update() {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; 

    if (gp) {
        let leftStickX = gp.axes[0];
        let leftStickY = gp.axes[1];

        if (Math.abs(leftStickX) < DEADZONE) leftStickX = 0;
        if (Math.abs(leftStickY) < DEADZONE) leftStickY = 0;

        player.x += leftStickX * player.speed;
        player.y += leftStickY * player.speed;

        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

        // Update target angle only if the stick is being pushed
        if (leftStickX !== 0 || leftStickY !== 0) {
            player.targetAngle = Math.atan2(leftStickY, leftStickX);
        }
    }

    // --- SMOOTH ROTATION LOGIC ---
    // Calculate the difference between the target angle and current angle
    let angleDiff = player.targetAngle - player.angle;
    
    // Normalize the angle to take the shortest path (prevents weird 360-degree spins)
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    
    // Apply a fraction of that difference to the current angle
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

    // --- NEW DIRECTIONAL DOT ---
    // Draw a small dot near the front (positive X is 'forward' after rotation)
    ctx.beginPath();
    // Offset by radius - 8 pixels so it sits inside the character's front
