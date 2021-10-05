import React, {Component, Fragment} from 'react';
import {StyleSheet, TouchableNativeFeedback, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';
import KeyboardListener from '@/lib/KeyboardListener';
import {unMount} from '@/utils';
import ImageSvg from '@/assets/img/image_svg.svg';
import {SvgXml} from 'react-native-svg';

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

  render() {
    const {selectionColor, onOpenCamera} = this.props;
    const {showKeyboard, detectClick} = this.state;
    const marginRight = showKeyboard && detectClick ? 2 : 6;
    const marginLeft = showKeyboard && detectClick ? 0 : -5;
    return (
      <Fragment>
        <TouchableNativeFeedback onPress={onOpenCamera}>
          <View style={[styles.buttonExtend]}>
            <Icon name="camera" size={24} color={selectionColor} />
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback>
          <View style={[styles.buttonExtend, styles.imageSend]}>
            <SvgXml xml={ImageSvg} fill={selectionColor} />
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback
          onPress={() => this.handleClickIcon(TypeIconRecord)}>
          <View style={[styles.buttonExtend, {marginRight, marginLeft}]}>
            {showKeyboard && detectClick ? (
              <IconAnt name="right" size={23} color={selectionColor} />
            ) : (
              <Icon name={'microphone'} size={23} color={selectionColor} />
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
    width: 30,
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSend: {width: 27, height: 27, marginBottom: 0.5},
});

export default Extension;
