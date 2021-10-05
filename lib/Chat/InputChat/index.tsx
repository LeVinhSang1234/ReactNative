import {IScreen} from '@/sagas/models/screen';
import React, {Component, ReactNode} from 'react';
import {
  Animated,
  StyleSheet,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {connect} from 'react-redux';
import SvgSend from '@/assets/img/icon_send.svg';
import Extension from '../Extension';
import {backgroundIconChat, backgroundInputChat} from '@/utils/variables';
import bar from '@/utils/bar';

const InputAnimated = Animated.createAnimatedComponent(TextInput);

interface IProps {
  screen: IScreen;
  backgroundColor?: string;
  selectionColor?: string;
  disabledColor?: string;
  onSend?: (v: string) => any;
  onOpenCamera?: any;
}

interface IState {
  inputText: string;
}

class InputChat extends Component<IProps, IState> {
  animated: Animated.ValueXY;
  animatedWidth: Animated.Value;
  heightInput: Animated.Value;
  input: any;
  extendsion: any;
  constructor(props: IProps) {
    super(props);
    this.animated = new Animated.ValueXY({x: 0, y: 0});
    const {screen} = props;
    const {
      screen: {width},
    } = screen;
    this.animatedWidth = new Animated.Value(width - 180);
    this.heightInput = new Animated.Value(19.5);
    this.state = {inputText: ''};
  }

  heightContentChangeSize = ({nativeEvent}: any) => {
    const {contentSize} = nativeEvent;
    const {height} = contentSize;
    Animated.spring(this.heightInput, {
      toValue: height,
      bounciness: 0,
      overshootClamping: true,
      useNativeDriver: false,
    }).start();
  };

  handleChangeText = (value: string) => {
    this.setState({inputText: value});
  };

  handleAnimatedInput = (value: number) => {
    Animated.spring(this.animatedWidth, {
      toValue: value,
      bounciness: 0,
      overshootClamping: true,
      useNativeDriver: false,
    }).start();
  };

  handleOnPressIn = () => {
    this.extendsion?.handleShowExtendsion?.();
  };

  render(): ReactNode {
    const {
      screen: {screen},
      backgroundColor = backgroundInputChat,
      selectionColor = backgroundIconChat,
      onOpenCamera,
    } = this.props;
    const {width} = screen;
    const {inputText} = this.state;
    return (
      <View style={[styles.view, {width}]}>
        <View style={styles.extendsion}>
          <Extension
            onOpenCamera={onOpenCamera}
            ref={ref => (this.extendsion = ref)}
            screen={screen}
            selectionColor={selectionColor}
            handleAnimatedInput={this.handleAnimatedInput}
          />
        </View>
        <TouchableNativeFeedback
          onPress={() => {
            this.handleOnPressIn();
            this.input?.focus?.();
          }}>
          <Animated.View
            style={[
              styles.viewInput,
              {width: this.animatedWidth, backgroundColor},
            ]}>
            <InputAnimated
              onPressIn={this.handleOnPressIn}
              ref={(ref: any) => (this.input = ref)}
              onChangeText={this.handleChangeText}
              value={inputText}
              style={[styles.input, {height: this.heightInput}]}
              onContentSizeChange={this.heightContentChangeSize}
              selectionColor={selectionColor}
              placeholder="Aa"
              multiline
            />
          </Animated.View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback
          onPress={() => {
            console.log('feed back');
          }}>
          <View style={styles.viewButtonSend}>
            <SvgXml
              width={23}
              height={23}
              xml={SvgSend}
              fill={inputText ? selectionColor : '#f0f2f5'}
            />
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingRight: 0,
    paddingLeft: 12,
    paddingTop: 12,
    paddingBottom: 12 + bar.navbarHeight,
  },
  viewInput: {
    borderRadius: 20,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  input: {
    width: '100%',
    paddingTop: 0,
    fontSize: 20,
    maxHeight: 120,
    minHeight: 20,
  },
  viewButtonSend: {
    width: 50,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLike: {
    fontSize: 25,
  },
  extendsion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 118,
    height: 35,
  },
});

export default connect(({screen}: {screen: IScreen}) => ({screen}))(InputChat);
