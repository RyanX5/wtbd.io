// Constants
const CANVAS_PADDING = 40;
const DEFAULT_BRUSH_SIZE = 5;
const MAX_UNDO_STEPS = 50;

// DOM Elements
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const sizePicker = document.getElementById('sizePicker');
const colorPickerLabel = document.querySelector('label[for="colorPicker"]');

// State
let painting = false;
let undoStack = [];
let currentColorIndex = 0;
const colors = ['#ff6666', '#6666ff', '#66ff66', '#000000'];

// Canvas setup
function initializeCanvas() {
    try {
        canvas.width = window.innerWidth - CANVAS_PADDING;
        canvas.height = window.innerHeight - CANVAS_PADDING * 3;
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        // Save initial canvas state
        saveCanvasState();
    } catch (error) {
        console.error('Error initializing canvas:', error);
        alert('Failed to initialize canvas. Please refresh the page.');
    }
}

// Drawing functions
function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    if (painting) {
        painting = false;
        ctx.beginPath();
        saveCanvasState();
    }
}

function draw(e) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = sizePicker.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = colorPicker.value;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Canvas state management
function saveCanvasState() {
    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        undoStack.push(imageData);

        // Limit undo stack size
        if (undoStack.length > MAX_UNDO_STEPS) {
            undoStack.shift();
        }
    } catch (error) {
        console.error('Error saving canvas state:', error);
    }
}

function clearCanvas() {
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveCanvasState();
    } catch (error) {
        console.error('Error clearing canvas:', error);
        alert('Failed to clear canvas. Please try again.');
    }
}

function undo() {
    if (undoStack.length > 1) {
        undoStack.pop(); // Remove current state
        ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
    } else {
        alert("No more undo steps available");
    }
}

// Color management
function updateColorPickerLabel(e) {
    colorPickerLabel.style.background = e.target.value;
}

function cycleColor() {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    colorPicker.value = colors[currentColorIndex];
    colorPickerLabel.style.background = colors[currentColorIndex];
}

// Brush size management
function adjustBrushSize(e) {
    e.preventDefault();
    const currentSize = parseInt(sizePicker.value);

    if (e.deltaY < 0) {
        sizePicker.value = Math.min(currentSize + 1, sizePicker.max);
    } else {
        sizePicker.value = Math.max(currentSize - 1, sizePicker.min);
    }
}

// Event listeners
function setupEventListeners() {
    // Canvas events
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mouseout', endPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('wheel', adjustBrushSize);

    // Color picker events
    colorPicker.addEventListener('input', updateColorPickerLabel);

    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            cycleColor();
        }
    });

    // Window resize
    window.addEventListener('resize', () => {
        initializeCanvas();
    });
}

// Initialize the application
function init() {
    try {
        initializeCanvas();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
}

// Start the application
init(); 