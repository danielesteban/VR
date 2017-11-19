precision mediump float;

@import ./fog;
@import ./lighting;

varying vec3 fragNormal;
varying vec4 fragPosition;
varying vec2 fragUV;
uniform sampler2D texture;

void main(void) {
  vec4 color = texture2D(texture, fragUV.st);
  gl_FragColor = vec4(Fog(length(fragPosition), color.rgb * lighting(fragNormal)) * color.a, color.a);
}
