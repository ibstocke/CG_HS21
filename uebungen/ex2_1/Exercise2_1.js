//
// Computer Graphics
//
// WebGL Exercises
//

// Register function to call after document has loaded
window.onload = startup;

// the gl object is saved globally
var gl;

// we keep all local parameters for the program in a single object
var ctx = {
    shaderProgram: -1,
    aVertexPositionId: -1,
    aColorId: -1
    // add local parameters for attributes and uniforms here
};

// we keep all the parameters for drawing a specific object together
var rectangleObject = {
    buffer: -1
};

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    "use strict";
    var canvas = document.getElementById("myCanvas");
    gl = createGLContext(canvas);
    initGL();
    draw();
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShader.glsl');
    setUpAttributesAndUniforms();
    setUpBuffers();

    // set the clear color here
    var gray = .8;
    gl.clearColor(gray,gray,gray,1);
    
    // add more necessary commands here
}



// keep texture parameters in an object so we can mix textures and objects
var lennaTxt = {
    textureObj : {}
};

/**
 * Setup all the attribute and uniform variables
 */
function setUpAttributesAndUniforms(){
    "use strict";
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram , "aVertexPosition");
    ctx.aColorId = gl.getAttribLocation(ctx.shaderProgram, "aColor");
}

function setUpBuffers () {
    rectangleObject.buffer = gl.createBuffer();

    var vertices = [
        0.3, 0.0, 1,0,0,1,
        0.0, 0.5, 0,1,0,1,
        0.5, 0.5, 0,0,1,1,
        0.5, 0.0, 1,1,0,1]

    // aktiviert den buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    console.log("Drawing");
    gl.clear(gl.COLOR_BUFFER_BIT);
    // add drawing routines here
    gl.bindBuffer(gl.ARRAY_BUFFER , rectangleObject.buffer);
    // 24: size of a 'package' (6x4bytes -- float:4bytes), 0: offset to first coordinate
    gl.vertexAttribPointer(ctx.aVertexPositionId , 2, gl.FLOAT , false , 24, 0);
    gl.enableVertexAttribArray(ctx.aVertexPositionId);

    // 24: size of a 'package' (5x4bytes), 8: offset to first color (2x4bytes)
    gl.vertexAttribPointer(ctx.aColorId , 4, gl.FLOAT , false , 24, 8);
    gl.enableVertexAttribArray(ctx.aColorId);

    gl.drawArrays(gl.TRIANGLE_FAN ,0,4);
    console.log("Drawing -- done");
}