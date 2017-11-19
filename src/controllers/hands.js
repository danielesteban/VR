import { mat4, vec3, quat } from 'gl-matrix';
import Mesh from '../mesh';
import Translocation from './translocation';

const Hands = (scene) => {
  const constraints = [];
  const translocation = Translocation(scene);
  const animateController = controller => (
    (mesh, delta, controllers) => {
      if (controllers[controller]) {
        // Update controller pose
        const { buttons, pose } = controllers[controller];
        const { position, rotation } = scene.transformPose(pose);
        vec3.copy(mesh.position, position);
        vec3.copy(mesh.rotation, rotation);
        mesh.physics.body.quaternion.set(rotation[0], rotation[1], rotation[2], rotation[3]);
        mesh.physics.body.position.set(position[0], position[1], position[2]);
        mat4.fromRotationTranslationScale(mesh.view, rotation, position, mesh.scale);
        mesh.setVisible(true);

        // Translocation
        translocation({
          button: buttons[0],
          controller,
          position,
          rotation,
        });

        // Picking objects
        const picking = constraints[controller];
        if (buttons[1].pressed) {
          if (picking) {
            picking.update();
          } else {
            const distance = 0.15;
            const pointInFront = scene.physics.getClosestBody({
              from: position,
              to: vec3.scaleAndAdd(vec3.create(), position, vec3.transformQuat(
                vec3.create(),
                vec3.fromValues(0, 0, -1),
                rotation
              ), distance),
            });
            const pointInPalm = scene.physics.getClosestBody({
              from: position,
              to: vec3.scaleAndAdd(vec3.create(), position, vec3.transformQuat(
                vec3.create(),
                vec3.fromValues(0, -1, 0),
                rotation
              ), distance),
            });
            let point;
            if (pointInFront && pointInPalm) {
              point = pointInFront.distance < pointInPalm.distance ? pointInFront : pointInPalm;
            } else if (pointInFront) {
              point = pointInFront;
            } else if (pointInPalm) {
              point = pointInPalm;
            }
            if (point) {
              const r = quat.fromValues(
                point.body.quaternion.x,
                point.body.quaternion.y,
                point.body.quaternion.z,
                point.body.quaternion.w
              );
              quat.invert(r, r);
              const pivot = vec3.fromValues(
                point.hitPointWorld.x,
                point.hitPointWorld.y,
                point.hitPointWorld.z
              );
              vec3.sub(pivot, pivot, vec3.fromValues(
                point.body.position.x,
                point.body.position.y,
                point.body.position.z
              ));
              vec3.transformQuat(pivot, pivot, r);
              constraints[controller] = scene.physics.addConstraint({
                type: 'point',
                bodyA: point.body,
                pivotA: pivot,
                bodyB: mesh.physics.body,
                pivotB: point === pointInFront ? [0, 0, -0.075] : [0, -0.0375, 0],
              });
              point.body.angularFactor.set(0.01, 0.01, 0.01);
              point.body.angularVelocity.set(0, 0, 0);
              point.body.velocity.set(0, 0, 0);
            }
          }
        } else if (picking) {
          const count = constraints.reduce((count, constraint) => (
            constraint.bodyA === picking.bodyA ? count + 1 : count
          ), 0);
          if (count <= 1) {
            picking.bodyA.angularFactor.set(1, 1, 1);
          }
          picking.bodyA.wakeUp();
          scene.physics.removeConstraint(picking);
          constraints[controller] = false;
        }
      } else {
        mesh.setVisible(false);
      }
    }
  );
  for (let i = 0; i < 2; i += 1) {
    const mesh = new Mesh({
      albedo: vec3.fromValues(0.3, 0.3, 0.3),
      model: scene.renderer.getModel('Cube'),
      onAnimate: animateController(i),
      physics: {
        collisionFilterGroup: 0,
        collisionFilterMask: 0,
        shape: 'box',
        extents: [0, 0, 0],
        mass: 0,
      },
      position: vec3.fromValues(0, -1, 0),
      scale: vec3.fromValues(0.05, 0.025, 0.1),
      visible: false,
    });
    scene.physics.addBody(mesh);
    scene.meshes.unshift(mesh);
  }
};

export default Hands;
