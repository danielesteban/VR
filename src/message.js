import classNames from 'classnames/bind';
import styles from './styles/message';

const cx = classNames.bind(styles);

class Message {
  constructor(mount) {
    this.container = document.createElement('div');
    this.container.className = cx('wrapper');
    mount.appendChild(this.container);
  }
  update(text) {
    const { container } = this;
    while (container.firstChild) container.removeChild(container.firstChild);
    if (text) {
      container.appendChild(document.createTextNode(text));
    }
  }
}

export default Message;
