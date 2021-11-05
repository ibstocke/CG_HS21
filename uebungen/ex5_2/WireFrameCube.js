/**
 *
 * Define a wire frame cube with methods for drawing it.
 *
 * @param gl the webgl context
 * @returns object with draw method
 * @constructor
 */
function WireFrameCube (gl, len, posXYZ = [.0,.0,.0], rotAxis = 0, textureFile) {
    function defineVertices(gl) {
    // define the vertices of the cube
        var red = [0.717,0.071,0.204,1]
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

        var vertmp =[
            edges3D[0],white,edges2D[0],
            edges3D[1],white,edges2D[1],
            edges3D[2],white,edges2D[2],
            edges3D[3],white,edges2D[3],
            edges3D[1],red,edges2D[0],
            edges3D[4],red,edges2D[1],
            edges3D[7],red,edges2D[2],
            edges3D[2],red,edges2D[3],
            edges3D[4],yellow,edges2D[0],
            edges3D[5],yellow,edges2D[1],
            edges3D[6],yellow,edges2D[2],
            edges3D[7],yellow,edges2D[3],
            edges3D[5],orange,edges2D[0],
            edges3D[0],orange,edges2D[1],
            edges3D[3],orange,edges2D[2],
            edges3D[6],orange,edges2D[3],
            edges3D[3],blue,edges2D[0],
            edges3D[2],blue,edges2D[1],
            edges3D[7],blue,edges2D[2],
            edges3D[6],blue,edges2D[3],
            edges3D[5],green,edges2D[0],
            edges3D[4],green,edges2D[1],
            edges3D[1],green,edges2D[2],
            edges3D[0],green,edges2D[3],
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
        rotAxis: rotAxis,
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
        draw: function (gl, aVertexPositionId, uModelMatId, aColorId, aVertexTextureCoordId, uSamplerId, uEnabletextureId) {
            var modelMat = mat4.create();
            mat4.fromTranslation(modelMat, this.posXYZ)
            mat4.scale(modelMat,modelMat,[this.len, this.len, this.len])
            if (this.rotAxis == 1){
                mat4.rotateX(modelMat, modelMat,glMatrix.toRadian(this.angle))
                gl.viewport(400, 300, 400, 300);
            }else if (this.rotAxis == 2){
                mat4.rotateY(modelMat, modelMat,glMatrix.toRadian(this.angle))
                gl.viewport(0, 0, 400, 300);
            }else if (this.rotAxis == 3){
                mat4.rotateZ(modelMat, modelMat,glMatrix.toRadian(this.angle))
                gl.viewport(400, 0, 400, 300);
            }else{
                gl.viewport(0, 300, 400, 300);
            }

            gl.uniformMatrix4fv(uModelMatId, false, modelMat);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertices);
            gl.vertexAttribPointer(aVertexPositionId, 3, gl.FLOAT, false, 36, 0);
            gl.enableVertexAttribArray(aVertexPositionId);

            gl.vertexAttribPointer(aColorId , 4, gl.FLOAT , false , 36, 12);
            gl.enableVertexAttribArray(aColorId);

            gl.uniform1i(uEnabletextureId, 0);
            if(this.texture) {
                gl.uniform1i(uEnabletextureId, 1);
                gl.uniform1i(uSamplerId, 0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture.textureObj);
                gl.activeTexture(gl.TEXTURE0);
            }
            gl.vertexAttribPointer(aVertexTextureCoordId , 2, gl.FLOAT , false , 36, 28);
            gl.enableVertexAttribArray(aVertexTextureCoordId);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferTriangles);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        }
    }
}