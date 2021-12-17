import React, {Component, Fragment} from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import KeyboardListener from '@/lib/KeyboardListener';
import {unMount} from '@/utils';
import IconIon from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';

interface IProps {
  selectionColor: string;
  screen: {width: number; height: number};
  handleAnimatedInput: (v: number) => any;
  refClass?: (v: any) => any;
  onOpenCamera?: any;
}

interface IState {
  showKeyboard: boolean;
  detectClick: boolean;
}

const TypeIconRecord = 'RECORD';
const TypeIconImage = 'IMAGE';
const TypeIconCamera = 'CAMERA';

class Extension extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {showKeyboard: false, detectClick: true};
  }

  shouldComponentUpdate(_nProps: IProps, nState: IState) {
    const {showKeyboard, detectClick} = this.state;
    return (
      showKeyboard !== nState.showKeyboard || detectClick !== nState.detectClick
    );
  }

  componentWillUnmount() {
    unMount(this);
  }

  handleClickIcon = (type: string) => {
    const {screen, handleAnimatedInput} = this.props;
    const {showKeyboard} = this.state;
    const {width} = screen;
    if (type === TypeIconRecord) {
      if (showKeyboard) {
        handleAnimatedInput(width - 180);
        this.setState({detectClick: false});
      } else {
        //todo record
      }
    } else if (type === TypeIconImage) {
      //todo image
    } else if (type === TypeIconCamera) {
      //todo camera
    }
  };

  handleShowKeyboard = () => {
    const {screen, handleAnimatedInput} = this.props;
    const {width} = screen;
    handleAnimatedInput(width - 90);
    this.setState({showKeyboard: true});
  };

  handleHideKeyboard = () => {
    const {screen, handleAnimatedInput} = this.props;
    const {width} = screen;
    handleAnimatedInput(width - 180);
    this.setState({showKeyboard: false, detectClick: true});
  };

  handleShowExtendsion = () => {
    const {showKeyboard} = this.state;
    if (!showKeyboard) {
      return;
    }
    const {screen, handleAnimatedInput} = this.props;
    const {width} = screen;
    handleAnimatedInput(width - 90);
    this.setState({detectClick: true});
  };

  onOpenCamera = () => {
    const {onOpenCamera} = this.props;
    Keyboard.dismiss();
    onOpenCamera?.();
  };

  render() {
    const {selectionColor} = this.props;
    const {showKeyboard, detectClick} = this.state;
    const marginRight = showKeyboard && detectClick ? 2 : 6;
    const marginLeft = showKeyboard && detectClick ? 0 : -5;
    return (
      <Fragment>
        <TouchableNativeFeedback onPress={this.onOpenCamera}>
          <View style={[styles.buttonExtend]}>
            <Icon name="camera" size={26} color={selectionColor} />
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback>
          <View style={[styles.buttonExtend]}>
            <IconIon name="image" size={30} color={selectionColor} />
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback
          onPress={() => this.handleClickIcon(TypeIconRecord)}>
          <View style={[styles.buttonExtend, {marginRight, marginLeft}]}>
            {showKeyboard && detectClick ? (
              <IconIon
                name="chevron-forward-outline"
                size={28}
                color={selectionColor}
              />
            ) : (
              <IconIon name="mic" size={28} color={selectionColor} />
            )}
          </View>
        </TouchableNativeFeedback>
        <KeyboardListener
          onWillShow={this.handleShowKeyboard}
          onWillHide={this.handleHideKeyboard}
        />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  buttonExtend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Extension;
