import {Component} from 'react';
import {Keyboard} from 'react-native';

interface IProps {
  onWillShow?: (e: KeyboardEvent) => any;
  onWillHide?: (e: KeyboardEvent) => any;
  onDidShow?: (e: KeyboardEvent) => any;
  onDidHide?: (e: KeyboardEvent) => any;
  onWillChangeFrame?: (e: KeyboardEvent) => any;
  onDidChangeFrame?: (e: KeyboardEvent) => any;
}

class KeyboardListener extends Component<IProps> {
  willShow: any;
  willHide: any;
  didShow: any;
  didHide: any;
  willFrame: any;
  didFrame: any;
  constructor(props: IProps) {
    super(props);
    const {
      onWillShow,
      onWillHide,
      onDidShow,
      onDidHide,
      onWillChangeFrame,
      onDidChangeFrame,
    } = props;
    this.willShow = Keyboard.addListener('keyboardWillShow', e => {
      onWillShow?.(e);
    });
    this.willHide = Keyboard.addListener('keyboardWillHide', e => {
      onWillHide?.(e);
    });
    this.didShow = Keyboard.addListener('keyboardDidShow', e => {
      onDidShow?.(e);
    });
    this.didHide = Keyboard.addListener('keyboardDidHide', e => {
      onDidHide?.(e);
    });
    this.willFrame = Keyboard.addListener('keyboardWillChangeFrame', e => {
      onWillChangeFrame?.(e);
    });
    this.didFrame = Keyboard.addListener('keyboardDidChangeFrame', e => {
      onDidChangeFrame?.(e);
    });
  }

  componentWillUnmount() {
    this.willShow?.remove?.();
    this.willHide?.remove?.();
    this.didShow?.remove?.();
    this.didHide?.remove?.();
    this.willFrame?.remove?.();
    this.didFrame?.remove?.();
  }

  render() {
    return null;
  }
}

export default KeyboardListener;
