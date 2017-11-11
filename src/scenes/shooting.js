import { vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class Shooting extends Scene {
  constructor(renderer) {
    const meshes = [];

    {
      // Cubes with physics
      const width = 6;
      const cubeScale = vec3.fromValues(0.5, 0.5, 0.5);
      const platformScale = vec3.fromValues(1.0, 0.6, 0.5);
      for (let x = 0; x < width; x += 1) {
        const position = vec3.fromValues(
          (x * 2) - width,
          2,
          -5,
        );
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
      meshes,
      renderer,
      stagePosition: vec3.fromValues(0, 1.75, 0),
    });
  }
}

export default Shooting;
