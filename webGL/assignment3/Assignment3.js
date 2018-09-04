// RotatedTriangle_Matrix4.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Colour;\n' +
  'varying   vec4 v_Colour;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  v_Colour = a_Colour;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying   vec4 v_Colour;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Colour;\n' +
  '}\n';

var RED 		= {r:1.0, g:0.0, b:0.0};
var GREEN 		= {r:0.0, g:1.0, b:0.0};
var BLUE 		= {r:0.0, g:0.0, b:1.0};
var BLACK 		= {r:0.0, g:0.0, b:0.0};
var CADMIUM		= {r:1.0, g:0.6, b:0.07};

var firstCords = {x:null, y:null};
var lastCords = {x:null, y:null};
var mouseDown = false;
var dragged = false;
var isCohen = true;
var tempArray = [];
var clipSquare = [];
var dragArray = [];
var tempDragArray = [];
var n;

var xStart;
var xEnd;
var yStart;
var yEnd;

var xmin = -0.75;
var xmax = 0.75;
var ymin = -0.75;
var ymax = 0.75;

function getMousePos(canvas, ev) {
    var rect = canvas.getBoundingClientRect()
    var newClickCords = {x:0.0, y:0.0};
    newClickCords.x = (ev.clientX - rect.left) / canvas.height * 2 - 1;
    newClickCords.y = (ev.clientY - rect.top) / canvas.width * -2 + 1;
    return newClickCords;
}

function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// Write the positions of vertices to a vertex shader
	n = initVertexBuffers(gl);
	if (n < 0) {
		console.log('Failed to set the positions of the vertices');
		return;
	}

	canvas.onmousedown = function(ev){
		firstCords = getMousePos(canvas, ev);
		mouseDown = true;
		dragged = false;
		//console.log('click');
	};

	document.onmousemove = function(ev){
		if(mouseDown){
			dragged = true;
			lastCords = getMousePos(canvas, ev);
			tempDragArray = clipSquare;
			n = initDragDraw(gl);
			draw(gl);
			//console.log('drag ' + n);
		}
	};

	document.onmouseup = function(ev){
		if(mouseDown && dragged){
			mouseDown = false;
			hasMoved = false;
			dragged = false;
			tempArray = clipSquare;
			initClipAlgo(gl);
			//console.log('release ' + n);
		}
		else{
			dragged = false;
			mouseDown = false;
		}
	};

	document.onkeydown = function(ev) {
		ev = ev || window.ev;
		if(ev.keyCode == 32){
			swap();
		}
		else if(ev.keyCode == 82){
			reset();
		}
	};

	// Specify the color for clearing <canvas>
	gl.clearColor(0.49, 0.99, 0.0, 1);

	draw(gl);
}

function initDragDraw(gl){

	dragArray = [
		xmin, ymax,			0.0, 0.0, 1.0,
		xmin, ymin,			0.0, 0.0, 1.0,
		xmax, ymin,			0.0, 0.0, 1.0,
		xmax, ymax,			0.0, 0.0, 1.0
	];

	if(tempDragArray.length > 0){
		for(var i = 4; i < tempDragArray.length; i++){
			dragArray[i] = tempDragArray[i];
		}
	}

	if (firstCords.x != null && firstCords.y != null && lastCords.x != null && lastCords.y != null){
		addPoint(dragArray, firstCords.x, firstCords.y, CADMIUM);
		addPoint(dragArray, lastCords.x, lastCords.y, CADMIUM);
	}

	var vertices = new Float32Array(dragArray);
	n = dragArray.length / 5;

	// Create a buffer object
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return false;
	}

	var FSIZE = vertices.BYTES_PER_ELEMENT;

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 5 * FSIZE, 0);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);

	var a_Colour = gl.getAttribLocation(gl.program, 'a_Colour');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Colour');
		return -1;
	}
	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Colour, 3, gl.FLOAT, false, 5 * FSIZE, 2 * FSIZE);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Colour);

	return n;
}

function initVertexBuffers(gl) {

	clipSquare = [
		xmin, ymax,			0.0, 0.0, 1.0,
		xmin, ymin,			0.0, 0.0, 1.0,
		xmax, ymin,			0.0, 0.0, 1.0,
		xmax, ymax,			0.0, 0.0, 1.0
	];

	if(tempArray.length > 0){
		for(var i = 0; i < tempArray.length; i++){
			clipSquare[i] = tempArray[i];
		}
	}

	var vertices = new Float32Array(clipSquare);
	n = clipSquare.length / 5;

	// Create a buffer object
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return false;
	}

	var FSIZE = vertices.BYTES_PER_ELEMENT;

	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 5 * FSIZE, 0);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);

	var a_Colour = gl.getAttribLocation(gl.program, 'a_Colour');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Colour');
		return -1;
	}
	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Colour, 3, gl.FLOAT, false, 5 * FSIZE, 2 * FSIZE);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Colour);

	return n;
}

function initClipAlgo(gl){
	xStart = firstCords.x;
	yStart = firstCords.y;
	xEnd = lastCords.x;
	yEnd = lastCords.y;
	var num = -1;

	if(isCohen){
		num = cohenCalc();
	}
	else{
		num = liangCalc();
	}
	addPoint(tempArray, firstCords.x, firstCords.y, RED);
	addPoint(tempArray, lastCords.x, lastCords.y, RED);
	//console.log(num);
	if(num != 0){
		addPoint(tempArray, xStart, yStart, BLACK);
		addPoint(tempArray, xEnd, yEnd, BLACK);
	}

	n = initVertexBuffers(gl);
	draw(gl);
}

function cohenCalc(){
	//console.log('Cohen-Sutherland');

	var m = (yStart - yEnd) / (xStart - xEnd);
	var b = (m * -1) * xStart + yStart;
	
	var larbStart = (xStart < xmin? 8 : 0) + (yStart > ymax? 4 : 0) + (xStart > xmax? 2 : 0) + (yStart < ymin? 1 : 0);
	var larbEnd = (xEnd < xmin? 8 : 0) + (yEnd > ymax? 4 : 0) + (xEnd > xmax? 2 : 0) + (yEnd < ymin? 1 : 0);

	do{
  		if(larbStart == 0 && larbEnd == 0){
			return 1;
	  	}
	  	if((larbStart & larbEnd) != 0){
			return 0;
	  	}
		if(larbStart != 0){
			if((larbStart & 8) != 0){
				xStart = xmin;
				yStart = m * xmin + b;
				larbStart = larbStart & 7;
			}
			else if((larbStart & 2) != 0){
				xStart = xmax;
				yStart = m * xmax + b;
				larbStart = larbStart & 13;
			}
			else if((larbStart & 1) != 0){
				xStart = (ymin - b) / m;
				yStart = ymin;
				larbStart = larbStart & 14;
			}
			else{
				xStart = (ymax - b) / m;
				yStart = ymax;
				larbStart = larbStart & 11;
			}
		}
		else{
			if((larbEnd & 8) != 0){
				xEnd = xmin;
				yEnd = m * xmin + b;
				larbEnd = larbEnd & 7;
			}
			else if((larbEnd & 2) != 0){
				xEnd = xmax;
				yEnd = m * xmax + b;
				larbEnd = larbEnd & 13;
			}
			else if((larbEnd & 1) != 0){
				xEnd = (ymin - b) / m;
				yEnd = ymin;
				larbEnd = larbEnd & 14;
			}
			else if((larbEnd & 4) != 0){
				xEnd = (ymax - b) / m;
				yEnd = ymax;
				larbEnd = larbEnd & 11;
			}
		}
  	}while(true);
}

function liangCalc(){
	//console.log('Liang-Barsky');
	var t0 = 0;
  	var t1 = 1;
  	var dx = xEnd - xStart;
  	var dy = yEnd - yStart;
  	var p, q, r;
  
  	for(var e = 0; e < 4; e++){
	  	switch(e){
		  	case 0: p = -1 * dx;
				q = -1 * (xmin - xStart);
				break;
		  	case 1: p = dx;
				q = (xmax - xStart);
				break;
		  	case 2: p = -1 * dy;
				q = -1 * (ymin - yStart);
				break;
		  	case 3: p = dy;
				q = (ymax - yStart);
				break;
	  	}
	  
	  	r = q/p;
	  	if(p == 0 && q < 0){
		  	return 0;
	  	}
	  	if(p < 0){
		  	if(r > t1){
				return 0;
		  	}
		  	else if(r > t0){
			  	t0 = r;
		  	}
	  	}
	  	else if(p > 0){
		  	if(r < t0){
			  	return 0;
		  	}
		  	else if(r < t1){
			  	t1 = r;
		  	}
	  	}
  	}
  	xEnd = xStart + t1 * dx;
  	yEnd = yStart + t1 * dy;
  	xStart = xStart + t0 * dx;
  	yStart = yStart + t0 * dy;
  	return 1;
}

function reset(){
	firstCords = {x:null, y:null};
	lastCords = {x:null, y:null};
	mouseDown = false;
	dragged = false;
	isCohen = true;
	tempArray = [];
	clipSquare = [];
	dragArray = [];
	tempDragArray = [];
	n = initVertexBuffers(gl);
	draw(gl);

	xStart = null;
	xEnd = null;
	yStart = null;
	yEnd = null;
	document.getElementById('algorithm').textContent = "Cohen-Sutherland is being used";
}

function swap(){
	isCohen = !isCohen;
	if(isCohen){
		document.getElementById('algorithm').textContent = "Cohen-Sutherland is being used";
	}
	else{
		document.getElementById('algorithm').textContent = "Liang-Barsky is being used";
	}
}

function draw(gl){

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.LINE_LOOP, 0, 4);
	gl.drawArrays(gl.LINES, 4, n-4);
	//console.log('drawing');
}

function addPoint(iArray, x, y, Colour){
	iArray.push(x);
	iArray.push(y);
	iArray.push(Colour.r);
	iArray.push(Colour.g);
	iArray.push(Colour.b);
}
