import { glMatrix, mat4, quat, vec3 } from 'gl-matrix';
import Mesh from '../mesh';
import Translocation from './translocation';

const Guns = (scene) => {
  const firing = [];
  const translocation = Translocation(scene);
  const animateController = controller => (
    (mesh, delta, controllers) => {
      if (controllers[controller]) {
        // Update controller pose
        const { buttons, pose } = controllers[controller];
        const { position, rotation } = scene.transformPose(pose);
        quat.rotateX(
          rotation,
          rotation,
          glMatrix.toRadian(-75)
        );
        vec3.copy(mesh.position, position);
        vec3.copy(mesh.rotation, rotation);
        mat4.fromRotationTranslation(mesh.view, rotation, position);
        mesh.setVisible(true);

        // Translocation
        translocation({
          button: buttons[0],
          controller,
          position,
          rotation,
        });

        // Firing
        if (buttons[1].pressed) {
          if (!firing[controller]) {
            firing[controller] = true;
            scene.onFire({ position, rotation });
          }
        } else if (firing[controller]) {
          firing[controller] = false;
        }
      } else {
        mesh.setVisible(false);
      }
    }
  );
  for (let i = 0; i < 2; i += 1) {
    scene.meshes.unshift(new Mesh({
      albedo: vec3.fromValues(0.3, 0.3, 0.3),
      model: scene.renderer.getModel('Gun'),
      onAnimate: animateController(i),
      position: vec3.fromValues(0, -1, 0),
      visible: false,
    }));
  }
};

export default Guns;
