import classNames from 'classnames/bind';
import { glMatrix, mat4, vec3 } from 'gl-matrix';
import requestAnimationFrame from 'raf';
import Model from './model';
import Shader from './shader';
import styles from './styles/renderer';

const cx = classNames.bind(styles);

class Renderer {
  constructor({
    message,
    mount,
  }) {
    const canvas = document.createElement('canvas');
    canvas.className = cx('canvas');
    canvas.addEventListener('click', this.requestPresent.bind(this), false);
    mount.appendChild(canvas);

    const GL = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    GL.clearColor(0, 0, 0, 1);
    GL.enable(GL.DEPTH_TEST);
    GL.enable(GL.CULL_FACE);
    GL.cullFace(GL.BACK);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    GL.blendEquation(GL.FUNC_ADD);
    GL.extensions = {
      EIU: GL.getExtension('OES_element_index_uint'),
      IA: GL.getExtension('ANGLE_instanced_arrays'),
      SD: GL.getExtension('OES_standard_derivatives'),
      VAO: GL.getExtension('OES_vertex_array_object'),
    };

    this.eyeView = mat4.create();
    this.camera = {
      projection: mat4.create(),
      view: mat4.identity(mat4.create()),
    };
    this.canvas = canvas;
    this.GL = GL;
    this.message = message;
    this.models = {};
    this.shaders = {};

    window.addEventListener('keydown', ({ repeat }) => {
      if (!repeat) this.requestPresent();
    }, false);
    window.addEventListener('resize', this.onResize.bind(this), false);
    window.addEventListener('vrdisplaypresentchange', this.onPresentChange.bind(this), false);
    this.onPresentChange();

    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    requestAnimationFrame(this.onAnimationFrame);
  }
  getModel(id) {
    const { models } = this;
    if (!models[id]) models[id] = new Model(this, id);
    return models[id];
  }
  getShader(vertex, fragment = vertex) {
    const { shaders } = this;
    const id = `${vertex}:${fragment}`;
    if (!shaders[id]) shaders[id] = new Shader(this, fragment, vertex);
    return shaders[id];
  }
  onAnimationFrame(ticks) {
    const {
      camera,
      canvas,
      display,
      eyeView,
      GL,
      frameData,
      lastTicks,
      scene,
    } = this;
    const currentTicks = window.performance ? window.performance.now() : ticks;
    const delta = (currentTicks - (lastTicks || currentTicks)) / 1000;
    this.lastTicks = currentTicks;
    if (!scene) {
      requestAnimationFrame(this.onAnimationFrame);
      return;
    }
    const controllers = [];
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i += 1) {
        const gamepad = gamepads[i];
        if (gamepad && gamepad.pose) {
          controllers.push({
            buttons: gamepad.buttons,
            pose: gamepad.pose,
          });
        }
      }
    }
    scene.animate(delta, controllers);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    if (display) {
      display.requestAnimationFrame(this.onAnimationFrame);
      display.getFrameData(frameData);
      if (display.isPresenting) {
        GL.viewport(0, 0, canvas.width * 0.5, canvas.height);
        mat4.multiply(eyeView, frameData.leftViewMatrix, camera.view);
        scene.render(frameData.leftProjectionMatrix, eyeView);
        GL.viewport(canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height);
        mat4.multiply(eyeView, frameData.rightViewMatrix, camera.view);
        scene.render(frameData.rightProjectionMatrix, eyeView);
        display.submitFrame();
      } else {
        GL.viewport(0, 0, canvas.width, canvas.height);
        mat4.multiply(eyeView, frameData.leftViewMatrix, camera.view);
        scene.render(camera.projection, eyeView);
      }
      scene.setDisplay(frameData.pose);
    } else {
      requestAnimationFrame(this.onAnimationFrame);
      GL.viewport(0, 0, canvas.width, canvas.height);
      scene.render(camera.projection, camera.view);
    }
  }
  onPresentChange() {
    const { display, message } = this;
    if (display && display.isPresenting) {
      message.update(
        'You can put on your HMD'
      );
    } else {
      message.update(
        'Click anywhere (or press any key) to start presenting to your HMD'
      );
    }
    this.onResize();
  }
  onResize() {
    const { camera: { view }, canvas, display } = this;
    if (display && display.isPresenting) {
      const leftEye = display.getEyeParameters('left');
      const rightEye = display.getEyeParameters('right');
      canvas.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
      canvas.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
    } else {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      mat4.perspective(
        this.camera.projection,
        glMatrix.toRadian(60),
        canvas.width / canvas.height,
        0.1, 1024.0
      );
    }
    if (display && display.stageParameters) {
      mat4.invert(view, display.stageParameters.sittingToStandingTransform);
    } else {
      mat4.identity(view);
      mat4.translate(view, view, vec3.fromValues(0, 1.62, 0));
      mat4.invert(view, view);
    }
  }
  requestPresent() {
    if (!this.display || this.display.isPresenting) return;
    const { canvas, display, message } = this;
    display.requestPresent([{ source: canvas }]).then(() => {}, () => (
      message.update(
        'Failed to request VRDisplay presentation.'
      )
    ));
  }
  setDisplay(display) {
    /* eslint-disable no-param-reassign */
    display.depthNear = 0.1;
    display.depthFar = 1024.0;
    /* eslint-enable no-param-reassign */
    this.display = display;
    this.frameData = new window.VRFrameData();
  }
  setScene(scene) {
    scene.init(this);
    this.scene = scene;
  }
}

export default Renderer;
