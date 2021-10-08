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
    uModelMatId: -1
};

// we keep all the parameters for drawing a specific object together
var rectangleObject = {
    buffer: -1
};

var consts = {
    xDim: 800,
    yDim: 600,
    ballDiameter: 10,
    xBorderOffset: 15,
    yBorderOffset: 15,
    xOffsetBorderToPaddle: 20,
    xPaddleWidth: 10,
    yPaddleHeight: 70
}

var gameField = {
    posXY: [.0, .0],
    dim: [consts.xDim - 2*consts.xBorderOffset, consts.yDim - 2*consts.yBorderOffset],
    filled: false
}

var ball = {
    posXY: [.0, .0],
    dim: [consts.ballDiameter, consts.ballDiameter],
    filled: true,
    color: [0,1,0,1]
}

var middleLine = {
    posXY: [.0, .0],
    dim: [2 , consts.yDim-2*consts.yBorderOffset],
    filled: true
}

var paddleLeft = {
    posXY: [-consts.xDim/2+consts.xBorderOffset+consts.xOffsetBorderToPaddle, .0],
    dim: [consts.xPaddleWidth , consts.yPaddleHeight],
    filled: false,
    color: [1,0,0,1],
    speed: 4
}

var paddleRight = {
    posXY: [consts.xDim-(consts.xDim/2+consts.xBorderOffset+consts.xOffsetBorderToPaddle), .0],
    dim: [consts.xPaddleWidth , consts.yPaddleHeight],
    filled: false,
    color: [0,0,1,1],
    speed: 4
}

/**
 * Startup function to be called when the body is loaded
 */
function startup() {
    "use strict";
    var canvas = document.getElementById("myCanvas");
    gl = createGLContext(canvas);
    initGL();
    window.addEventListener('keyup', onKeyup, false);
    window.addEventListener('keydown', onKeydown, false);

    window.requestAnimationFrame(drawAnimated);
}

/**
 * InitGL should contain the functionality that needs to be executed only once
 */
function initGL() {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShader.glsl');
    setUpAttributesAndUniforms();
    setUpBuffers();

    // Set up the world coordinates
    var projectionMat = mat3.create();
    mat3.fromScaling(projectionMat, [2.0/gl.drawingBufferWidth , 2.0/gl.drawingBufferHeight]);
    gl.uniformMatrix3fv(ctx.uProjectionMatId, false, projectionMat);

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
}

/**
 * Setup the buffers to use. If more objects are needed this should be split in a file per object.
 */
function setUpBuffers(){
    "use strict";

    var vertices = [
        -0.5, -0.5,
        0.5, -0.5,
        0.5, 0.5,
        -0.5, 0.5];

    rectangleObject.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function drawAnimated(timeStamp) {
    calcNewGameState(timeStamp);
    draw();
    window.requestAnimationFrame(drawAnimated);
}

function calcNewGameState(timeStamp){
    if(isDown(key.DOWN)){
        paddleLeft.posXY = [paddleLeft.posXY[0] ,paddleLeft.posXY[1]-paddleLeft.speed];
    } else if (isDown(key.UP)){
        paddleLeft.posXY = [paddleLeft.posXY[0] ,paddleLeft.posXY[1]+paddleLeft.speed];
    }
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    console.log("Drawing");
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.buffer);
    gl.vertexAttribPointer(ctx.aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(ctx.aVertexPositionId);

    drawElement(gameField);
    drawElement(ball);
    drawElement(middleLine);
    drawElement(paddleLeft);
    drawElement(paddleRight);
}

function drawElement(e){
    if (e.color) {
        gl.uniform4f(ctx.uColorId, e.color[0], e.color[1], e.color[2], e.color[3]);
    } else
    {
        gl.uniform4f(ctx.uColorId, 1, 1, 1, 1);
    }

    var modelMat = mat3.create();
    mat3.fromTranslation(modelMat, e.posXY);
    mat3.scale(modelMat, modelMat, e.dim);
    gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    if (e.filled){
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    } else {
        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    }
}

// Key Handling
var key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};

function isDown (keyCode) {
    return key._pressed[keyCode];
}

function onKeydown(event) {
    key._pressed[event.keyCode] = true;
}

function onKeyup(event) {
    delete key._pressed[event.keyCode];
}
