import classNames from 'classnames/bind';
import { glMatrix, mat4, vec2, vec3 } from 'gl-matrix';
import requestAnimationFrame from 'raf';
import Framebuffer from './framebuffer';
import Model from './model';
import * as Scenes from './scenes';
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

    const hints = { alpha: false, antialias: false, preserveDrawingBuffer: false };
    const GL = canvas.getContext('webgl', hints) || canvas.getContext('experimental-webgl', hints);
    GL.clearColor(0, 0.094, 0.282, 1);
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

    this.setScene(Object.keys(Scenes)[0]);

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
  nextScene() {
    const scenes = Object.keys(Scenes);
    this.setScene(scenes[(this.sceneIndex + 1) % scenes.length]);
  }
  onAnimationFrame(ticks) {
    const {
      camera,
      canvas,
      display,
      eyeView,
      framebuffer,
      GL,
      frameData,
      lastTicks,
      scene,
    } = this;
    const currentTicks = window.performance ? window.performance.now() : ticks;
    const delta = (currentTicks - (lastTicks || currentTicks)) / 1000;
    this.lastTicks = currentTicks;

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

    if (
      controllers[0] &&
      controllers[0].buttons[3] &&
      controllers[0].buttons[3].pressed
    ) {
      if (!this.settingScene) {
        this.settingScene = true;
        this.nextScene();
      }
    } else if (this.settingScene) {
      this.settingScene = false;
    }

    scene.animate(delta, controllers);
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.framebuffer.buffer);
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
      } else {
        GL.viewport(0, 0, canvas.width, canvas.height);
        mat4.multiply(eyeView, frameData.leftViewMatrix, camera.view);
        scene.render(camera.projection, eyeView);
      }
      if (frameData.pose.orientation && frameData.pose.position) {
        scene.setDisplay(frameData.pose);
      }
    } else {
      requestAnimationFrame(this.onAnimationFrame);
      GL.viewport(0, 0, canvas.width, canvas.height);
      scene.render(camera.projection, camera.view);
    }
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    GL.disable(GL.DEPTH_TEST);
    GL.viewport(0, 0, canvas.width, canvas.height);
    this.getModel('Framebuffer').render({
      size: vec2.fromValues(canvas.width, canvas.height),
      texture: framebuffer.texture,
    });
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.enable(GL.DEPTH_TEST);
    if (display && display.isPresenting) {
      display.submitFrame();
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
    const {
      camera: { view },
      canvas,
      display,
      framebuffer,
    } = this;
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
    if (framebuffer) framebuffer.destroy();
    this.framebuffer = new Framebuffer(this);
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
    this.scene = new Scenes[scene](this);
    this.sceneIndex = Object.keys(Scenes).indexOf(scene);
  }
}

export default Renderer;
