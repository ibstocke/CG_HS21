/**
 *
 * Define a sphere that can be drawn with texture or color.
 */

/**
 *
 * @param gl the gl object for which to define the sphere
 * @param radius radius
 * @param posXYZ position
 * @param color the color of the sphere
 *
 */
function SolidSphere(gl, radius, posXYZ, color, rotDistance = 0) {

    function defineVerticesAndTexture(latitudeBands, longitudeBands) {
        "use strict";
        // define the vertices of the sphere
        var vertices = [];
        var normals = [];
        var textures = [];

        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                // position (and normals as it is a unit sphere)
                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;

                // texture coordinates
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                vertices.push(x);
                vertices.push(y);
                vertices.push(z);

                normals.push(x);
                normals.push(y);
                normals.push(z);

                textures.push(u);
                textures.push(v);
            }
        }
        return {
            vertices: vertices,
            normals: normals,
            textures: textures
        }
    }

    function defineIndices(latitudeBands, longitudeBands) {
        var indices = [];
        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;

                indices.push(first);
                indices.push(first + 1);
                indices.push(second);

                indices.push(second);
                indices.push(first + 1);
                indices.push(second + 1);
            }
        }
        return indices;
    }

    function draw(gl, aVertexPositionId, uModelMatId, aColorId, aVertexTextureCoordId, uSamplerId, uEnabletextureId, aVertexNormalId, uNormalMatrixId, lookAtMatrix) {
        "use strict";


        var modelMat = mat4.create();
        mat4.fromTranslation(modelMat, this.posXYZ)
        mat4.scale(modelMat,modelMat,[this.radius, this.radius, this.radius])
        //mat4.rotate(modelMat, modelMat, glMatrix.toRadian(this.angle), this.rotAxis);
        gl.uniformMatrix4fv(uModelMatId, false, modelMat);

        var normalMatrix = mat3.create()
        mat3.normalFromMat4(normalMatrix, lookAtMatrix);
        gl.uniformMatrix3fv(uNormalMatrixId, false, normalMatrix);

        // position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
        gl.vertexAttribPointer(aVertexPositionId, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexPositionId);

        // color is directly specified as an attribute here, as it is valid for the whole object
        gl.disableVertexAttribArray(aColorId);
        gl.vertexAttrib3f(aColorId, this.color[0], this.color[1], this.color[2]);

        // normal
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormals);
        gl.vertexAttribPointer(aVertexNormalId, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexNormalId);

        // elements
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.bufferIndices);
        gl.drawElements(gl.TRIANGLES, this.numberOfTriangles*3 ,gl.UNSIGNED_SHORT, 0);

        // disable attributes
        gl.disableVertexAttribArray(aVertexPositionId);
        gl.disableVertexAttribArray(aVertexNormalId);
    }

    function setAngle(newAngle) {
        this.angle = newAngle
        if (this.rotDistance != 0) {
            this.posXYZ[0] = rotDistance * Math.sin(newAngle /180 * Math.PI);
            this.posXYZ[2] = rotDistance * Math.cos(newAngle /180 * Math.PI);
        }
    }

    function getAngle(){
        return this.angle
    }

    var sphere = {};
    sphere.latitudeBands = 50;
    sphere.longitudeBands = 50;
    sphere.numberOfTriangles = sphere.latitudeBands*sphere.longitudeBands*2;
    sphere.color = color;
    sphere.draw = draw;
    sphere.setAngle = setAngle;
    sphere.getAngle = getAngle;
    sphere.radius = radius;
    sphere.posXYZ = posXYZ;
    sphere.angle = 0;
    sphere.rotDistance = rotDistance


    var verticesAndTextures = defineVerticesAndTexture(sphere.latitudeBands, sphere.longitudeBands);
    var indices = defineIndices(sphere.latitudeBands, sphere.longitudeBands);

    sphere.bufferVertices  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.vertices), gl.STATIC_DRAW);

    sphere.bufferNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.normals), gl.STATIC_DRAW);

    sphere.bufferTextures = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.bufferTextures);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesAndTextures.textures), gl.STATIC_DRAW);

    sphere.bufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.bufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return sphere;
}