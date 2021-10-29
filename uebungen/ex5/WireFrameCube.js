/**
 *
 * Define a wire frame cube with methods for drawing it.
 *
 * @param gl the webgl context
 * @returns object with draw method
 * @constructor
 */
function WireFrameCube (gl, len, posXYZ = [.0,.0,.0], rotAxis = 0) {
    function defineVertices(gl) {
    // define the vertices of the cube
        var red = [0.717,0.071,0.204,1]
        var green = [0,0.608,0.282,1]
        var blue = [0,0.275,0.678,1]
        var white = [1,1,1,1]
        var yellow = [1,0.835,0,1]
        var orange = [1,0.345,0,1]


        var edges = [
            [0.5, -0.5, -0.5],
            [0.5, 0.5, -0.5],
            [0.5, 0.5, 0.5],
            [0.5, -0.5, 0.5],
            [-0.5, 0.5, -0.5],
            [-0.5, -0.5, -0.5],
            [-0.5, -0.5, 0.5],
            [-0.5, 0.5, 0.5]
        ];

        var vertmp =[
            edges[0],white,
            edges[1],white,
            edges[2],white,
            edges[3],white,
            edges[1],red,
            edges[4],red,
            edges[7],red,
            edges[2],red,
            edges[4],yellow,
            edges[5],yellow,
            edges[6],yellow,
            edges[7],yellow,
            edges[5],orange,
            edges[0],orange,
            edges[3],orange,
            edges[6],orange,
            edges[3],blue,
            edges[2],blue,
            edges[7],blue,
            edges[6],blue,
            edges[5],green,
            edges[4],green,
            edges[1],green,
            edges[0],green
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
    return {
        bufferVertices: defineVertices(gl),
        bufferTriangles: defineTriangles(gl),
        len: len,
        posXYZ: posXYZ,
        rotAxis: rotAxis,
        angle: 0,
        setAngle: function(newAngle){
            this.angle = newAngle
        },
        getAngle: function(){
            return this.angle
        },
        draw: function (gl, aVertexPositionId, uModelMatId, aColorId) {
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
            gl.vertexAttribPointer(aVertexPositionId, 3, gl.FLOAT, false, 28, 0);
            gl.enableVertexAttribArray(aVertexPositionId);

            gl.vertexAttribPointer(aColorId , 4, gl.FLOAT , false , 28, 12);
            gl.enableVertexAttribArray(aColorId);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferTriangles);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        }
    }
}