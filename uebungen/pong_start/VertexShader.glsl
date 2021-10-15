attribute vec2 aVertexPosition;
uniform mat3 uProjectionMat;
uniform mat3 uModelMat;

void main() {
    vec3 posXYW = uProjectionMat * uModelMat * vec3(aVertexPosition, 1);
    gl_Position = vec4(posXYW.xy / posXYW.z, 0, 1);
}