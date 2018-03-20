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
 
ANGLE = 30;
SCALE_X = 0.0;
SCALE_Y = 0.0;
TRANS_X = 0.0;
TRANS_Y = 0.0;
 
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
  /*if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }*/

  // Create Matrix4 object for the transformations
  var xformMatrix = new Matrix4();
  xformMatrix.scale(SCALE_X, SCALE_Y, 1.0);
  xformMatrix.translate(TRANS_X, TRANS_Y, 0);
  xformMatrix.rotate(-ANGLE, 0, 0, 1);
  
  // Pass the rotation matrix to the vertex shader
  var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
  if (!u_xformMatrix) {
    console.log('Failed to get the storage location of u_xformMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLE_FAN, 23, 60);
  gl.drawArrays(gl.TRIANGLE_FAN, 11, 10);
  gl.drawArrays(gl.TRIANGLE_FAN, 3, 6);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  //gl.drawArrays(gl.TRIANGLE_FAN, 85, 4);
}

function initVertexBuffers(gl) {
  addRegularPolygon(60, BLUE);
  addRegularPolygon(10, GREEN);
  addRegularPolygon(6, RED);
  addTriangle(MAGENTA, MAGENTA, MAGENTA);
  //addRegularPolygon(4, WHITE);
  var vertices = getFloatArray();
  
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
}

