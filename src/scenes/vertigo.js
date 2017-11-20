import { mat4, quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class Vertigo extends Scene {
  constructor(renderer) {
    const meshes = [];

    {
      // Walls
      const scale = vec3.fromValues(10, 32, 1);
      [
        [vec3.fromValues(0, scale[1] * 0.5, 5.5), quat.fromEuler(quat.create(), 0, 0, 0)],
        [vec3.fromValues(5.5, scale[1] * 0.5, 0), quat.fromEuler(quat.create(), 0, -90, 0)],
        [vec3.fromValues(0, scale[1] * 0.5, -5.5), quat.fromEuler(quat.create(), 0, 180, 0)],
        [vec3.fromValues(-5.5, scale[1] * 0.5, 0), quat.fromEuler(quat.create(), 0, 90, 0)],
      ].forEach(([position, rotation]) => {
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
      });
    }

    // Main platforms
    [
      [vec3.fromValues(0, -0.5, 0), vec3.fromValues(1, 1, 10), vec3.fromValues(0, 0, 0)],
      [vec3.fromValues(4.8, -0.15, 0), vec3.fromValues(5, 0.3, 10), vec3.fromValues(0.45, 0, 0)],
      [vec3.fromValues(-4.8, -0.15, 0), vec3.fromValues(5, 0.3, 10), vec3.fromValues(-0.45, 0, 0)],
    ].forEach(([position, scale, origin], i) => {
      let rotation = 0;
      let rotationStep = -1;
      const onAnimate = (mesh, delta) => {
        rotation += (3 + (Math.max(rotation, 0) / 3)) * rotationStep * delta;
        if (rotation > 100) {
          rotation = 100;
          rotationStep *= -1;
        }
        if (rotation < -10) {
          rotation = 0;
          rotationStep *= -1;
        }
        quat.fromEuler(mesh.rotation, 0, 0, Math.max(rotation, 0) * (i === 1 ? 1 : -1));
        mat4.fromRotationTranslationScaleOrigin(
          mesh.view,
          mesh.rotation,
          mesh.position,
          mesh.scale,
          origin,
        );
      };
      meshes.push(
        new Mesh({
          albedo: vec3.fromValues(
            0.5 + (Math.random() * 0.5),
            0.5 + (Math.random() * 0.5),
            0.5 + (Math.random() * 0.5)
          ),
          model: renderer.getModel('Cube'),
          onAnimate: i === 0 ? undefined : onAnimate,
          physics: {
            collisionFilterGroup: i === 0 ? 1 : undefined,
            extents: scale,
            mass: 0,
            shape: 'box',
            shapeOffset: vec3.scale(
              vec3.create(),
              origin,
              scale
            ),
          },
          position,
          scale,
        })
      );
    });

    super({
      meshes,
      renderer,
    });
  }
}

export default Vertigo;
