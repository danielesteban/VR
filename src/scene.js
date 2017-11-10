import { mat3, mat4, quat, vec3 } from 'gl-matrix';
import * as Controllers from './controllers';
import Mesh from './mesh';
import Physics from './physics';

class Scene {
  init({
    controllers,
    meshes,
    renderer,
    stagePosition,
  }) {
    this.auxView = mat4.create();
    this.display = {
      position: vec3.create(),
      rotation: quat.create(),
    };
    this.meshes = meshes;
    this.physics = new Physics();
    this.stage = {
      position: stagePosition || vec3.create(),
      view: mat4.create(),
    };
    this.setStagePosition(this.stage.position);
    this.renderer = renderer;
    this.spheres = [];
    this.meshes.forEach((mesh) => {
      if (mesh.physics) {
        this.physics.addBody(mesh);
      }
    });
    Controllers[controllers || 'default'](this);
  }
  animate(delta, controllers) {
    const { meshes, physics } = this;
    physics.step(delta);
    meshes.forEach(mesh => (
      mesh.animate(delta, controllers)
    ));
  }
  onFire({
    position,
    rotation,
  }) {
    const {
      meshes,
      physics,
      renderer,
      spheres,
    } = this;
    if (spheres.length >= 16) {
      const sphere = spheres.shift();
      physics.removeBody(sphere.physics.body);
      meshes.splice(meshes.findIndex(m => (m === sphere)), 1);
    }
    const scale = vec3.fromValues(0.3, 0.3, 0.3);
    const mesh = new Mesh({
      albedo: vec3.fromValues(
        0.5 + (Math.random() * 0.5),
        0.5 + (Math.random() * 0.5),
        0.5 + (Math.random() * 0.5)
      ),
      model: renderer.getModel('Sphere'),
      position: vec3.add(
        vec3.create(),
        position,
        vec3.transformQuat(
          vec3.create(),
          vec3.fromValues(0, 0, -0.3),
          rotation
        )
      ),
      physics: {
        extents: [scale[0] / 2],
        mass: 3,
        shape: 'sphere',
      },
      scale,
    });
    physics.addBody(mesh);
    Physics.applyImpulse(mesh.physics.body, vec3.transformQuat(
      vec3.create(),
      vec3.fromValues(
        0, 0, -10
      ),
      rotation
    ));
    spheres.push(mesh);
    meshes.push(mesh);
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
