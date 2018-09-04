// RotateObject.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'attribute vec4 a_Color;\n' +			
  'attribute vec4 a_Normal;\n' +       // Normal
  'uniform vec4 u_Color;\n' +
  'uniform bool u_UseColor;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' + 
  'uniform vec3 u_LightDirection;\n' + // Diffuse light direction (in the world coordinate, normalized)
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_Color;\n' +		
  'varying float v_Dot;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '  v_Color = a_Color;\n' +
  '  if(u_UseColor){\n' +
  '    v_Color = u_Color;\n' +
  '  }\n' +
  '  vec4 normal = u_NormalMatrix * a_Normal;\n' +
  '  v_Dot = max(dot(normalize(normal.xyz), u_LightDirection), 0.0);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'uniform bool u_ApplyTexture;\n' +
  'uniform vec3 u_DiffuseLight;\n' +   // Diffuse light color
  'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_Color;\n' +		
  'varying float v_Dot;\n' +
  'void main() {\n' +
  '  vec4 matColor = v_Color;' +
  'if(u_ApplyTexture){' +
  '	  matColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}' +
  '  vec4 difColor = vec4(u_DiffuseLight * matColor.xyz * v_Dot, matColor.a);\n' +
  '  vec4 ambColor = vec4(matColor.xyz * u_AmbientLight, matColor.a);\n' +
  '  gl_FragColor = difColor + ambColor;\n' +
  '}\n';

var currentAngle = [0.0, 0.0]; // GLOBAL: Current rotation angle ([x-axis, y-axis] degrees)
var closeFactor =3.0;
var rotateAngle = 0.0;
  
 var elfX = 1.1;
 var elfY = 0.45;
 var dwarfX = -0.1;
 var dwarfY =  0.4;
 var die = {f:2, r:3, u:4, l:6, d:5, b:7};

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  document.onkeydown = function(ev) {
    ev = ev || window.ev;
    if(ev.keyCode == 65 | ev.keyCode == 87 || ev.keyCode == 83 || ev.keyCode == 68){
      dwarfMove(gl, ev.keyCode);
    }
    else if(ev.keyCode == 74 || ev.keyCode == 73 || ev.keyCode == 75 || ev.keyCode == 76){
      elfMove(gl, ev.keyCode);
    }
    else if(ev.keyCode == 82){
      reset();
    }
    else if(ev.keyCode == 70){
      randDie();
    }
  };

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
  var u_DiffuseLight = gl.getUniformLocation(gl.program, 'u_DiffuseLight');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

  if (!u_MvpMatrix || !u_DiffuseLight || !u_LightDirection || !u_AmbientLight ) { 
    console.log('Failed to get the storage location of uniform variables');
    return;
  }
  // Set the light color (white)
  gl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.3, 0.3, 0.3);

  // Calculate the view projection matrix

  var viewProjMatrix = new Matrix4();
  
  // Set texture
  if (!initTextures(gl)) {
    console.log('Failed to intialize the texture.');
    return;
  }

  var tick = function() {   // Start drawing
	  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
	  viewProjMatrix.lookAt( 1.0*closeFactor, 1.0*closeFactor, 2.6*closeFactor, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 );
      draw(gl, viewProjMatrix, u_MvpMatrix);
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
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0,    // v4-v7-v6-v5 back
	 1.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 0.0, 0.0,   1.0, 0.0, 0.0     // 1x1 square for plane
  ]);

  var texCoords = new Float32Array([   // Texture coordinates
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v4-v7-v6-v5 back
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0     // 1x1 square for plane
  ]);

  var colors = new Float32Array([   // Colors
      1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00, // v0-v1-v2-v3 front
      1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00, // v0-v3-v4-v5 right
      0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v0-v5-v6-v1 up
      1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00, // v1-v6-v7-v2 left
      0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82,  0.27, 0.58, 0.82, // v7-v4-v3-v2 down
      1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00, // v4-v7-v6-v5 back
      1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00,  1.00, 1.00, 1.00  // 1x1 square for plane
  ]);

   // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,  // v4-v7-v6-v5 back
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0   // 1x1 square for plane
  ]);

 
  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23,     // back
	24,25,26,  24,26,27		//plane
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    return -1;
  }

  // Write vertex information to buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // Vertex coordinates
  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;      // Color Information
  if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;    // Normal Information
  if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;// Texture coordinates

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

var g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, viewProjMatrix, u_MvpMatrix) {
  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  var u_ApplyTexture = gl.getUniformLocation(gl.program, 'u_ApplyTexture');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_Sampler || !u_ApplyTexture || !u_NormalMatrix) {
    console.log('Failed to get the storage location of u_Sampler, u_ApplyTexture, or u_NormalMatrix');
    return false;
  }
  
  //set defaults of black and don't use
  var u_Color = gl.getUniformLocation(gl.program, 'u_Color');
  var u_UseColor = gl.getUniformLocation(gl.program, 'u_UseColor');
  gl.uniform4f(u_Color, 0.0, 0.0, 0.0, 1.0);
  gl.uniform1i(u_UseColor, 0);
  if (!u_Color || !u_UseColor) {
    console.log('Failed to get the storage location of u_Color or u_UseColor');
    return false;
  }
     
  g_MvpMatrix.set(viewProjMatrix);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers


  //ground
  positionIt(gl, [90.0, 0.0, 0.0], [-1.0, 0.0, -1.0], [3.0, 1.0, 3.0], u_MvpMatrix, u_NormalMatrix, true, true);
  drawPlaneTex(gl, 1, 1, u_ApplyTexture, u_Sampler)
  
  //sheet 1
  positionIt(gl, [90.0, 0.0, 0.0], [1.2, 0.001, 0.4], [0.5, 1.0, 0.5], u_MvpMatrix, u_NormalMatrix, true, true);
  drawPlaneTex(gl, 8, 8, u_ApplyTexture, u_Sampler);

  //sheet 2
  positionIt(gl, [90.0, 180.0, 0.0], [-0.5, 0.001, 0.3], [0.5, 1.0, 0.5], u_MvpMatrix, u_NormalMatrix, true, true);
  drawPlaneTex(gl, 8, 8, u_ApplyTexture, u_Sampler);

  //map
  positionIt(gl, [90.0, 180.0, 0.0], [0.7, 0.001, 0.35], [0.5, 1.0, 0.5], u_MvpMatrix, u_NormalMatrix, true, true);
  drawPlaneTex(gl, 9, 9, u_ApplyTexture, u_Sampler);

  //character 1
  positionIt(gl, [90.0, 180.0, 0.0], [elfX, 0.003, elfY], [0.25, 1.0, 0.25], u_MvpMatrix, u_NormalMatrix, true, true);
  drawPlaneTex(gl, 10, 10, u_ApplyTexture, u_Sampler);

  //character 2
  positionIt(gl, [90.0, 180.0, 0.0], [dwarfX, 0.002, dwarfY], [0.25, 1.0, 0.25], u_MvpMatrix, u_NormalMatrix, true, true);
  drawPlaneTex(gl, 11, 11, u_ApplyTexture, u_Sampler);

  //wall1
  //positionIt(gl, [0.0, 0.0, 0.0], [-1.0, 0.0, -1.0], [3.0, 1.0, 1.0], u_MvpMatrix, u_NormalMatrix, true, true);
  //drawPlaneSolid(gl, u_ApplyTexture, u_Sampler, u_UseColor, u_Color, [0.5, 0.4, 0.09, 1.0]);

  //wall2
  //positionIt(gl, [0.0, 90.0, 0.0], [-1.0, 0.0, 2.0], [1.0, 1.0, 3.0], u_MvpMatrix, u_NormalMatrix, true, true);
  //drawPlaneSolid(gl, u_ApplyTexture, u_Sampler, u_UseColor, u_Color, [0.5, 0.4, 0.09, 1.0]);
  
  possessedCrate(gl, u_ApplyTexture, u_Sampler, u_MvpMatrix, u_NormalMatrix);
  
  //regular box
  positionIt(gl, [0.0, 30.0, 0.0], [0.7, 0.25, 1.5], [0.05, 0.05, 0.05], u_MvpMatrix, u_NormalMatrix, true, true);
  drawBox1RolledDie(gl, u_ApplyTexture, u_Sampler);  

  //blue box
  //positionIt(gl, [0.0, 45.0, 0.0], [1.5, 0.35, -0.5], [0.35, 0.35, 0.35], u_MvpMatrix, u_NormalMatrix, true, true);
  //drawBoxSolid(gl, u_ApplyTexture, u_Sampler, u_UseColor, u_Color, [0.0, 0.0, 1.0, 1.0]);

}

function possessedCrate(gl, u_ApplyTexture, u_Sampler,u_MvpMatrix, u_NormalMatrix){

 //crate
  positionIt(gl, [0.0, 30.0, 0.0], [-0.5, 0.25, -0.5], [0.25, 0.25, 0.25], u_MvpMatrix, u_NormalMatrix, true, true);
  drawBox1Tex(gl, 12, 12, u_ApplyTexture, u_Sampler);  
 
  //crate
  positionIt(gl, [0.0, rotateAngle, 0.0], [-0.5, 0.65, -0.5], [0.15, 0.15, 0.15], u_MvpMatrix, u_NormalMatrix, true, true);
  drawBox1Dice(gl, u_ApplyTexture, u_Sampler);  

  rotateAngle += 1.0;
  if(rotateAngle >= 360.0) rotateAngle = 0.0;
} 

function positionIt(gl, rotate, translate, scale, u_MvpMatrix, u_NormalMatrix, push, pop){
  
  if(push) { pushMatrix(g_MvpMatrix); }
 
  // Caliculate The model view projection matrix and pass it to u_MvpMatrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals
  var modelMatrix = new Matrix4(); // Transformation matrix for normals
  //camera alterations
  modelMatrix.setRotate( -currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  modelMatrix.rotate( -currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  //translate
  modelMatrix.translate(translate[0], translate[1], translate[2]);
  //scale
  modelMatrix.scale(scale[0], scale[1], scale[2]);
  //rotate
  if(rotate[0] != 0.0) modelMatrix.rotate(rotate[0], 1.0, 0.0, 0.0);
  if(rotate[1] != 0.0) modelMatrix.rotate(rotate[1], 0.0, 1.0, 0.0);
  if(rotate[2] != 0.0) modelMatrix.rotate(rotate[2], 0.0, 0.0, 1.0);
  
  g_MvpMatrix.multiply(modelMatrix);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();

  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  if(pop) {	g_MvpMatrix = popMatrix(); }
  
}


function drawBox1Tex(gl, applyTexture, textureUnit, u_ApplyTexture, u_Sampler){

  gl.uniform1i(u_ApplyTexture, applyTexture);
  gl.uniform1i(u_Sampler, textureUnit);			//default

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);   // Draw the front
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6);   // Draw the right
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 12);   // Draw the up
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 18);   // Draw the left
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 24);   // Draw the down
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 30);   // Draw the back

}

function drawBox1Dice(gl, u_ApplyTexture, u_Sampler){

  gl.uniform1i(u_ApplyTexture, 2);
  gl.uniform1i(u_Sampler, 2);     //default
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);   // Draw the front
  
  gl.uniform1i(u_ApplyTexture, 3);
  gl.uniform1i(u_Sampler, 3);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6);   // Draw the right
  
  gl.uniform1i(u_ApplyTexture, 4);
  gl.uniform1i(u_Sampler, 4);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 12);   // Draw the up

  gl.uniform1i(u_ApplyTexture, 6);
  gl.uniform1i(u_Sampler, 6);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 18);   // Draw the left
  
  gl.uniform1i(u_ApplyTexture, 5);
  gl.uniform1i(u_Sampler, 5);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 24);   // Draw the down

  gl.uniform1i(u_ApplyTexture, 7);
  gl.uniform1i(u_Sampler, 7);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 30);   // Draw the back

}

function drawBox1RolledDie(gl, u_ApplyTexture, u_Sampler){

  gl.uniform1i(u_ApplyTexture, die.f);
  gl.uniform1i(u_Sampler, die.f);     //default
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);   // Draw the front
  
  gl.uniform1i(u_ApplyTexture, die.r);
  gl.uniform1i(u_Sampler, die.r);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 6);   // Draw the right
  
  gl.uniform1i(u_ApplyTexture, die.u);
  gl.uniform1i(u_Sampler, die.u);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 12);   // Draw the up

  gl.uniform1i(u_ApplyTexture, die.l);
  gl.uniform1i(u_Sampler, die.l);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 18);   // Draw the left
  
  gl.uniform1i(u_ApplyTexture, die.d);
  gl.uniform1i(u_Sampler, die.d);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 24);   // Draw the down

  gl.uniform1i(u_ApplyTexture, die.b);
  gl.uniform1i(u_Sampler, die.b);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 30);   // Draw the back

}

function drawBoxSolid(gl, u_ApplyTexture, u_Sampler, u_UseColor, u_Color, color){
  gl.uniform1i(u_ApplyTexture, 0);
  gl.uniform1i(u_Sampler, 0);				//default
  gl.uniform1i(u_UseColor, 1);				//default
  gl.uniform4f(u_Color, color[0], color[1], color[2], color[3]);
  
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);   // Draw the front

}

function drawPlaneTex(gl, applyTexture, textureUnit, u_ApplyTexture, u_Sampler){
  gl.uniform1i(u_ApplyTexture, applyTexture);
  gl.uniform1i(u_Sampler, textureUnit);			//default

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 36);   // Draw the front
}

function drawPlaneSolid(gl, u_ApplyTexture, u_Sampler, u_UseColor, u_Color, color){
  gl.uniform1i(u_ApplyTexture, 0);
  gl.uniform1i(u_Sampler, 0);				//default
  gl.uniform1i(u_UseColor, 1);				//default
  gl.uniform4f(u_Color, color[0], color[1], color[2], color[3]);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 36);   // Draw the plane
  gl.uniform1i(u_UseColor, 0);				//default

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

var imagesReady = 0;
function initTextures(gl) {
  // Create a texture objects
   console.log("Hi there ")
  var texture1 = gl.createTexture();
  var texture2 = gl.createTexture();
  var texture3 = gl.createTexture();
  var texture4 = gl.createTexture();
  var texture5 = gl.createTexture();
  var texture6 = gl.createTexture();
  var texture7 = gl.createTexture();
  var texture8 = gl.createTexture();
  var texture9 = gl.createTexture();
  var texture10 = gl.createTexture();
  var texture11 = gl.createTexture();
  var texture12 = gl.createTexture();
  
  //if (!texture1|!texture2|!texture3|!texture4) {
  //  console.log('Failed to create the texture objects');
  //  return false;
  //}

  // Create the image object
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();
  var image4 = new Image();
  var image5 = new Image();
  var image6 = new Image();
  var image7 = new Image();
  var image8 = new Image();
  var image9 = new Image();
  var image10 = new Image();
  var image11 = new Image();
  var image12 = new Image();
  //if (!image1|!image2|!image3|!image4) {
  // console.log('Failed to create the image objects');
  //  return false;
  //}
  // Register the event handler to be called when image loading is completed
  image1.onload = function(){ loadTexture(gl, texture1, image1, 12); };
  image2.onload = function(){ loadTexture(gl, texture2, image2, 1); };
  image3.onload = function(){ loadTexture(gl, texture3, image3, 2); };
  image4.onload = function(){ loadTexture(gl, texture4, image4, 3); };
  image5.onload = function(){ loadTexture(gl, texture5, image5, 4); };
  image6.onload = function(){ loadTexture(gl, texture6, image6, 5); };
  image7.onload = function(){ loadTexture(gl, texture7, image7, 6); };
  image8.onload = function(){ loadTexture(gl, texture8, image8, 7); };
  image9.onload = function(){ loadTexture(gl, texture9, image9, 8); };
  image10.onload = function(){ loadTexture(gl, texture10, image10, 9); };
  image11.onload = function(){ loadTexture(gl, texture11, image11, 10); };
  image12.onload = function(){ loadTexture(gl, texture12, image12, 11); };

  // Tell the browser to load an Image
  image1.src = './box.png';
  image2.src = './wood.jpg';
  image3.src = './d1.png';
  image4.src = './d2.png';
  image5.src = './d3.png';
  image6.src = './d4.png';
  image7.src = './d5.png';
  image8.src = './d6.png';
  image9.src = './dnd.png';
  image10.src = './map.png';
  image11.src = './elf.jpg';
  image12.src = './dwarf.png';

  //while(imagesReady < 1){
//	  console.log("ImagesReady = " + imagesReady);
//  }
  return true;
}

function loadTexture(gl, texture, image, textureNum) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
  if(textureNum==0){ 	  // Activate texture unit0
	gl.activeTexture(gl.TEXTURE0);
  }
  else if(textureNum==1){ // Activate texture unit1
	gl.activeTexture(gl.TEXTURE1);
  }
  else if(textureNum==2){ // Activate texture unit2
	gl.activeTexture(gl.TEXTURE2);
  }
  else if(textureNum==3){ // Activate texture unit3
	gl.activeTexture(gl.TEXTURE3);
  }
  else if(textureNum==4){ // Activate texture unit3
  gl.activeTexture(gl.TEXTURE4);
  }
  else if(textureNum==5){ // Activate texture unit3
  gl.activeTexture(gl.TEXTURE5);
  }
  else if(textureNum==6){ // Activate texture unit3
  gl.activeTexture(gl.TEXTURE6);
  }
  else if(textureNum==7){ // Activate texture unit3
  gl.activeTexture(gl.TEXTURE7);
  }
  else if(textureNum==8){
    gl.activeTexture(gl.TEXTURE8);
  }
   else if(textureNum==9){
    gl.activeTexture(gl.TEXTURE9);
  }
   else if(textureNum==10){
    gl.activeTexture(gl.TEXTURE10);
  }
   else if(textureNum==11){
    gl.activeTexture(gl.TEXTURE11);
  }
  else if(textureNum==12){
    gl.activeTexture(gl.TEXTURE12);
  }
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  imagesReady++;
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

function setCloseFactor(){
	
	var cFactor = document.getElementById('cFactor');
	closeFactor = cFactor.value/10.0;
	var text = document.getElementById('closeFactorText');
	text.innerHTML = " " + closeFactor + " ";	
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

function dwarfMove(gl, keyCode){
  if(keyCode == 65){
    dwarfX = dwarfX-0.1;
  }
  else if(keyCode == 87){
    dwarfY = dwarfY-0.1;
  }
  else if(keyCode == 83){
    dwarfY = dwarfY+0.1;
  }
  else if(keyCode == 68){
    dwarfX = dwarfX+0.1;
  }
}

function elfMove(gl, keyCode){
  if(keyCode == 73){
    elfY = elfY-0.1;
  }
  else if(keyCode == 74){
    elfX = elfX-0.1;
  }
  else if(keyCode == 75){
    elfY = elfY+0.1;
  }
  else if(keyCode == 76){
    elfX = elfX+0.1;
  }
}

function randDie(){
  roll = Math.floor(Math.random() * 6) + 1;
  
  switch(roll){
    case 1:
      die = {f:6, r:5, u:2, l:2, d:7, b:3};
      break;
    case 2:
      die = {f:2, r:5, u:3, l:2, d:6, b:7};
      break;
    case 3:
      die = {f:2, r:3, u:4, l:6, d:5, b:7};
      break;
    case 4:
      die = {f:2, r:6, u:5, l:3, d:2, b:7};
      break;
    case 5:
      die = {f:7, r:5, u:6, l:2, d:3, b:2};
      break;
    case 6:
      die = {f:3, r:4, u:7, l:5, d:2, b:6};
      break;
  }
}

function reset(){
 elfX = 1.1;
 elfY = 0.45;
 dwarfX = -0.1;
 dwarfY =  0.4;
 die = {f:2, r:3, u:4, l:6, d:5, b:7};
 
 document.getElementById('xAngle').value = "0";
 document.getElementById('xAngletext').textContent = "0°";
 currentAngle[0] = 0.0;
 
 document.getElementById('yAngle').value = "0";
 document.getElementById('yAngletext').textContent = "0°";
 currentAngle[1] = 0.0;
 
 document.getElementById('cFactor').value = "30";
 document.getElementById('closeFactorText').textContent = "3.0";
 closeFactor = 3.0;
}
