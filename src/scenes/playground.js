import { mat4, quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class Playground extends Scene {
  init(renderer) {
    const meshes = [];

    {
      // Hovering cubes
      const count = 3;
      const distance = 1.5;
      const step = (Math.PI * 2) / count;
      let offset = 0;
      const animateCube = (y, index) => (mesh, delta) => {
        if (y === 0 && index === 0) {
          offset += delta * 0.5;
        }
        const angle = offset + (index * step);
        vec3.set(
          mesh.position,
          Math.cos(angle) * distance,
          mesh.position[1],
          Math.sin(angle) * distance
        );
        quat.rotateY(mesh.rotation, mesh.rotation, delta * 1.5);
        mat4.fromRotationTranslationScale(
          mesh.view, mesh.rotation, mesh.position, mesh.scale
        );
      };
      for (let y = 0; y < 5; y += 1) {
        for (let i = 0; i < count; i += 1) {
          const angle = i * step;
          const position = vec3.fromValues(
            Math.cos(angle) * distance,
            2 + y,
            Math.sin(angle) * distance
          );
          const rotation = quat.setAxisAngle(quat.create(), vec3.fromValues(
            (Math.random() * 2) - 1,
            (Math.random() * 2) - 1,
            (Math.random() * 2) - 1
          ), Math.random() * Math.PI);
          quat.normalize(rotation, rotation);
          meshes.push(
            new Mesh({
              albedo: vec3.fromValues(
                0.5 + (Math.random() * 0.5),
                0.5 + (Math.random() * 0.5),
                0.5 + (Math.random() * 0.5)
              ),
              model: renderer.getModel('Cube'),
              onAnimate: animateCube(y, i),
              position,
              rotation,
              scale: vec3.fromValues(0.1, 0.1, 0.1),
            })
          );
        }
      }
    }

    {
      // Cubes with physics
      const count = 10;
      const distance = 8;
      const step = (Math.PI * 2) / count;
      const scale = vec3.fromValues(0.5, 0.5, 0.5);
      for (let y = 0; y < 4; y += 1) {
        for (let i = 0; i < count; i += 1) {
          const angle = i * step;
          const position = vec3.fromValues(
            Math.cos(angle) * distance,
            (distance / 2) + y,
            Math.sin(angle) * distance
          );
          const rotation = quat.setAxisAngle(quat.create(), vec3.fromValues(
            (Math.random() * 2) - 1,
            (Math.random() * 2) - 1,
            (Math.random() * 2) - 1
          ), Math.random() * Math.PI);
          quat.normalize(rotation, rotation);
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
                extents: scale,
                mass: 1.5,
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

    {
      // The ground
      const model = renderer.getModel('Ground');
      meshes.push(
        new Mesh({
          model,
          position: vec3.fromValues(
            -32, 0, 32
          ),
          physics: {
            extents: [2],
            mass: 0,
            heightfield: model.heightfield,
            shape: 'heightfield',
          },
          rotation: quat.fromEuler(quat.create(), -90, 0, 0),
        })
      );
    }

    {
      // A starfield
      const animateStarfield = direction => (mesh, delta) => {
        mat4.rotate(
          mesh.view, mesh.view,
          delta / 500,
          direction,
        );
      };
      meshes.push(
        new Mesh({
          model: renderer.getModel('Starfield'),
          onAnimate: animateStarfield(
            vec3.fromValues(Math.random() - 1, Math.random() - 1, Math.random() - 1)
          ),
        })
      );
    }

    super.init({
      meshes,
      renderer,
      stagePosition: vec3.fromValues(0, 1.75, 0),
    });
  }
}

export default Playground;
