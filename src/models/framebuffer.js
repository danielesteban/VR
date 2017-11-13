const Framebuffer = {
  /* eslint-disable no-multi-spaces, indent */
  vertices: new Float32Array([
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0,
     1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0,
  ]),
  index: new Uint8Array([
     0,  1,  2,      2,  3,  0,
  ]),
  /* eslint-enable no-multi-spaces, indent */
  type: 'triangles',
  shader: 'postprocessing',
};

export default Framebuffer;
