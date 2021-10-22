//
// DI Computer Graphics
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
    uColorId: -1,
    uProjectionMatId: -1,
    uModelMatId: -1,
    uCameraPosMatrixId: -1,
};

// we keep all the parameters for drawing a specific object together
var objects = {
    cubes: []
};

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    "use strict";
    var canvas = document.getElementById("myCanvas");
    gl = createGLContext(canvas);
    initGL(canvas);

    window.requestAnimationFrame(drawAnimated);
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL(canvas) {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShader.glsl');
    setUpAttributesAndUniforms();
    setUpObjects();



    var projectionMat = mat4.create();
    mat4.perspective(
        projectionMat,
        glMatrix.toRadian(45), // fovy
        canvas.clientWidth / canvas.clientHeight,  // aspect
        0, // near
        20, // far
    );

    var viewMat = mat4.create();
    mat4.lookAt(
        viewMat,
        [-3, 0, 1.5], // eye
        [0, 0, 0], // fovy / center
        [0, 0, 1], // up
    );

    gl.uniformMatrix4fv(ctx.uProjectionMatId, false, projectionMat);
    gl.uniformMatrix4fv(ctx.uCameraPosMatrixId, false, viewMat);

    gl.clearColor(0.1, 0.1, 0.1, 1);
}

/**
 * Setup all the attribute and uniform variables
 */
function setUpAttributesAndUniforms(){
    "use strict";
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.uColorId = gl.getUniformLocation(ctx.shaderProgram, "uColor");
    ctx.uProjectionMatId = gl.getUniformLocation(ctx.shaderProgram, "uProjectionMat");
    ctx.uModelMatId = gl.getUniformLocation(ctx.shaderProgram, "uModelMat");
    ctx.uCameraPosMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uCameraPosMatrix");
}

/**
 * Setup the buffers to use. If more objects are needed this should be split in a file per object.
 */
function setUpObjects(){
    "use strict";
    objects.cubes.push(new WireFrameCube(gl, 1,[.0, .7, .4, 1.]))
    objects.cubes.push(new WireFrameCube(gl, 0.7,[.0, .7, .4, 1.]))
    objects.cubes.push(new WireFrameCube(gl, 0.1,[.0, .7, .4, 1.]))
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    gl.clear(gl.COLOR_BUFFER_BIT);

    let currAngle = objects.cubes[0].getAngle()
    currAngle += .5
    if (currAngle > 360)
        currAngle = 0

    objects.cubes.forEach(cube => {
        cube.setAngle(currAngle)
        cube.draw(gl, ctx.aVertexPositionId, ctx.uModelMatId, ctx.uColorId)
    })
}

function drawAnimated(timeStamp) {
    draw()
    window.requestAnimationFrame(drawAnimated);
}
