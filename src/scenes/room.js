import { quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class Room extends Scene {
  constructor(renderer) {
    const meshes = [];

    const distance = 10;
    {
      // Walls
      const count = 30;
      const step = (Math.PI * 2) / count;
      const scale = vec3.fromValues(2, 1.2, 1);
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
                extents: scale,
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
      const scale = vec3.fromValues(distance * 2, 1, distance * 2);
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
              extents: scale,
              shape: 'box',
            },
            position: vec3.fromValues(0, y === 0 ? -0.5 : 3.7, 0),
            scale,
          })
        );
      }
    }

    {
      // Clock
      const buffer = renderer.getTexture('Label', 512, 256);
      let lastClock;
      const onAnimate = () => {
        let clock = new Date();
        clock = `${clock.getHours() < 10 ? '0' : ''}${clock.getHours()}:` +
                `${clock.getMinutes() < 10 ? '0' : ''}${clock.getMinutes()}`;
        if (clock !== lastClock) {
          buffer.update(({ ctx, height, width }) => {
            ctx.fillStyle = 'rgba(0, 0, 0, .5)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#fff';
            ctx.font = '150px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${clock}`, width * 0.5, height * 0.5);
          });
          lastClock = clock;
        }
      };
      meshes.push(
        new Mesh({
          blending: true,
          model: renderer.getModel('Plane'),
          onAnimate,
          position: vec3.fromValues(0, 2.6, -distance + 0.6),
          scale: vec3.fromValues(2, 1, 1),
          texture: buffer.texture,
        })
      );
    }

    super({
      meshes,
      renderer,
    });
  }
}

export default Room;
