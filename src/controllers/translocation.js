import { mat4, quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';

const Translocation = (scene) => {
  const markers = [];
  for (let i = 0; i < 2; i += 1) {
    const marker = new Mesh({
      albedo: vec3.fromValues(0, 0.094, 0.282),
      model: scene.renderer.getModel('Marker'),
      position: vec3.create(),
      visible: false,
    });
    markers.push(marker);
    scene.meshes.unshift(marker);
  }
  return ({
    button,
    controller,
    position,
    rotation,
  }) => {
    const marker = markers[controller];
    if (button.pressed) {
      const point = scene.physics.getClosestBody({
        collisionFilterMask: 1,
        from: position,
        to: vec3.scaleAndAdd(vec3.create(), position, vec3.transformQuat(
          vec3.create(),
          vec3.fromValues(0, 0, -1),
          rotation
        ), 8),
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
      setImmediate(() => scene.setStagePosition(marker.position));
      marker.setVisible(false);
    }
  };
};

export default Translocation;
