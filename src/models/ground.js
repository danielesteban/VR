const Ground = (() => {
  const width = 64;
  const length = 64;
  const stride = 2;

  const numVertsX = Math.ceil(width / stride) + 1;
  const numVertsY = Math.ceil(length / stride) + 1;
  const totalVerts = numVertsX * numVertsY;
  const totalTriangles = 2 * (numVertsX - 1) * (numVertsY - 1);

  const vertices = new Float32Array(totalVerts * 3);
  const heightfield = [];
  const index = new Uint32Array(totalTriangles * 3);

  const center = {
    x: width / 2,
    y: length / 2,
  };
  const summit = ((width + length) / 2) * 0.15;
  for (let i = 0; i < numVertsX; i += 1) {
    heightfield[i] = [];
    for (let j = 0; j < numVertsY; j += 1) {
      const x = i * stride;
      const y = j * stride;
      const height = Math.sqrt(
        ((center.x - x) ** 2) + ((center.y - y) ** 2)
      ) * 0.3;
      const noise = (Math.random() - 0.5) * 0.3;
      const z = (height >= summit ? (summit * 2) - height : height) + noise;
      heightfield[i][j] = z;
      const vertex = (i + (j * numVertsX)) * 3;
      vertices[vertex] = x;
      vertices[vertex + 1] = y;
      vertices[vertex + 2] = z;
    }
  }

  let offset = 0;
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
        p2 = p3;
        p3 = ((j + 1) * numVertsX) + i;
      }
    }
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
