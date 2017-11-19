import { quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class City extends Scene {
  constructor(renderer) {
    const meshes = [];

    {
      // Buildings
      const rings = 6;
      const radius = 15;
      for (let j = 0; j < rings; j += 1) {
        const count = (j + 2) * 4;
        const step = (Math.PI * 2) / count;
        for (let i = 0; i < count; i += 1) {
          const scale = vec3.fromValues(
            8 + (Math.random() * 8),
            16 + (Math.random() * 32),
            8 + (Math.random() * 8)
          );
          const angle = i * step;
          const distance = radius * (j + 2);
          const position = vec3.fromValues(
            Math.cos(angle) * distance,
            scale[1] * 0.5,
            Math.sin(angle) * distance
          );
          const rotation = quat.fromEuler(
            quat.create(),
            0, Math.random() * 360, 0
          );
          quat.invert(rotation, rotation);
          meshes.push(
            new Mesh({
              albedo: vec3.fromValues(
                0.5 + (Math.random() * 0.5),
                0.5 + (Math.random() * 0.5),
                0.5 + (Math.random() * 0.5)
              ),
              model: renderer.getModel('Cube'),
              physics: {
                extents: scale,
                mass: 0,
                shape: 'box',
              },
              position,
              rotation,
              scale,
            })
          );
        }
      }
    }

    {
      // Main platform
      const scale = vec3.fromValues(5, 0.5, 5);
      meshes.push(
        new Mesh({
          albedo: vec3.fromValues(
            0.5 + (Math.random() * 0.5),
            0.5 + (Math.random() * 0.5),
            0.5 + (Math.random() * 0.5)
          ),
          model: renderer.getModel('Cube'),
          physics: {
            collisionFilterGroup: 1,
            extents: scale,
            mass: 0,
            shape: 'box',
          },
          position: vec3.fromValues(0, scale[1] * 0.5, 0),
          scale,
        })
      );
    }

    {
      // Ground
      const scale = vec3.fromValues(256, 1, 256);
      meshes.push(
        new Mesh({
          albedo: vec3.fromValues(
            0.25 + (Math.random() * 0.5),
            0.25 + (Math.random() * 0.5),
            0.25 + (Math.random() * 0.5)
          ),
          model: renderer.getModel('Cube'),
          physics: {
            collisionFilterGroup: 1,
            extents: scale,
            mass: 0,
            shape: 'box',
          },
          position: vec3.fromValues(0, scale[1] * -0.5, 0),
          scale,
        })
      );
    }

    {
      // FPS counter
      const buffer = renderer.getTexture('Label', 512, 256);
      let acc = 1;
      let fps = -1;
      const onAnimate = (mesh, delta) => {
        fps += 1;
        acc += delta;
        if (acc >= 1) {
          buffer.update(({ ctx, height, width }) => {
            ctx.font = '120px monospace';
            ctx.strokeStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(`${fps}FPS`, width * 0.5, height * 0.2);
            ctx.strokeText('MU RICO', width * 0.5, height * 0.8);
          });
          acc -= 1;
          fps = 0;
        }
      };
      meshes.push(
        new Mesh({
          blending: true,
          model: renderer.getModel('Plane'),
          onAnimate,
          position: vec3.fromValues(0, 0.501, -1),
          rotation: quat.fromEuler(quat.create(), -90, 0, 0),
          scale: vec3.fromValues(1, 0.5, 1),
          texture: buffer.texture,
        })
      );
    }

    super({
      controllers: 'Guns',
      meshes,
      renderer,
      stagePosition: vec3.fromValues(0, 0.5, 0),
    });
  }
}

export default City;
