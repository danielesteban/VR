import { mat4, quat, vec3 } from 'gl-matrix';
import Controllers from '../controllers';
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
      const animateCube = index => (mesh, delta) => {
        if (index === 0) {
          offset += delta * 0.5;
        }
        const angle = offset + (index * step);
        vec3.set(mesh.position, Math.cos(angle) * distance, 1.6, Math.sin(angle) * distance);
        quat.rotateY(mesh.rotation, mesh.rotation, delta * 1.5);
        mat4.fromRotationTranslationScale(
          mesh.view, mesh.rotation, mesh.position, mesh.scale
        );
      };
      for (let i = 0; i < count; i += 1) {
        const angle = i * step;
        const position = vec3.fromValues(
          Math.cos(angle) * distance,
          2,
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
            model: renderer.getModel('Cube'),
            onAnimate: animateCube(i),
            position,
            rotation,
            scale: vec3.fromValues(0.2, 0.2, 0.2),
          })
        );
      }
    }

    {
      // Cubes with physics
      const count = 10;
      const distance = 3;
      const step = (Math.PI * 2) / count;
      for (let y = 0; y < 3; y += 1) {
        for (let i = 0; i < count; i += 1) {
          const angle = i * step;
          const position = vec3.fromValues(
            Math.cos(angle) * distance,
            3 + y,
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
              model: renderer.getModel('Cube'),
              // onAnimate: rotate,
              physics: {
                shape: 'box',
                extents: [0.5, 0.5, 0.5],
                mass: 1.5,
              },
              position,
              rotation,
            })
          );
        }
      }
    }

    // The floor
    meshes.push(
      new Mesh({
        model: renderer.getModel('Floor'),
        scale: vec3.fromValues(32, 0, 32),
      })
    );

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

    renderer.GL.clearColor(0, 0.094, 0.282, 1);

    super.init({
      meshes,
      renderer,
    });

    Controllers(this);
  }
}

export default Playground;
