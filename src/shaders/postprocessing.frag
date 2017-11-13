precision mediump float;

varying vec2 fragUV;
uniform sampler2D texture;
uniform vec2 size;

const vec3 edgeColor = vec3(0.9);

void make_kernel(inout vec4 n[9], sampler2D tex, vec2 coord) {
	float w = 1.0 / size.x;
	float h = 1.0 / size.y;

	n[0] = texture2D(tex, coord + vec2( -w, -h));
	n[1] = texture2D(tex, coord + vec2(0.0, -h));
	n[2] = texture2D(tex, coord + vec2(  w, -h));
	n[3] = texture2D(tex, coord + vec2( -w, 0.0));
	n[4] = texture2D(tex, coord);
	n[5] = texture2D(tex, coord + vec2(  w, 0.0));
	n[6] = texture2D(tex, coord + vec2( -w, h));
	n[7] = texture2D(tex, coord + vec2(0.0, h));
	n[8] = texture2D(tex, coord + vec2(  w, h));
}

void main(void) {
  vec4 n[9];
	make_kernel( n, texture, fragUV.st );
  vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
  vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
  vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
  float edge = (sobel.r + sobel.g + sobel.b) / 3.0;
  vec3 color = texture2D(texture, fragUV.st).rgb;
  gl_FragColor = vec4(mix(color, edgeColor, edge), 1.0);
}
