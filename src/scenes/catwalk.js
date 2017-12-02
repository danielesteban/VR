import { quat, vec3 } from 'gl-matrix';
import { Noise } from 'noisejs';
import Mesh from '../mesh';
import Scene from '../scene';

class Catwalk extends Scene {
  constructor(renderer) {
    const meshes = [];

    {
      // Main platform
      const scale = vec3.fromValues(0.5, 1, 256);
      meshes.push(
        new Mesh({
          albedo: vec3.fromValues(
            0.1 + (Math.random() * 0.3),
            0.1 + (Math.random() * 0.3),
            0.1 + (Math.random() * 0.3)
          ),
          model: renderer.getModel('Cube'),
          physics: {
            collisionFilterGroup: 1,
            extents: scale,
            mass: 0,
            shape: 'box',
          },
          position: vec3.fromValues(0, -0.5, 0),
          scale,
        })
      );
    }

    {
      // Displays
      const buffer = renderer.getTexture('Label', 512, 256);
      const noise = new Noise(Math.random());
      const scale = 32;
      let z = 0;
      const onAnimate = (mesh, delta) => {
        z += delta / 4;
        buffer.update(({ ctx, height, width }) => {
          for (let x = 0; x < (width / scale); x += 1) {
            for (let y = 0; y < (height / scale); y += 1) {
              const value = Math.min(
                Math.floor(Math.abs(noise.perlin3(x / 8, y / 8, z)) * 360),
                259
              );
              ctx.fillStyle = `hsl(${value}, 80%, 60%)`;
              ctx.fillRect(x * scale, y * scale, scale, scale);
            }
          }
        });
      };
      for (let j = 0; j < 2; j += 1) {
        for (let i = 0; i < 31; i += 1) {
          meshes.push(
            new Mesh({
              blending: true,
              model: renderer.getModel('Plane'),
              onAnimate: j === 0 && i === 0 ? onAnimate : undefined,
              position: vec3.fromValues(j === 0 ? 2.5 : -2.5, 2.5, (i - 16) * 3),
              rotation: quat.fromEuler(quat.create(), 30, j === 0 ? -90 : 90, 0),
              scale: vec3.fromValues(2, 1, 1),
              texture: buffer.texture,
            })
          );
        }
      }
    }

    super({
      meshes,
      renderer,
    });
  }
}

export default Catwalk;
