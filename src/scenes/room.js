import { quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class Room extends Scene {
  constructor(renderer) {
    const meshes = [];

    {
      // Walls
      const count = 30;
      const distance = 10;
      const step = (Math.PI * 2) / count;
      const wallScale = vec3.fromValues(2, 1.2, 1);
      for (let y = 0; y < 2; y += 1) {
        for (let i = 0; i < count; i += 1) {
          const angle = i * step;
          const position = vec3.fromValues(
            Math.cos(angle) * distance,
            y === 0 ? 0.6 : 2.6,
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
                mass: 0,
                shape: 'box',
                extents: wallScale,
              },
              position,
              rotation,
              scale: wallScale,
            })
          );
        }
      }
      // Main platform
      const platformScale = vec3.fromValues(distance * 2, 1, distance * 2);
      for (let y = 0; y < 2; y += 1) {
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
              extents: platformScale,
              shape: 'box',
            },
            position: vec3.fromValues(0, y === 0 ? -0.5 : 3.7, 0),
            scale: platformScale,
          })
        );
      }
    }

    super({
      controllers: 'Guns',
      meshes,
      renderer,
    });
  }
}

export default Room;
