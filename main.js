
// Import the UI system from the systems folder
import { drawUI } from './systems/UI.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make the canvas fill the whole screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Our player object
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5,
    angle: 0
};

// A deadzone prevents "stick drift" when you aren't touching the joystick
const DEADZONE = 0.1; 

function update() {
    // Get all connected controllers
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; // Assuming player 1 is the first controller

    if (gp) {
        // On a PS5 controller, axes[0] is Left Stick X, axes[1] is Left Stick Y
        let leftStickX = gp.axes[0];
        let leftStickY = gp.axes[1];

        // Apply the deadzone
        if (Math.abs(leftStickX) < DEADZONE) leftStickX = 0;
        if (Math.abs(leftStickY) < DEADZONE) leftStickY = 0;

        // Move the player based on stick input
        player.x += leftStickX * player.speed;
        player.y += leftStickY * player.speed;

        // Keep the player inside the screen bounds
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

        // If the stick is being moved, calculate the rotation angle
        // Math.atan2 gives us the angle in radians based on X and Y inputs
        if (leftStickX !== 0 || leftStickY !== 0) {
            player.angle = Math.atan2(leftStickY, leftStickX);
        }
    }
}

function draw() {
    // Clear the screen for the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Call our imported UI system
    drawUI(ctx);

    // Save the default canvas state before we rotate things
    ctx.save();

    // Move the canvas origin to the player's position and rotate it
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Draw the red outlined character
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2); // The main body (circle)
    
    // Draw a line pointing forward so we can see which way they are looking
    ctx.moveTo(0, 0);
    ctx.lineTo(player.radius + 15, 0); 
    
    ctx.stroke();

    // Restore the canvas to default so we don't accidentally rotate the whole world
    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game!
requestAnimationFrame(gameLoop);
