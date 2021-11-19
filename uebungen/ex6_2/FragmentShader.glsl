precision mediump float;

uniform bool uEnableTexture;
uniform bool uEnableLighting;

uniform vec3 uLightPosition;
uniform vec3 uLightColor;

varying vec3 vNormalEye;
varying vec3 vVertexPositionEye3;

varying vec3 vColor;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;


const float ambientFactor = 0.8;
const float shininess = 60.0;
const vec3 specularMaterialColor = vec3(0.7, 0.3, 0.4);

void main() {
    vec3 baseColor = vColor;
    if (uEnableTexture) {
        baseColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)).rgb;
    }

    if (uEnableLighting) {
        // calculate light direction as seen from the vertex position
        vec3 lightDirectionEye = normalize(uLightPosition - vVertexPositionEye3);
        vec3 normal = normalize(vNormalEye);

        // ambient lighting
        vec3 ambientColor = ambientFactor * baseColor.rgb;

        // diffuse lighting
        float diffuseFactor = 0.7;
        vec3 diffuseColor = diffuseFactor * baseColor.rgb * clamp(dot(lightDirectionEye, normal),0.0,1.0) * uLightColor;

        // specular lighting
        vec3 specularColor = vec3(0, 0, 0);
        if (diffuseFactor > 0.0) {
            vec3 reflectionDir = normal.xyz*2.0*clamp(dot(lightDirectionEye, normal),0.0,1.0) - lightDirectionEye;
            vec3 eyeDir = normalize(vVertexPositionEye3);
            float cosPhi = dot(reflectionDir, eyeDir);
            float specularFactor = pow(cosPhi, shininess);
            specularColor = baseColor.rgb * specularFactor * diffuseFactor;
        }

        vec3 color = ambientColor + diffuseColor + specularColor;
        gl_FragColor = vec4(color, 1.0);
    }
    else {
        gl_FragColor = vec4(baseColor, 1.0);
    }
}