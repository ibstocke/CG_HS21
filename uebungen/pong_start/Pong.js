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
}
var circleObject = {
    buffer: -1
}

var consts = {
    xDim: 800,
    yDim: 600,
    ballDiameter: 20,
    xBorderOffset: 15,
    yBorderOffset: 15,
    xOffsetBorderToPaddle: 20,
    xPaddleWidth: 10,
    yPaddleHeight: 70,
}

var gameState ={
    curTime: -1,
    wins: [0, 0],
    lastWinner: -1
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
    color: [0,1,0,1],
    speedXY: [0.1, 0.02],
    nOfPoints: 60
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
    speedY: .3
}

var paddleRight = {
    posXY: [consts.xDim-(consts.xDim/2+consts.xBorderOffset+consts.xOffsetBorderToPaddle), .0],
    dim: [consts.xPaddleWidth , consts.yPaddleHeight],
    filled: false,
    color: [0,0,1,1],
    speedY: .3
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

    restartGame()
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

    var verticesCircle = [0, 0]
    var angle = 2*Math.PI/ball.nOfPoints
    for (let i = 0; i < ball.nOfPoints; i++) {
        verticesCircle.push(.5*Math.cos(angle*i))
        verticesCircle.push(0.5*Math.sin(angle*i))
    }
    verticesCircle.push(.5*Math.cos(0))
    verticesCircle.push(0.5*Math.sin(0))

    circleObject.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleObject.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesCircle), gl.STATIC_DRAW);
}

function drawAnimated(timeStamp) {
    var deltaTimeMs = 0
    if (gameState.curTime != -1){
        deltaTimeMs = timeStamp - gameState.curTime
    }
    gameState.curTime = timeStamp
    if(deltaTimeMs > 0){
        calcNewGameState(deltaTimeMs)
        draw()
    }

    window.requestAnimationFrame(drawAnimated);
}


/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawRectangle(gameField);
    drawRectangle(middleLine);
    drawRectangle(paddleLeft);
    drawRectangle(paddleRight);
    drawCircle(ball);
}

function drawRectangle(e){
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.buffer);
    gl.vertexAttribPointer(ctx.aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(ctx.aVertexPositionId);

    setColor(e.color)

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

function drawCircle(e){
    gl.bindBuffer(gl.ARRAY_BUFFER, circleObject.buffer);
    gl.vertexAttribPointer(ctx.aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(ctx.aVertexPositionId);

    setColor(e.color)

    var modelMat = mat3.create();
    mat3.fromTranslation(modelMat, e.posXY);
    mat3.scale(modelMat, modelMat, e.dim);
    gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, ball.nOfPoints+2);
}

function setColor(color){
    if (color) {
        gl.uniform4f(ctx.uColorId, color[0], color[1], color[2], color[3]);
    } else
    {
        gl.uniform4f(ctx.uColorId, 1, 1, 1, 1);
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

function calcNewGameState(deltaTimeMs){
    ball.posXY[0] += ball.speedXY[0] * deltaTimeMs
    ball.posXY[1] += ball.speedXY[1] * deltaTimeMs

    var leftIsMovingDown = isDown(key.DOWN)
    var leftIsMovingUp = isDown(key.UP)
    var rightIsMovingUp = false
    var rightIsMovingDown = false
    var maxPaddleLeftPos = gameField.dim[1]/2 - paddleLeft.dim[1]/2
    var maxPaddleRightPos = gameField.dim[1]/2 - paddleRight.dim[1]/2

    //move manually paddeLeft
    if(leftIsMovingDown){
        paddleLeft.posXY = [paddleLeft.posXY[0] ,paddleLeft.posXY[1]-paddleLeft.speedY*deltaTimeMs];
        if (paddleLeft.posXY[1] < -maxPaddleLeftPos){
            paddleLeft.posXY[1] = -maxPaddleLeftPos
            leftIsMovingDown = false
        }
    } else if (leftIsMovingUp) {
        paddleLeft.posXY = [paddleLeft.posXY[0], paddleLeft.posXY[1] + paddleLeft.speedY * deltaTimeMs];
        if (paddleLeft.posXY[1] > maxPaddleLeftPos) {
            paddleLeft.posXY[1] = maxPaddleLeftPos
            leftIsMovingUp = false
        }
    }

    //move automatically paddleRight
    if (ball.posXY[0] > -gameField.dim[0]*2/7 && ball.speedXY[0] > 0) {
        if (ball.posXY[1] > paddleRight.posXY[1] + consts.yPaddleHeight / 8) {
            paddleRight.posXY[1] = paddleRight.posXY[1] + paddleRight.speedY * deltaTimeMs;
            rightIsMovingUp = true
        } else if (ball.posXY[1] < paddleRight.posXY[1] - consts.yPaddleHeight / 8) {
            paddleRight.posXY = [paddleRight.posXY[0], paddleRight.posXY[1] - paddleRight.speedY * deltaTimeMs];
            rightIsMovingDown = true
        }
    } else if (!isInRange(paddleRight.posXY[1],-10,+10) &&
        ball.posXY[0]+5*consts.ballDiameter < paddleRight.posXY[0]-consts.xPaddleWidth/2 ) {
        //move paddle to y middle if ball is heading away
        if (paddleRight.posXY[1] < 0) {
            paddleRight.posXY[1] = paddleRight.posXY[1] + paddleRight.speedY * deltaTimeMs
            rightIsMovingUp = true
        } else{
            paddleRight.posXY[1] = paddleRight.posXY[1] - paddleRight.speedY * deltaTimeMs
            rightIsMovingDown = true
        }
    }

    //fit rightPaddle to ranges
    if (paddleRight.posXY[1] > maxPaddleRightPos) {
        paddleRight.posXY[1] = maxPaddleRightPos
        rightIsMovingUp = false
    } else if (paddleRight.posXY[1] < -maxPaddleRightPos) {
        paddleRight.posXY[1] = -maxPaddleRightPos
        rightIsMovingDown = false
    }


    //check if ball is hitting paddleLeft
    if (ball.posXY[0]-consts.ballDiameter/2 <= paddleLeft.posXY[0]+consts.xPaddleWidth/2){
        if(isInRange(ball.posXY[1],paddleLeft.posXY[1]-consts.yPaddleHeight/2-consts.ballDiameter/2*0.7,
            paddleLeft.posXY[1]+consts.yPaddleHeight/2+consts.ballDiameter/2*0.7)){
            ball.speedXY[0] *= -1.05
            ball.posXY[0] = paddleLeft.posXY[0]+consts.xPaddleWidth/2+consts.ballDiameter/2+1
            if(leftIsMovingDown){
                ball.speedXY[1] -= 0.1
            } else if(leftIsMovingUp){
                ball.speedXY[1] += 0.1
            }
        }
    }

    //check if ball is hitting paddleRight
    if (ball.posXY[0]+consts.ballDiameter/2 >= paddleRight.posXY[0]+consts.xPaddleWidth/2){
        if(isInRange(ball.posXY[1],paddleRight.posXY[1]-consts.yPaddleHeight/2-consts.ballDiameter/2*0.7,
            paddleRight.posXY[1]+consts.yPaddleHeight/2+consts.ballDiameter/2*0.7)){
            ball.speedXY[0] *= -1.05
            ball.posXY[0] = paddleRight.posXY[0]-consts.xPaddleWidth/2-consts.ballDiameter/2-1
            if(rightIsMovingDown){
                ball.speedXY[1] -= 0.1
            } else if(rightIsMovingUp){
                ball.speedXY[1] += 0.1
            }
        }
    }

    //check if ball is hitting y gameBoarders
    if (ball.posXY[1]+consts.ballDiameter/2 > gameField.dim[1]/2){
        ball.speedXY[1] *= -1
        ball.posXY[1] = gameField.dim[1]/2 - consts.ballDiameter/2
    } else if (ball.posXY[1]-+consts.ballDiameter/2 < -gameField.dim[1]/2){
        ball.speedXY[1] *= -1
        ball.posXY[1] = -gameField.dim[1]/2 + consts.ballDiameter/2
    }

    //check if ball is hitting x gameBoarders
    if (ball.posXY[0] >= gameField.dim[0]/2){
        gameState.lastWinner = 0
        restartGame()
    } else if (ball.posXY[0] <= -gameField.dim[0]/2){
        gameState.lastWinner = 1
        restartGame()
    }
}

function isInRange(x, min, max){
    return x >= min && x <= max
}

function restartGame(){
    if (gameState.lastWinner != -1) {
        gameState.wins[gameState.lastWinner]++
    }

    ball.posXY = [.0, .0]
    ball.speedXY = [.15, .02]
    paddleRight.posXY[1] = .0
    paddleLeft.posXY[1] = .0
}
