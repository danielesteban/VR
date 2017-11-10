import { mat4, quat, vec3 } from 'gl-matrix';

class Mesh {
  constructor({
    albedo,
    model,
    onAnimate,
    physics,
    position,
    rotation,
    scale,
    visible,
  }) {
    this.albedo = albedo;
    this.auxView = mat4.create();
    this.isVisible = visible !== undefined ? visible : true;
    this.model = model;
    this.onAnimate = onAnimate;
    this.physics = physics;
    this.position = position || vec3.create();
    this.rotation = rotation || quat.create();
    if (scale) {
      this.scale = scale;
      this.view = mat4.fromRotationTranslationScale(
        mat4.create(),
        this.rotation,
        this.position,
        scale
      );
    } else {
      this.view = mat4.fromRotationTranslation(
        mat4.create(),
        this.rotation,
        this.position
      );
    }
  }
  animate(delta, controllers) {
    const { physics, onAnimate, scale } = this;
    if (physics && physics.body && physics.body.type === 1 && physics.body.sleepState === 0) {
      const { position, quaternion } = physics.body;
      this.position = position.toArray();
      this.rotation = quaternion.toArray();
      if (scale) {
        this.view = mat4.fromRotationTranslationScale(
          this.view,
          this.rotation,
          this.position,
          scale
        );
      } else {
        this.view = mat4.fromRotationTranslation(
          this.view,
          this.rotation,
          this.position
        );
      }
    }
    if (onAnimate) {
      onAnimate(this, delta, controllers);
    }
  }
  render(projection, view) {
    const {
      albedo,
      auxView,
      isVisible,
      model,
      view: meshView,
    } = this;
    if (!isVisible) return;
    mat4.multiply(auxView, view, meshView);
    model.render({
      albedo,
      projection,
      view: auxView,
    });
  }
  setVisible(isVisible) {
    this.isVisible = isVisible;
  }
}

export default Mesh;
