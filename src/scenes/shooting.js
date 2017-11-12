import { quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class Shooting extends Scene {
  constructor(renderer) {
    const meshes = [];

    {
      // Cubes with physics
      const count = 8;
      const distance = 5;
      const step = (Math.PI * 2) / count;
      const cubeScale = vec3.fromValues(0.5, 0.5, 0.5);
      const platformScale = vec3.fromValues(1.0, 0.6, 0.5);
      for (let i = 0; i < count; i += 1) {
        const angle = i * step;
        const position = vec3.fromValues(
          Math.cos(angle) * distance,
          2,
          Math.sin(angle) * distance
        );
        const rotation = quat.rotationTo(
          quat.create(),
          vec3.fromValues(
            Math.cos(angle),
            0,
            Math.sin(angle)
          ),
          vec3.fromValues(0, 0, -1)
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
              shape: 'box',
              extents: platformScale,
              mass: 0,
            },
            position,
            rotation,
            scale: platformScale,
          })
        );
        for (let y = 0; y < 3; y += 1) {
          position[1] = 2.5502 + (y * 0.5002);
          meshes.push(
            new Mesh({
              albedo: vec3.fromValues(
                0.5 + (Math.random() * 0.5),
                0.5 + (Math.random() * 0.5),
                0.5 + (Math.random() * 0.5)
              ),
              model: renderer.getModel('Cube'),
              physics: {
                shape: 'box',
                extents: cubeScale,
                mass: 1.0,
              },
              position,
              rotation,
              scale: cubeScale,
            })
          );
        }
      }
    }

    {
      // Main platform
      const scale = vec3.fromValues(3, 0.25, 3);
      meshes.push(
        new Mesh({
          albedo: vec3.fromValues(0.3, 0, 0.1),
          model: renderer.getModel('Cube'),
          physics: {
            mass: 0,
            extents: scale,
            shape: 'box',
          },
          position: vec3.fromValues(0, 1.5, 0),
          scale,
        })
      );
    }

    super({
      controllers: 'Guns',
      meshes,
      renderer,
      stagePosition: vec3.fromValues(0, 1.75, 0),
    });
  }
}

export default Shooting;
