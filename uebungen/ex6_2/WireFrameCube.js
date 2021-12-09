/**
 *
 * Define a wire frame cube with methods for drawing it.
 *
 * @param gl the webgl context
 * @param len unit size of cube
 * @param posXYZ position x y z
 * @param rotAxis rotation axis
 * @param textureFile texture file
 * @returns object with draw method
 * @constructor
 */
function WireFrameCube (gl, len, posXYZ = [.0,.0,.0], rotAxis = 0, textureFile) {
    function defineVertices(gl) {
    // define the vertices of the cube
        var red = [0.717, 0.071, 0.204, 1]
        var green = [0,0.608,0.282,1]
        var blue = [0,0.275,0.678,1]
        var white = [1,1,1,1]
        var yellow = [1,0.835,0,1]
        var orange = [1,0.345,0,1]


        var edges3D = [
            [0.5, -0.5, -0.5],
            [0.5, 0.5, -0.5],
            [0.5, 0.5, 0.5],
            [0.5, -0.5, 0.5],
            [-0.5, 0.5, -0.5],
            [-0.5, -0.5, -0.5],
            [-0.5, -0.5, 0.5],
            [-0.5, 0.5, 0.5]
        ];
        var edges2D = [
            [0.0, 0.0],
            [1.0, 0.0],
            [1.0, 1.0],
            [0.0, 1.0]
        ];

        var normals = [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [-1.0, 0.0, 0.0],
            [0.0, -1.0, 0.0],
            [0.0, 0.0, 1.0],
            [0.0, 0.0, -1.0]
        ]


        var vertmp =[
            edges3D[0],white,edges2D[0],normals[0],
            edges3D[1],white,edges2D[1],normals[0],
            edges3D[2],white,edges2D[2],normals[0],
            edges3D[3],white,edges2D[3],normals[0],
            edges3D[1],red,edges2D[0],normals[1],
            edges3D[4],red,edges2D[1],normals[1],
            edges3D[7],red,edges2D[2],normals[1],
            edges3D[2],red,edges2D[3],normals[1],
            edges3D[4],yellow,edges2D[0],normals[2],
            edges3D[5],yellow,edges2D[1],normals[2],
            edges3D[6],yellow,edges2D[2],normals[2],
            edges3D[7],yellow,edges2D[3],normals[2],
            edges3D[5],orange,edges2D[0],normals[3],
            edges3D[0],orange,edges2D[1],normals[3],
            edges3D[3],orange,edges2D[2],normals[3],
            edges3D[6],orange,edges2D[3],normals[3],
            edges3D[3],blue,edges2D[0],normals[4],
            edges3D[2],blue,edges2D[1],normals[4],
            edges3D[7],blue,edges2D[2],normals[4],
            edges3D[6],blue,edges2D[3],normals[4],
            edges3D[5],green,edges2D[0],normals[5],
            edges3D[4],green,edges2D[1],normals[5],
            edges3D[1],green,edges2D[2],normals[5],
            edges3D[0],green,edges2D[3],normals[5],
        ]
        var vertices = [].concat(...vertmp)

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer );
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW );
        return buffer;
    }
    function defineTriangles (gl) {
    // define the edges for the cube , there are 12 edges in a cube
        var vertexIndices = [
            0,1,2,
            2,3,0,
            4,5,6,
            6,7,4,
            8,9,10,
            10,11,8,
            12,13,14,
            14,15,12,
            16,17,18,
            18,19,16,
            20,21,22,
            22,23,20];
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW );
        return buffer;
    }
    function defineRotAxis(rotAxis){
        var axis = [0,0,0]
        if (rotAxis & 1){
            axis[0] = 1
        }
        if (rotAxis & 2){
            axis[1] = 1
        }
        if (rotAxis & 4){
            axis[2] = 1
        }
        return axis
    }
    function loadTexture(gl,textureFile) {
        if (!textureFile){
            return null;
        }

        var image = new Image();
        // create a texture object
        var lennaTxt = {}
        lennaTxt.textureObj = gl.createTexture();
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, lennaTxt.textureObj);
            // set parameters for the texture
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D , 0, gl.RGBA , gl.RGBA , gl.UNSIGNED_BYTE , image );
            gl.texParameteri(gl.TEXTURE_2D , gl.TEXTURE_MAG_FILTER , gl.LINEAR );
            gl.texParameteri(gl.TEXTURE_2D , gl.TEXTURE_MIN_FILTER , gl.LINEAR );
            gl.texParameteri(gl.TEXTURE_2D , gl.TEXTURE_WRAP_S , gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D , gl.TEXTURE_WRAP_T , gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
            // turn texture off again
            gl.bindTexture(gl.TEXTURE_2D, null);
            // make sure there is a redraw after the loading of the texture
            //draw();
        };
        // setting the src will trigger onload
        image.src = textureFile;
        return lennaTxt;
    }
    return {
        len: len,
        posXYZ: posXYZ,
        rotAxis: defineRotAxis(rotAxis),
        angle: 0,
        bufferVertices: defineVertices(gl),
        bufferTriangles: defineTriangles(gl),
        texture: loadTexture(gl,textureFile),
        setAngle: function(newAngle){
            this.angle = newAngle
        },
        getAngle: function(){
            return this.angle
        },
        draw: function (gl, aVertexPositionId, uModelMatId, aColorId, aVertexTextureCoordId, uSamplerId, uEnabletextureId, aVertexNormalId, uNormalMatrixId, lookAtMatrix) {
            var modelMat = mat4.create();
            mat4.fromTranslation(modelMat, this.posXYZ)
            mat4.scale(modelMat,modelMat,[this.len, this.len, this.len])
            mat4.rotate(modelMat, modelMat, glMatrix.toRadian(this.angle), this.rotAxis);


            gl.uniformMatrix4fv(uModelMatId, false, modelMat);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
            gl.vertexAttribPointer(aVertexPositionId, 3, gl.FLOAT, false, 48, 0);
            gl.enableVertexAttribArray(aVertexPositionId);

            gl.vertexAttribPointer(aColorId , 4, gl.FLOAT , false , 48, 12);
            gl.enableVertexAttribArray(aColorId);

            mat4.translate(lookAtMatrix, lookAtMatrix, this.posXYZ);
            mat4.rotate(lookAtMatrix, lookAtMatrix, glMatrix.toRadian(this.angle), this.rotAxis);
            var normalMatrix = mat3.create()
            mat3.normalFromMat4(normalMatrix, lookAtMatrix);
            gl.uniformMatrix3fv(uNormalMatrixId, false, normalMatrix);
            gl.vertexAttribPointer(aVertexNormalId , 3, gl.FLOAT , false , 48, 36);
            gl.enableVertexAttribArray(aVertexNormalId);

            gl.uniform1i(uEnabletextureId, 0);
            if(this.texture) {
                gl.uniform1i(uEnabletextureId, 1);
                gl.uniform1i(uSamplerId, 0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture.textureObj);
                gl.activeTexture(gl.TEXTURE0);
                gl.vertexAttribPointer(aVertexTextureCoordId , 2, gl.FLOAT , false , 48, 28);
                gl.enableVertexAttribArray(aVertexTextureCoordId);
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferTriangles);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

            gl.disableVertexAttribArray(aVertexTextureCoordId);
        }
    }
}