import { quat, vec2, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class City extends Scene {
  constructor(renderer) {
    const meshes = [];

    {
      // Buildings
      const count = 64;
      for (let i = 0; i < count; i += 1) {
        const scale = vec3.fromValues(
          10 + (Math.random() * 5),
          20 + (Math.random() * 64),
          10 + (Math.random() * 5)
        );
        const vector = vec2.fromValues(
          (Math.random() * 2) - 1,
          (Math.random() * 2) - 1,
        );
        vec2.scale(vector, vector, 10 + Math.max(scale[0], scale[1]) + (Math.random() * 16));
        const position = vec3.fromValues(
          vector[0],
          scale[0] * 0.5,
          vector[1]
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
              mass: 0,
              shape: 'box',
              extents: scale,
            },
            position,
            rotation,
            scale,
          })
        );
      }
    }

    {
      // Main platform
      const scale = vec3.fromValues(10, 15, 10);
      meshes.push(
        new Mesh({
          albedo: vec3.fromValues(
            0.5 + (Math.random() * 0.5),
            0.5 + (Math.random() * 0.5),
            0.5 + (Math.random() * 0.5)
          ),
          model: renderer.getModel('Cube'),
          physics: {
            mass: 0,
            extents: scale,
            shape: 'box',
          },
          position: vec3.fromValues(0, scale[1] * 0.5, 0),
          scale,
        })
      );
    }

    {
      // Ground
      const scale = vec3.fromValues(64, 1, 64);
      meshes.push(
        new Mesh({
          albedo: vec3.fromValues(
            0.5 + (Math.random() * 0.5),
            0.5 + (Math.random() * 0.5),
            0.5 + (Math.random() * 0.5)
          ),
          model: renderer.getModel('Cube'),
          physics: {
            mass: 0,
            extents: scale,
            shape: 'box',
          },
          position: vec3.fromValues(0, scale[1] * -0.5, 0),
          scale,
        })
      );
    }

    {
      // FPS counter
      const buffer = renderer.getTexture('FPS', 512, 256);
      let acc = 0;
      let fps = 0;
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
          position: vec3.fromValues(0, 15.001, -1),
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
      stagePosition: vec3.fromValues(0, 15, 0),
    });
  }
}

export default City;
