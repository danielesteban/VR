import { mat4, quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';

const DefaultControllers = (scene, model = 'Cube') => {
  const markers = [];
  for (let i = 0; i < 2; i += 1) {
    const marker = new Mesh({
      model: scene.renderer.getModel('Marker'),
      position: vec3.create(),
      visible: false,
    });
    markers.push(marker);
    scene.meshes.unshift(marker);
  }
  const constraints = [];
  const animateController = controller => (
    (mesh, delta, controllers) => {
      if (controllers[controller]) {
        // Update controller pose
        const { buttons, pose } = controllers[controller];
        const { position, rotation } = scene.transformPose(pose);
        /* eslint-disable no-param-reassign */
        mesh.position = position;
        mesh.rotation = rotation;
        /* eslint-enable no-param-reassign */
        mesh.physics.body.quaternion.set(rotation[0], rotation[1], rotation[2], rotation[3]);
        mesh.physics.body.position.set(position[0], position[1], position[2]);
        mat4.fromRotationTranslationScale(mesh.view, rotation, position, mesh.scale);
        mesh.setVisible(true);

        // Translocation
        const marker = markers[controller];
        if (buttons[0].pressed) {
          const point = scene.physics.getClosestBody({
            collisionFilterMask: 1,
            from: position,
            to: vec3.scaleAndAdd(vec3.create(), position, vec3.transformQuat(
              vec3.create(),
              vec3.fromValues(0, 0, -1),
              rotation
            ), 32),
          });
          if (point) {
            quat.rotationTo(
              marker.rotation,
              vec3.fromValues(
                point.hitNormalWorld.x,
                point.hitNormalWorld.y,
                point.hitNormalWorld.z
              ),
              vec3.fromValues(0, 1, 0)
            );
            quat.invert(marker.rotation, marker.rotation);
            vec3.add(marker.position, vec3.fromValues(
              point.hitPointWorld.x,
              point.hitPointWorld.y,
              point.hitPointWorld.z
            ), vec3.transformQuat(
              vec3.create(),
              vec3.fromValues(0, 0.1, 0),
              marker.rotation
            ));
            mat4.fromRotationTranslation(
              marker.view,
              marker.rotation,
              marker.position
            );
            marker.setVisible(true);
          } else {
            marker.setVisible(false);
          }
        } else if (marker.isVisible) {
          scene.setStagePosition(marker.position);
          marker.setVisible(false);
        }

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
              const constraint = scene.physics.addConstraint({
                body: point.body,
                joint: mesh.physics.body,
                pivot: point === pointInFront ? [0, 0, -0.075] : [0, -0.0375, 0],
                point: point.hitPointWorld,
              });
              constraint.bodyA.angularFactor.set(0.01, 0.01, 0.01);
              constraint.bodyA.angularVelocity.set(0, 0, 0);
              constraint.bodyA.velocity.set(0, 0, 0);
              constraints[controller] = constraint;
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
      model: scene.renderer.getModel(model),
      onAnimate: animateController(i),
      physics: {
        collisionFilterGroup: 0,
        collisionFilterMask: 0,
        shape: 'box',
        extents: [0.05, 0.025, 0.1],
        mass: 0,
        type: 'kinematic',
      },
      position: vec3.fromValues(0, -1, 0),
      scale: vec3.fromValues(0.1, 0.05, 0.2),
      visible: false,
    });
    mesh.physics.body = scene.physics.addBody(mesh.physics, mesh.position, mesh.rotation);
    scene.meshes.unshift(mesh);
  }
};

export default DefaultControllers;
