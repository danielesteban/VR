import Message from './message';
import Renderer from './renderer';
import { Playground } from './scenes';
import './styles/root';

const initVR = () => (
  new Promise((resolve, reject) => {
    if (!navigator.getVRDisplays) {
      return reject(
        new Error('Your browser does not support WebVR. See webvr.info for assistance.')
      );
    }
    return navigator.getVRDisplays().then((displays) => {
      if (displays.length === 0) {
        return reject(
          new Error('WebVR supported, but no VRDisplays found.')
        );
      }
      const vrDisplay = displays[displays.length - 1];
      if (!vrDisplay.capabilities.canPresent) {
        return reject(
          new Error('WebVR supported, but no compatible VRDisplays found.')
        );
      }
      return resolve(vrDisplay);
    }, () => (
      reject(
        new Error('Your browser does not support WebVR. See webvr.info for assistance.')
      )
    ));
  })
);

const mount = document.getElementById('mount');
const message = new Message(mount);
const renderer = new Renderer({ message, mount });
renderer.setScene(new Playground());
initVR().then(
  display => renderer.setDisplay(display),
  err => message.update(err.message)
);
