import { mat3, mat4, quat, vec3 } from 'gl-matrix';
import Physics from './physics';

class Scene {
  init({
    meshes,
    renderer,
  }) {
    this.auxView = mat4.create();
    this.display = {
      position: vec3.create(),
      rotation: quat.create(),
    };
    this.meshes = meshes;
    this.physics = new Physics();
    this.stage = {
      position: vec3.create(),
      view: mat4.create(),
    };
    this.setStagePosition(vec3.fromValues(0, 0, 0));
    this.renderer = renderer;
    this.meshes.forEach((mesh) => {
      if (mesh.physics) {
        // eslint-disable-next-line no-param-reassign
        mesh.physics.body = this.physics.addBody(mesh.physics, mesh.position, mesh.rotation);
      }
    });
  }
  animate(delta, controllers) {
    const { meshes, physics } = this;
    physics.step(delta);
    meshes.forEach(mesh => (
      mesh.animate(delta, controllers)
    ));
  }
  render(projection, view) {
    const { auxView, stage: { view: stageView } } = this;
    mat4.multiply(auxView, view, stageView);
    this.meshes.forEach(mesh => (
      mesh.render(projection, auxView)
    ));
  }
  setDisplay(pose) {
    const { display } = this;
    const { position, rotation } = this.transformPose(pose);
    vec3.copy(display.position, position);
    vec3.copy(display.rotation, rotation);
  }
  setStagePosition(position) {
    const { display, stage } = this;
    vec3.add(stage.position, stage.position, vec3.fromValues(
      position[0] - display.position[0],
      position[1] - stage.position[1],
      position[2] - display.position[2]
    ));
    mat4.fromTranslation(stage.view, stage.position);
    mat4.invert(stage.view, stage.view);
  }
  transformPose(pose) {
    const { auxView, stage: { view }, renderer: { display } } = this;
    const { orientation, position } = pose;
    const out = {
      position: vec3.create(),
      rotation: quat.create(),
    };
    if (display && display.stageParameters) {
      vec3.transformMat4(
        out.position,
        position,
        display.stageParameters.sittingToStandingTransform
      );
      quat.fromMat3(
        out.rotation,
        mat3.fromMat4(mat3.create(), display.stageParameters.sittingToStandingTransform)
      );
      quat.normalize(out.rotation, out.rotation);
      quat.multiply(out.rotation, out.rotation, orientation);
    } else {
      vec3.add(out.position, position, vec3.fromValues(0, 1.62, 0));
      quat.copy(out.rotation, orientation);
    }
    vec3.transformMat4(
      out.position,
      out.position,
      mat4.invert(auxView, view)
    );
    return out;
  }
}

export default Scene;
