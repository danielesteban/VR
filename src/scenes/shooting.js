import { quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Scene from '../scene';

class Shooting extends Scene {
  constructor(renderer) {
    const meshes = [];
    const targets = [];

    {
      // Targets
      const count = 8;
      const distance = 4;
      const step = (Math.PI * 2) / count;
      const hingeScale = vec3.fromValues(1.0, 0.1, 0.1);
      const targetScale = vec3.fromValues(1.6, 1.8, 0.4);
      for (let i = 0; i < count; i += 1) {
        const albedo = vec3.fromValues(
          0.5 + (Math.random() * 0.5),
          0.5 + (Math.random() * 0.5),
          0.5 + (Math.random() * 0.5)
        );
        const angle = i * step;
        const position = vec3.fromValues(
          Math.cos(angle) * distance,
          distance,
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
        const hinge = new Mesh({
          albedo,
          model: renderer.getModel('Cube'),
          physics: {
            shape: 'box',
            extents: hingeScale,
            mass: 0,
          },
          position,
          rotation,
          scale: hingeScale,
        });
        meshes.push(hinge);
        position[1] -= (hingeScale[1] * 0.5) + 0.2 + (targetScale[1] * 0.5);
        const target = new Mesh({
          albedo,
          model: renderer.getModel('Cube'),
          physics: {
            shape: 'box',
            extents: targetScale,
            mass: 3.0,
          },
          position,
          rotation,
          scale: targetScale,
        });
        meshes.push(target);
        targets.push({
          hinge,
          target,
        });
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
            collisionFilterGroup: 1,
            extents: scale,
            mass: 0,
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

    targets.forEach(({
      hinge,
      target,
    }) => {
      this.physics.addConstraint({
        type: 'hinge',
        bodyA: hinge.physics.body,
        pivotA: [0, (hinge.scale[1] * -0.5) - 0.1, 0],
        axisA: [1, 0, 0],
        bodyB: target.physics.body,
        pivotB: [0, (target.scale[1] * 0.5) + 0.1, 0],
        axisB: [1, 0, 0],
      });
    });
  }
}

export default Shooting;
