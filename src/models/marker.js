const Marker = {
  /* eslint-disable no-multi-spaces, indent */
  vertices: new Float32Array([
    -0.075,  0.001,  0.10,
     0.0,    0.001,  0.25,
     0.075,  0.001,  0.10,

     0.075,  0.001, -0.10,
     0.0,    0.001, -0.25,
    -0.075,  0.001, -0.10,

    -0.10,  0.001, -0.075,
    -0.25,  0.001,  0.0,
    -0.10,  0.001,  0.075,

     0.10,  0.001,  0.075,
     0.25,  0.001,  0.0,
     0.10,  0.001, -0.075,
  ]),
  index: new Uint32Array([
     0,  1,  2,
     3,  4,  5,
     6,  7,  8,
     9, 10, 11,
  ]),
  /* eslint-enable no-multi-spaces, indent */
  type: 'triangles',
  shader: 'standard',
};

export default Marker;
