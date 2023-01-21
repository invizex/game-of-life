const canvas = document.querySelector("#canv");
const ctx = canvas.getContext('2d');

window.addEventListener("load", reSizeCanvas);
window.addEventListener("resize", reSizeCanvas);
canvas.addEventListener("click", setCell, event);

/* Controls */
document.querySelector("#start").addEventListener('click', startGame); // Start game
document.querySelector("#step").addEventListener('click', gameStep); // Make game step once
document.querySelector("#stop").addEventListener('click', stopGame); // Stop game
document.querySelector("#random").addEventListener('click', randomFilling); // Random filling of the field
document.querySelector("#clear").addEventListener('click', clearField); // Clear field
document.querySelector("#delay").addEventListener('input', setDelay, event); // Set update delay

/* Main game cycle */
let timer; // Game cycle 
let hasTimerActive = false; // Check the timer is active
let delay = 100; // Update delay (ms)

/* Game field */
let width; // Field width
let height; // Field height
let scale = 7; // Cell size
let gridSize = 1; // Grid size
let gridScale = scale + gridSize; // Scale + grid size
let field = []; // Game field

let displayWidth; // Canvas width
let displayHeight; // Canvas height

let offset = 4; // Offset (cells)
let gridOffset = offset * gridScale; // Offset with grid (px)

/* Rules */
const cellDie = [3]; // If cell dead, it survive if...
const cellLive = [2, 3]; // If cell alive, it survive if...

// Resize canvas on resize window
function reSizeCanvas() {

	// canvas_wrap_wrap
	displayWidth = Math.round(canvas.parentElement.
					 parentElement.getBoundingClientRect().width);

	displayHeight = Math.round(canvas.parentElement.
					  parentElement.getBoundingClientRect().height);

	// Fitting width
	while(displayWidth % gridScale !== gridSize) {
		displayWidth--;
	}

	// Fitting height
	while(displayHeight % gridScale !== gridSize) {
		displayHeight--;
	}

	displayWidth += gridOffset;
	displayHeight += gridOffset;

	width = (displayWidth - gridSize) / gridScale + offset * 2;
	height = (displayHeight - gridSize) / gridScale + offset * 2;

	canvas.width = displayWidth;
	canvas.height = displayHeight;
	canvas.parentElement.style.width = displayWidth - gridOffset + 'px';
	canvas.parentElement.style.height = displayHeight - gridOffset + 'px';

	field = clearField();
	drawField();
}

// Set update delay
function setDelay(event) {
	let newDelay = event.srcElement.value;

	if(!isNaN(newDelay)) {
		delay = Number(newDelay);
	}
}

// Draw cell grid on canvas
function drawGrid() {
	ctx.fillStyle = 'darkgray'; // Grid color
	ctx.fillRect(0, 0, displayWidth, displayHeight);

	ctx.fillStyle = 'white'; // Cell color
	for(let y = gridSize; y < displayHeight; y += gridScale) {
		for(let x = gridSize; x < displayWidth; x += gridScale) {
			ctx.fillRect(x, y, scale, scale);
		}	
	}
}

// Draw the field
function drawField() {
	for(let y = 0; y < height; y++){
		for(let x = 0; x < width; x++){
			if(field[y * width + x] === 1) {
				ctx.fillStyle = 'black';
			}
			else {
				ctx.fillStyle = 'white';
			}

			ctx.fillRect(x * gridScale + gridSize, 
				     y * gridScale + gridSize, scale, scale);
		}
	}
}

// Clear the field
function clearField() {
	let result = new Array(width * height);

	for(let i = 0; i < result.length; i++) {
		result[i] = 0;
	}

	drawGrid();
	field = result;
	return result;
}

// Set or remove cell
function setCell(event) {
	canvasRect = canvas.getBoundingClientRect();
	let x = Math.floor((event.clientX - canvasRect.left) / gridScale);
	let y = Math.floor((event.clientY - canvasRect.top) / gridScale);
	let cell = field[y * width + x];

	if(cell === 0) {
		field[y * width + x] = 1;
		ctx.fillStyle = 'black';
	}
	else {
		field[y * width + x] = 0;
		ctx.fillStyle = 'white';
	}

	ctx.fillRect(x * gridScale + gridSize, 
		     y * gridScale + gridSize, scale, scale);
}

// Filling field random cells
function randomFilling() {
	let chance = 60;

	for(let i = 0; i < field.length; i++) {
		if(Math.round(Math.random() * (100 - 0) + 0) > chance) {
			field[i] = 1;
		}
	}

	drawField();
}

// Starting game
function startGame() {
	if(!hasTimerActive) {
		timer = setInterval(gameStep, delay);
		hasTimerActive = true;

		document.querySelector("#start").disabled = true;
		document.querySelector("#stop").disabled = false;
	}
}

// Stoping game
function stopGame() {
	if(hasTimerActive) {
		clearInterval(timer);
		hasTimerActive = false;

		document.querySelector("#start").disabled = false;
		document.querySelector("#stop").disabled = true;
	}
}

// One step game
function gameStep() {
	let newField = [].concat(field);

	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {
			let cellsAround = countCells(x, y, newField);
			let cell = y * width + x;

			if(newField[cell] === 0) {
				if(cellDie.includes(cellsAround)) {
					field[cell] = 1;
				}
			}

			else {
				if(!cellLive.includes(cellsAround)) {
					field[cell] = 0;
				}
			}
		}
	}

	drawField();
}

// Count cells around
function countCells(xStart, yStart, newField) {
	let cellsAround = 0;

	for(let y = yStart - 1; y < yStart + 2; y++) {
		for(let x = xStart - 1; x < xStart + 2; x++) {
			if(newField[y * width + x] === 1) cellsAround++;
		}
	}

	// Count cells around only, not full area
	if(newField[yStart * width + xStart] === 1) {
		cellsAround--;
	}

	return cellsAround;
}
