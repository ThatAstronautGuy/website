// Base code from RotateObject.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +			
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'attribute vec2 a_texCoords;\n' +
  'varying vec2 v_texCoords;\n' +

  'attribute vec4 a_Normal;\n' +      	//FOR PART B - LEAVE COMMENTED UNTIL STARTING PART B
  'uniform mat4 u_NormalMatrix;\n' + 		//FOR PART B - LEAVE COMMENTED UNTIL STARTING PART B
  'uniform vec3 u_LightDirection;\n' + 	//FOR PART B - LEAVE COMMENTED UNTIL STARTING PART B
  'varying float v_Dot;\n' +				//FOR PART B - LEAVE COMMENTED UNTIL STARTING PART B
  
  'void main() {\n' +
  '	 vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '	 v_Dot = max(dot(u_LightDirection, normal), 0.0);\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_texCoords = a_texCoords;\n' +  
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +	
  'varying vec4 v_Color;\n' +	
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_texCoords;\n' +
  
  'uniform vec3 u_DiffuseLight;\n' + 		//FOR PART B - LEAVE COMMENTED UNTIL STARTING PART B
  'uniform vec3 u_AmbientLight;\n' + 		//FOR PART B - LEAVE COMMENTED UNTIL STARTING PART B
  'varying float v_Dot;\n' +				//FOR PART B - LEAVE COMMENTED UNTIL STARTING PART B
  
  'void main() {\n' +
  '  vec4 matColor = texture2D(u_Sampler, v_texCoords);\n' +
  '	 vec3 diffuse = u_DiffuseLight * matColor.rgb * v_Dot;\n' +
  '	 vec3 ambient = u_AmbientLight * matColor.rgb;\n' +
  '  vec4 col = vec4(diffuse + ambient, matColor.a)\n' +	
  '  gl_FragColor = col;\n' +
  '}\n';

var currentAngle = [0.0, 0.0]; // GLOBAL: Current rotation angle ([x-axis, y-axis] degrees)

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

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix ) { 
    console.log('Failed to get the storage location of uniform variables');
    return;
  }

  //THIS IS FOR PART B - LEAVE COMMENTED UNTIL YOU START PART B
  var u_DiffuseLight = gl.getUniformLocation(gl.program, 'u_DiffuseLight');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  gl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0); 				// Set the light color (white)
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);			// Set the light direction (in the world coordinate)
  lightDirection.normalize();     							// Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);				// Set the ambient light


  // Calculate the view projection matrix
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  
	initTextures(gl, n);

  var tick = function() {   // Start drawing
    draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  var texCoords = new Float32Array([   // Texture coordinates
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([   // Colors
    0.2, 0.58, 0.82,   0.2, 0.58, 0.82,   0.2,  0.58, 0.82,  0.2,  0.58, 0.82, // v0-v1-v2-v3 front
    0.5,  0.41, 0.69,  0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.0,  0.32, 0.61,  0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v1-v6-v7-v2 left
    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
   ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0,   0.0, 0.0, 0.0   // v4-v7-v6-v5 back
  ]);
  
  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    return -1;
  }

  // Write vertex information to buffer objects
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // Vertex coordinates
  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;      // Color Information  
  if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_texCoords')) return -1;
  
  //THIS IS FOR PART B - LEAVE COMMENTED UNTIL YOU START PART B
  if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;    // Normal Information
  
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  
  
  return indices.length;
}

function initTextures(gl, n){
	var texture1 = gl.createTexture();
	var texture2 = gl.createTexture();
	var image1 = new Image();
	var image2 = new Image();
	image1.onload = function(){loadTexture(gl, texture1, image1, gl.TEXTURE0);};
	image2.onload = function(){loadTexture(gl, texture2, image2, gl.TEXTURE1);};
	image1.src = './redflower.jpg';
	image2.src = './yellowflower.jpg';
	return true;
}

function loadTexture(gl, texture, image, texUnit){
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	gl.activeTexture(texUnit);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
}
	
var g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle, u_Sampler, u_ApplyColor) {
  // Caliculate The model view projection matrix and pass it to u_MvpMatrix
  g_MvpMatrix.set(viewProjMatrix);
  var modelMatrix = new Matrix4(); // Model transformation matrix
  modelMatrix.setRotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  modelMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  g_MvpMatrix.multiply(modelMatrix);

  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if(!u_Sampler){
	console.log('No u_s');
  }
  //THIS IS FOR PART B - LEAVE COMMENTED UNTIL YOU START PART B
  var normalMatrix = new Matrix4(); // Transformation matrix for normals
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers

  gl.uniform1i(u_Sampler, 0);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6*0);   // Draw the cube
  
  gl.uniform1i(u_Sampler, 1);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6*1);   // Draw the cube
  
  gl.uniform1i(u_Sampler, 0);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6*2);   // Draw the cube
  
  gl.uniform1i(u_Sampler, 1);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6*3);   // Draw the cube
  
  gl.uniform1i(u_Sampler, 0);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6*4);   // Draw the cube
  
  gl.uniform1i(u_Sampler, 1);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6*5);   // Draw the cube
}

function initArrayBuffer(gl, data, num, type, attribute) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment to a_attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}


function setXAngle(){
	
	var xSlider = document.getElementById('xAngle');
	currentAngle[0] = xSlider.value;
	var text = document.getElementById('xAngletext');
	text.innerHTML = currentAngle[0]+"&deg;"	

}

function setYAngle(){
	
	var ySlider = document.getElementById('yAngle');
	currentAngle[1] = ySlider.value;
	var text = document.getElementById('yAngletext');
	text.innerHTML = currentAngle[1]+"&deg;"	

}
