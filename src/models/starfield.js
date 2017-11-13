import { vec3 } from 'gl-matrix';

const Starfield = {
  vertices: (() => {
    const count = 8192;
    const radius = 1024;
    const vertices = new Float32Array(count * 5);
    for (let i = 0; i < count; i += 1) {
      const pos = vec3.fromValues(
        (Math.random() * 2) - 1,
        (Math.random() * 2) - 1,
        (Math.random() * 2) - 1
      );
      vec3.scale(pos, pos, radius * (0.75 + (Math.random() * 0.25)));
      const vertex = i * 4;
      const [x, y, z] = pos;
      const alpha = 0.1 + (Math.random() * 0.3);
      vertices[vertex] = x;
      vertices[vertex + 1] = y;
      vertices[vertex + 2] = z;
      vertices[vertex + 3] = alpha;
    }
    return vertices;
  })(),
  type: 'points',
  shader: 'starfield',
};

export default Starfield;
