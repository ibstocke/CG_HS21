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
    aVertexColorId: -1,
    aVertexTextureCoordId: -1,
    aVertexNormalId: -1,
    uModelMatId: -1,
    uModelViewMatrixId: -1,
    uProjectionMatrixId: -1,
    uNormalMatrixId: -1,
    uTextureMatrixId: -1,
    uSamplerId: -1,
    uEnableTextureId: -1,
    uLightPositionId: -1,
    uLightColorId: -1,
    uEnableLightingId: -1
};

// parameters that define the scene
var scene = {
    eyePosition: [0, 2, 5],
    lookAtPosition: [0, 0, 0],
    upVector: [0, 1, 0],
    nearPlane: 0.1,
    farPlane: 20.0,
    fov: 45,
    lightPosition: [1,-0.6, -5],
    lightColor: [1, 1, 1]
};

var glob = {
    lookAtMatrix: mat4.create()
};

// we keep all the parameters for drawing a specific object together
var objects = {
    cubes: [],
    spheres: []
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
        glMatrix.toRadian(scene.fov), // fovy
        canvas.clientWidth / canvas.clientHeight,  // aspect
        scene.nearPlane, // near
        scene.farPlane, // far
    );

    var viewMat = mat4.create();
    mat4.lookAt(
        viewMat,
        scene.eyePosition, // eye
        scene.lookAtPosition, // fovy / center
        scene.upVector, // up
    );
    glob.lookAtMatrix = viewMat

    gl.uniformMatrix4fv(ctx.uProjectionMatrixId, false, projectionMat);
    gl.uniformMatrix4fv(ctx.uModelViewMatrixId, false, viewMat);

    //gl.frontFace(gl.CCW); // defines how the front face is drawn
    //gl.cullFace(gl.BACK); // defines which face should be culled
    //gl.enable(gl.CULL_FACE); // enables culling
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.1, 0.1, 0.1, 1);
}

/**
 * Setup all the attribute and uniform variables
 */
function setUpAttributesAndUniforms(){
    "use strict";
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.aVertexColorId = gl.getAttribLocation(ctx.shaderProgram, "aVertexColor");
    ctx.aVertexTextureCoordId = gl.getAttribLocation(ctx.shaderProgram, "aVertexTextureCoord");
    ctx.aVertexNormalId = gl.getAttribLocation(ctx.shaderProgram, "aVertexNormal");

    ctx.uModelViewMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uModelViewMatrix");
    ctx.uProjectionMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uProjectionMatrix");
    ctx.uNormalMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uNormalMatrix");
    ctx.uModelMatId = gl.getUniformLocation(ctx.shaderProgram, "uModelMat");
    //ctx.uTextureMatrixId = gl.getUniformLocation(ctx.shaderProgram, "uTextureMatrix");

    ctx.uSamplerId = gl.getUniformLocation(ctx.shaderProgram, "uSampler");
    ctx.uEnableTextureId = gl.getUniformLocation(ctx.shaderProgram, "uEnableTexture");

    ctx.uLightPositionId = gl.getUniformLocation(ctx.shaderProgram, "uLightPosition");
    ctx.uLightColorId = gl.getUniformLocation(ctx.shaderProgram, "uLightColor");
    ctx.uEnableLightingId = gl.getUniformLocation(ctx.shaderProgram, "uEnableLighting");
}

/**
 * Setup the buffers to use. If more objects are needed this should be split in a file per object.
 */
function setUpObjects(){
    "use strict";
    objects.cubes.push(new WireFrameCube(gl, 1, [0,0,0],1|2,"box.png"))
    objects.cubes.push(new WireFrameCube(gl, 0.5, [1.55,1.3,0],1))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,1],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,0],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,-1],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,-2],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,-3],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,-4],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,-5],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,-6],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,-7],4))
    objects.cubes.push(new WireFrameCube(gl, 0.7, [2.2,-1.3,-8],4))
    objects.cubes.push(new WireFrameCube(gl, 1, [-1.5,1.3,0],1|2|4))

    objects.spheres.push(new SolidSphere(gl, 0.8,[-1.2,-0.7,1], [1,1,0]))
    objects.spheres.push(new SolidSphere(gl, 0.5,[0,0.7,-6], [0,1,0],3))
}

/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let currAngle = objects.cubes[0].getAngle()
    currAngle += .99
    if (currAngle > 360)
        currAngle = 0


    // set the light
    gl.uniform1i(ctx.uEnableLightingId, 1);
    gl.uniform3fv(ctx.uLightPositionId, scene.lightPosition);
    gl.uniform3fv(ctx.uLightColorId, scene.lightColor);

    objects.cubes.forEach(cube => {
        cube.setAngle(currAngle)
        cube.draw(gl, ctx.aVertexPositionId, ctx.uModelMatId, ctx.aVertexColorId, ctx.aVertexTextureCoordId, ctx.uSamplerId, ctx.uEnableTextureId, ctx.aVertexNormalId, ctx.uNormalMatrixId, [...glob.lookAtMatrix])
    })


    objects.spheres.forEach(sphere => {
        sphere.setAngle(currAngle)
        sphere.draw(gl, ctx.aVertexPositionId, ctx.uModelMatId, ctx.aVertexColorId, ctx.aVertexTextureCoordId, ctx.uSamplerId, ctx.uEnableTextureId, ctx.aVertexNormalId, ctx.uNormalMatrixId, [...glob.lookAtMatrix])
    })
}

function drawAnimated(timeStamp) {
    draw()
    window.requestAnimationFrame(drawAnimated);
}
