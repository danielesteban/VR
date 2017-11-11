import { vec3 } from 'gl-matrix';

const Ground = (() => {
  const width = 64;
  const length = 64;

  const numVertsX = Math.ceil(width) + 1;
  const numVertsY = Math.ceil(length) + 1;
  const totalVerts = numVertsX * numVertsY;
  const totalTriangles = 2 * (numVertsX - 1) * (numVertsY - 1);

  const vertices = new Float32Array(totalVerts * 6);
  const heightfield = [];
  const index = new Uint32Array(totalTriangles * 3);

  const center = {
    x: width / 2,
    y: length / 2,
  };
  const summit = ((width + length) / 2) * 0.15;
  for (let j = 0; j < numVertsY; j += 1) {
    for (let i = 0; i < numVertsX; i += 1) {
      const x = i;
      const y = j;
      const height = Math.sqrt(
        ((center.x - x) ** 2) + ((center.y - y) ** 2)
      ) * 0.4;
      const noise = (Math.random() - 0.5) * 0.5;
      const z = (height >= summit ? (summit * 2) - height : height) + noise;
      const vertex = (i + (j * numVertsX)) * 6;
      vertices[vertex] = x;
      vertices[vertex + 1] = y;
      vertices[vertex + 2] = z;
      if (!heightfield[i]) heightfield[i] = [];
      heightfield[i][j] = z;
    }
  }

  let offset = 0;
  const normals = [];
  for (let i = 0; i < numVertsX - 1; i += 1) {
    for (let j = 0; j < numVertsY - 1; j += 1) {
      const p1 = (j * numVertsX) + i;
      let p2 = (j * numVertsX) + i + 1;
      let p3 = ((j + 1) * numVertsX) + i + 1;
      for (let t = 0; t < 2; t += 1) {
        index.set([
          p1, p2, p3,
        ], offset);
        offset += 3;

        const vertex = [p1, p2, p3].map((p) => {
          const v = p * 6;
          return vec3.fromValues(vertices[v], vertices[v + 1], vertices[v + 2]);
        });
        const u = vec3.create();
        vec3.subtract(u, vertex[1], vertex[0]);
        const v = vec3.create();
        vec3.subtract(v, vertex[2], vertex[0]);
        const normal = vec3.create();
        vec3.cross(normal, u, v);
        if (!normals[p1]) normals[p1] = [];
        normals[p1].push(normal);
        if (!normals[p2]) normals[p2] = [];
        normals[p2].push(normal);
        if (!normals[p3]) normals[p3] = [];
        normals[p3].push(normal);

        p2 = p3;
        p3 = ((j + 1) * numVertsX) + i;
      }
    }
  }

  for (let i = 0; i < totalVerts; i += 1) {
    const sum = vec3.create();
    normals[i].forEach(normal => (
      vec3.add(sum, sum, normal)
    ));
    vec3.scale(sum, sum, 1 / normals[i].length);
    vec3.normalize(sum, sum);
    const [x, y, z] = sum;
    const vertex = i * 6;
    vertices[vertex + 3] = x;
    vertices[vertex + 4] = y;
    vertices[vertex + 5] = z;
  }

  return {
    heightfield,
    index,
    shader: 'ground',
    type: 'triangles',
    vertices,
  };
})();

export default Ground;
