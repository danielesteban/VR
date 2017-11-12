import Github from './github';
import Message from './message';
import Renderer from './renderer';
import './styles/root';

const initVR = () => {
  const noSupport = 'Your browser does not support WebVR. See webvr.info for assistance.';
  const noDisplay = 'Couldn\'t find any VRDisplay.';
  return new Promise((resolve, reject) => {
    if (!navigator.getVRDisplays) {
      return reject(
        new Error(noSupport)
      );
    }
    return navigator.getVRDisplays().then((displays) => {
      if (displays.length === 0) {
        return reject(
          new Error(noDisplay)
        );
      }
      const vrDisplay = displays[displays.length - 1];
      if (!vrDisplay.capabilities.canPresent) {
        return reject(
          new Error(noDisplay)
        );
      }
      return resolve(vrDisplay);
    }, () => (
      reject(
        new Error(noSupport)
      )
    ));
  });
};

const mount = document.getElementById('mount');
const message = new Message(mount);
const renderer = new Renderer({ message, mount });
Github(mount);
initVR().then(
  display => renderer.setDisplay(display),
  err => message.update(err.message)
);
