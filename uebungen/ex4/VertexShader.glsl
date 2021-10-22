attribute vec3 aVertexPosition;
uniform mat4 uProjectionMat;
uniform mat4 uModelMat;
uniform mat4 uCameraPosMatrix;

void main() {
    gl_Position = uProjectionMat * uCameraPosMatrix * uModelMat * vec4(aVertexPosition, 1);
}