attribute vec3 aVertexPosition;
attribute vec2 aVertexTextureCoord;
uniform mat4 uProjectionMat;
uniform mat4 uModelMat;
uniform mat4 uCameraPosMatrix;
attribute vec4 aColor;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main() {
    gl_Position = uProjectionMat * uCameraPosMatrix * uModelMat * vec4(aVertexPosition, 1);
    vColor = aColor;
    vTextureCoord = aVertexTextureCoord;
}