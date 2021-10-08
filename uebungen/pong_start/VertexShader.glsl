attribute vec2 aVertexPosition;
uniform mat3 uProjectionMat;
uniform mat3 uModelMat;

void main() {
    vec3 xyw = uProjectionMat * uModelMat * vec3(aVertexPosition, 1);
    vec2 xy = vec2(xyw.x, xyw.y);
    gl_Position = vec4(xy, 0, 1);
}