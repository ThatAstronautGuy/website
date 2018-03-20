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
	if (n < 0){
		console.log('Failed to set the positions of the vertices');
		return;
	}
	
	// Specify the color for clearing <canvas>
	gl.clearColor(0.53, 0.81, 0.92, 1);

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.TRIANGLE_FAN, 59, 4);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	gl.drawArrays(gl.TRIANGLES, 3, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 6, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 10, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 14, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 18, 4);
	gl.drawArrays(gl.TRIANGLE_FAN, 63, 30);
	gl.drawArrays(gl.LINES, 22, 8);
	gl.drawArrays(gl.LINE_LOOP, 30, 5);
	gl.drawArrays(gl.TRIANGLE_STRIP, 35, 5);
	gl.drawArrays(gl.TRIANGLE_STRIP, 40, 4);
	gl.drawArrays(gl.POINTS, 44, 1);
	gl.drawArrays(gl.LINE_STRIP, 47, 6);
	gl.drawArrays(gl.LINE_STRIP, 53, 6);
}

function initVertexBuffers(gl) {	
	var brX = -0.1989;
	var xMod = 0.07956;
	var gScale = 0.2;
	var gY = -0.5;
	
	var gYval = function(i){
		return gScale*Math.cos(i*(Math.PI/180))+gY;
	}
	
	array = [
		0.8,  0.6,					0.31, 0.1, 1.0,		// Turret Peak Right
		0.5, 0.6,					0.2, 0.1, 0.1,
		0.65, 0.8, 					0.5, 0.5, 0.7,
		
		-0.8,  0.6,					0.31, 0.1, 1.0,		// Turret Peak Left
		-0.5, 0.6,					0.2, 0.1, 0.1,
		-0.65, 0.8, 				0.5, 0.5, 0.7,
		
		0.75, 0.6,					0.5, 0.5, 0.5,		// Right tower
		0.55, 0.6,					0.21, 0.36, 0.42,
		0.55, 0,					0.5, 0.5, 0.5,
		0.75, 0,					0.5, 0.5, 0.5,
		
		-0.75, 0.6,					0.21, 0.36, 0.42,	// Left tower
		-0.55, 0.6,					0.5, 0.5, 0.5,
		-0.55, 0,					0.5, 0.5, 0.5,
		-0.75, 0,					0.5, 0.5, 0.5,
		
		-0.75, 0,					0.21, 0.5, 0.42,		// Main body
		-0.75, -1.0,				0.5, 0.5, 0.5,
		0.75, -1.0,					0.5, 0.5, 0.42,
		0.75, 0,					0.5, 0.36, 0.5,
		
		-0.1989, -1.0,				0.34, 0.18, 0.05,	// Drawbridge body
		0.1989, -1.0, 				0.34, 0.18, 0.05,
		0.1989, -0.4791,			0.34, 0.18, 0.05,
		-0.1989, -0.4791,			0.34, 0.18, 0.05,
		
		brX+xMod, -1.0, 			0.0, 0.0, 0.0,		// Drawbridge lines
		brX+xMod, gYval(brX+xMod)-0.04,	0.0, 0.0, 0.0,
		brX+xMod*2, -1.0,			0.0, 0.0, 0.0,
		brX+xMod*2, gYval(brX+xMod*2)-0.005,	0.0, 0.0, 0.0,
		brX+xMod*3, -1.0,			0.0, 0.0, 0.0,
		brX+xMod*3, gYval(brX+xMod*3)-0.005,	0.0, 0.0, 0.0,
		brX+xMod*4, -1.0,			0.0, 0.0, 0.0,
		brX+xMod*4, gYval(brX+xMod*4)-0.04,	0.0, 0.0, 0.0,
		
		-0.07, -0.25,				0.83, 0.69, 0.22,		// Star
		0, -0.025,					0.83, 0.69, 0.22,
		0.07, -0.25,				0.83, 0.69, 0.22,
		-0.075, -0.075,				0.83, 0.69, 0.22,
		0.075, -0.075,				0.83, 0.69, 0.22,
		
		0.0, 0.8,					0.31, 0.1, 1.0,			// Main Tower Peak
		-0.1, 0.5,					0.31, 0.1, 0.1,
		0.1, 0.5,					0.31, 0.1, 0.1,
		-0.15, 0.3,					0.2, 0.1, 0.1,
		0.15, 0.3,					0.2, 0.1, 0.1,
		
		-0.15, 0.3,					0.21, 0.36, 0.42,		// Main Tower Body
		0.15, 0.3,					0.21, 0.36, 0.5,
		-0.15, 0.0,					0.5, 0.5, 0.5,
		0.15, 0.0,					0.21, 0.5, 0.5,
		
		0.65, 0.8,					1.0, 1.0, 1.0,			// Tower Points
		-0.65, 0.8,					0.83, 0.69, 0.22,
		0.0, 0.8,					0.83, 0.69, 0.22,
		
		0.55, 0.6,					1.0, 1.0, 1.0,			// Ropes
		0.35, 0.4,					1.0, 1.0, 1.0,
		0.15, 0.3,					1.0, 1.0, 1.0,
		-0.15, 0.3,					1.0, 1.0, 1.0,
		-0.35, 0.4,					1.0, 1.0, 1.0,
		-0.55, 0.6,					1.0, 1.0, 1.0,
		0.5502, 0.602,				1.0, 1.0, 1.0,
		0.3502, 0.402,				1.0, 1.0, 1.0,
		0.1502, 0.302,				1.0, 1.0, 1.0,
		-0.1502, 0.302,				1.0, 1.0, 1.0,
		-0.3502, 0.402,				1.0, 1.0, 1.0,
		-0.5502, 0.602,				1.0, 1.0, 1.0,
		
		-1.0, -0.9,					0.38, 0.5, 0.22,		// Grass
		1.0, -0.9,					0.38, 0.5, 0.22,
		1.0, -1.0,					0.38, 0.5, 0.22,
		-1.0, -1.0,					0.38, 0.5, 0.22,
		
	];
	
	var colourPush = function(r, g, b){
		array.push(r/255);
		array.push(g/255);
		array.push(b/255);
	}
	
	var chunks = 180/30;
	for(var i = 270+chunks; i <= 360; i = i + chunks){
		array.push(gScale*Math.sin(i*(Math.PI/180)));
		array.push(gScale*Math.cos(i*(Math.PI/180))+gY);
		colourPush(86,47,14);
	}
	
	for(var i = 0; i <= 90; i = i + chunks){
		array.push(gScale*Math.sin(i*(Math.PI/180)));
		array.push(gScale*Math.cos(i*(Math.PI/180))+gY);
		colourPush(86,47,14);
	}

	var n = array.length;
	
	var vertices = new Float32Array(array);
	
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
	
	console.log(vertices.length);
	return n;
}

