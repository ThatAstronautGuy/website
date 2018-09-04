// RotatedTriangle_Matrix4.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Colour;\n' +
  'varying   vec4 v_Colour;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_xformMatrix * a_Position;\n' +
  '  v_Colour = a_Colour;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying   vec4 v_Colour;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Colour;\n' +
  '}\n';

var g_last = Date.now();
var ANGLE = 0;
var ANGLE_STEP = 30;
var TIME_STEP = 6;
var SCALE_X = 1;
var SCALE_Y = 1;
var TRANSLATE_X = 0;
var TRANSLATE_Y = 0;
var running = true;
var shapeCount = 1;
var CURR_COLOUR = 1;
var TICKCOUNTER = 0;

var colSets = {r:4, t:3, c:2, s:5, m:1}

function setMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    TRANSLATE_X = (evt.clientX - rect.left) / canvas.height * 2 - 1;
    TRANSLATE_Y = (evt.clientY - rect.top) / canvas.width * -2 + 1;
}

function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');
	canvas.addEventListener('mousedown', function(evt){
		setMousePos(canvas, evt)}
	, false);

	document.onkeydown = function(evt) {
		evt = evt || window.evt;
		if(evt.keyCode == 33){
			speedUp();
		}
		else if(evt.keyCode == 34){
			speedDown();
		}
		else if(evt.keyCode == 82){
			CURR_COLOUR = colSets.r;
		}
		else if(evt.keyCode == 84){
			CURR_COLOUR = colSets.t;
		}
		else if(evt.keyCode == 67){
			CURR_COLOUR = colSets.c;
		}
		else if(evt.keyCode == 83){
			CURR_COLOUR = colSets.s;
		}
		else if(evt.keyCode == 77){
			CURR_COLOUR = colSets.m;
		}
	};


	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
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
	var n = initVertexBuffers(gl);
	if (n < 0) {
		console.log('Failed to set the positions of the vertices');
		return;
	}

	// Create Matrix4 object for the transformations
	var xformMatrix = new Matrix4();
  
	// Pass the rotation matrix to the vertex shader
	var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
	if (!u_xformMatrix) {
		console.log('Failed to get the storage location of u_xformMatrix');
		return;
	}

	// Specify the color for clearing <canvas>
	gl.clearColor(1.0, 0.41, 0.71, 1);

	draw(gl, xformMatrix, u_xformMatrix);
	
	
	var tick = function(){
		if(running){
			animate();
			draw(gl, xformMatrix, u_xformMatrix);
		}
		requestAnimationFrame(tick, canvas);
	}

	tick();
}

function initColour(){
	clearArray();
	addPoint(0, 0, BLACK);
	addPoint(-0.4, 0.2, BLACK);
	addPoint(0, 0.2, BLACK);
	addPoint(0.2, 0.4, BLACK);
	addPoint(0.3, 0.5, BLACK);
	addPoint(0.2, 0.2, BLACK);

	addPoint(0, 0, RED);
	addPoint(-0.4, 0.2, CADMIUM);
	addPoint(0, 0.2, TURQUOISE);
	addPoint(0.2, 0.4, PURPLE);
	addPoint(0.3, 0.5, CADMIUM);
	addPoint(0.2, 0.2, GREEN);

	addPoint(0, 0, CADMIUM);
	addPoint(-0.4, 0.2, CADMIUM);
	addPoint(0, 0.2, CADMIUM);
	addPoint(0.2, 0.4, CADMIUM);
	addPoint(0.3, 0.5, CADMIUM);
	addPoint(0.2, 0.2, CADMIUM);
	
	addPoint(0, 0, TURQUOISE);
	addPoint(-0.4, 0.2, TURQUOISE);
	addPoint(0, 0.2, TURQUOISE);
	addPoint(0.2, 0.4, TURQUOISE);
	addPoint(0.3, 0.5, TURQUOISE);
	addPoint(0.2, 0.2, TURQUOISE);

	addPoint(0, 0, RED);
	addPoint(-0.4, 0.2, RED);
	addPoint(0, 0.2, RED);
	addPoint(0.2, 0.4, RED);
	addPoint(0.3, 0.5, RED);
	addPoint(0.2, 0.2, RED);

	addPoint(0, 0, STONE);
	addPoint(-0.4, 0.2, STONE);
	addPoint(0, 0.2, STONE);
	addPoint(0.2, 0.4, STONE);
	addPoint(0.3, 0.5, STONE);
	addPoint(0.2, 0.2, STONE);
	return getFloatArray();
}

function initVertexBuffers(gl) {
  
	var vertices = initColour();
	var n = getNumVertices(); // The number of vertices

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

function animate(){
	TICKCOUNTER++;
	var now = Date.now();
	var elapsed = (now - g_last) / 1000;
	if(elapsed > TIME_STEP - 0.1 && elapsed < TIME_STEP + 0.1){
		TICKCOUNTER = 0;
		shapeCount++;
		g_last = Date.now();
	}
}

function speedDown(){
	TIME_STEP +=0.1;
}

function speedUp(){
	if(TIME_STEP > 2){
		TIME_STEP -= 0.2;
	}
}

function start(){
	running = true;
	g_last = Date.now();
}

function stop(){
	running = false;
}

function setScale(){
	var newScale = document.querySelector('input[name="scale"]:checked').value;
	SCALE_X = newScale;
	SCALE_Y = newScale;
}

function reset(){
	g_last = Date.now();
	ANGLE = 0;
	ANGLE_STEP = 30;
	TIME_STEP = 10;
	SCALE_X = 1;
	SCALE_Y = 1;
	TRANSLATE_X = 0;
	TRANSLATE_Y = 0;
	running = true;
	shapeCount = 1;
	CURR_COLOUR = 1;
	TICKCOUNTER = 0;
	document.getElementById('slideMe').value = "30";
	document.getElementById("one").checked = true;
		document.getElementById('sliderVal').textContent = "30%";

}

function setAngle(){
	ANGLE_STEP = document.getElementById('slideMe').value;
	document.getElementById('sliderVal').textContent = ANGLE_STEP + "%";
}

function draw(gl, xformMatrix, u_xformMatrix){

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	for(i = 0; i < shapeCount; i++){
		xformMatrix.setTranslate(TRANSLATE_X, TRANSLATE_Y, 0);
		xformMatrix.scale(SCALE_X, SCALE_Y, 1);
		xformMatrix.rotate(ANGLE+i*ANGLE_STEP, 0, 0, 1);
		xformMatrix.translate(0, 0, 0);
		
		gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

			// Draw the shapes
		gl.drawArrays(gl.TRIANGLE_FAN, 6*CURR_COLOUR, 6);
		gl.drawArrays(gl.LINE_LOOP, 0, 6);
	}
}

