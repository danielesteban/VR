const Floor = {
  /* eslint-disable no-multi-spaces, indent */
  vertices: new Float32Array([
    -0.5,  0.0,  0.5,
     0.5,  0.0,  0.5,
     0.5,  0.0, -0.5,
    -0.5,  0.0, -0.5,
  ]),
  index: new Uint32Array([
    0, 1, 2,      2, 3, 0,
  ]),
  /* eslint-enable no-multi-spaces, indent */
  type: 'triangles',
  shader: 'floor',
};

export default Floor;
