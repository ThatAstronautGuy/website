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
var g_last2 = Date.now();
var ANGLE = 0;
var ANGLE_SPEED = 60;
var ANGLE_STEP = 0;
var ANGLE_STEP_SPEED = 200;
var SCALE_X = .25;
var SCALE_Y = .25;
var TRANSLATE_X = .4;
var TRANSLATE_Y = -.4;

function main() {
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

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
	
	draw(gl, xformMatrix, u_xformMatrix);
	
	
	var tick = function(){
		ANGLE = animate();
		ANGLE_STEP = animate2();
		draw(gl, xformMatrix, u_xformMatrix);
		requestAnimationFrame(tick, canvas);
	}
	
	tick();
}

function initVertexBuffers(gl) {
	addTriangle(RED, WHITE, BLACK);
  
	var vertices = getFloatArray();
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
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	var newAngle = ANGLE + (ANGLE_SPEED * elapsed) / 1000.0;
	return newAngle %= 360;
}

function animate2(){
	var now = Date.now();
	var elapsed = now - g_last2;
	g_last2 = now;
	var newAngle = ANGLE_STEP + (ANGLE_STEP_SPEED * elapsed) / 1000.0;
	return newAngle;
}

function down(){
	ANGLE_STEP_SPEED -= 20;
	if(ANGLE_STEP_SPEED < 0){
		ANGLE_STEP_SPEED = 0;
	}
}

function up(){
	ANGLE_STEP_SPEED += 20;
}

function setTriangle(){
	ANGLE_SPEED = document.getElementById('slideMe').value;
}

function draw(gl, xformMatrix, u_xformMatrix){
	xformMatrix.setRotate(ANGLE, 0, 0, 1);
	xformMatrix.translate(TRANSLATE_X, TRANSLATE_Y, 0);
	xformMatrix.scale(SCALE_X, SCALE_Y, 1);
	xformMatrix.rotate(ANGLE_STEP, 0, 0, 1);
	xformMatrix.translate(0, 0, 0);
	
	gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
	
	// Specify the color for clearing <canvas>
	gl.clearColor(0, 0, 0, 1);

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Draw the shapes
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
}