import { mat4, quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class Playground extends Scene {
  constructor(renderer) {
    const meshes = [];

    {
      // Hovering cubes
      const count = 5;
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
      for (let y = 0; y < 6; y += 1) {
        for (let i = 0; i < count; i += 1) {
          const angle = i * step;
          const position = vec3.fromValues(
            Math.cos(angle) * distance,
            2 + (i / 2) + (y * 4),
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
              scale: vec3.fromValues(0.15, 0.15, 0.15),
            })
          );
        }
      }
    }

    {
      // Cubes with physics
      const count = 32;
      const scale = vec3.fromValues(0.25, 0.25, 0.25);
      for (let i = 0; i < count; i += 1) {
        const position = vec3.fromValues(
          (Math.random() * 16) - 8,
          8 + i,
          (Math.random() * 16) - 8
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
              mass: 1,
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
      let glow = 1;
      let glowInc = 1;
      const onAnimate = (mesh, delta) => {
        glow += delta * glowInc * 0.1;
        if (glow <= 0.6) {
          glow = 0.6;
          glowInc *= -1;
        }
        if (glow >= 1) {
          glow = 1;
          glowInc *= -1;
        }
        vec3.set(mesh.albedo, 0.282 * glow, 0.11 * glow, 0);
      };
      const scale = vec3.fromValues(6, 3, 6);
      meshes.push(
        new Mesh({
          albedo: vec3.fromValues(0.282, 0.11, 0),
          model: renderer.getModel('Cube'),
          onAnimate,
          physics: {
            collisionFilterGroup: 1,
            extents: scale,
            mass: 0,
            shape: 'box',
          },
          position: vec3.fromValues(0, 0, 0),
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
          collisionFilterGroup: 1,
          position: vec3.fromValues(
            -32, 0, 32
          ),
          physics: {
            mass: 0,
            heightfield: model.heightfield,
            shape: 'heightfield',
          },
          rotation: quat.fromEuler(quat.create(), -90, 0, 0),
        })
      );
    }

    super({
      meshes,
      renderer,
      stagePosition: vec3.fromValues(0, 1.5, 0),
    });
  }
}

export default Playground;
