import React, {Component, Fragment} from 'react';
import {Animated, StyleSheet, TextInputProps} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import KeyboardListener from '../KeyboardListener';
import ScrollBase from '../ScrollBase';

const ScrollViewAnimated = Animated.createAnimatedComponent(ScrollBase);
const InputAnimated = Animated.createAnimatedComponent(TextInput);

interface IProps extends TextInputProps {
  heightInit?: number;
  maxHeight?: number;
}

interface IState {
  scrollEnable: boolean;
}

class InputScrollKeyboard extends Component<IProps, IState> {
  input?: any;
  heightAnimated: Animated.Value;
  scrollInput: number;
  heightScrollNow: number;
  heightInputAnimated: Animated.Value;

  constructor(props: IProps) {
    super(props);
    const {heightInit = 19.5} = props;
    this.heightAnimated = new Animated.Value(heightInit);
    this.heightInputAnimated = new Animated.Value(heightInit);
    this.scrollInput = 0;
    this.heightScrollNow = heightInit;
    this.state = {scrollEnable: false};
  }

  shouldComponentUpdate(_nProps: IProps, nState: IState) {
    const {scrollEnable} = this.state;
    return scrollEnable !== nState.scrollEnable;
  }

  focus = () => {
    this.input?.focus?.();
  };

  blur = () => {
    this.input?.blur?.();
  };

  handleKeyboardShow = () => {
    this.setState({scrollEnable: true});
    const {heightInit = 19.5} = this.props;
    if (this.heightScrollNow > heightInit) {
      Animated.spring(this.heightAnimated, {
        toValue: this.heightScrollNow,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }).start();
    }
  };

  handleChangeSize = ({nativeEvent}: any) => {
    const {contentSize} = nativeEvent;
    const {height} = contentSize;
    let value = height;
    const {maxHeight = 200} = this.props;
    if (height >= maxHeight) {
      value = maxHeight;
    }
    this.heightScrollNow = value;
    Animated.parallel([
      Animated.timing(this.heightInputAnimated, {
        toValue: height,
        useNativeDriver: false,
        duration: 0,
      }),
      Animated.spring(this.heightAnimated, {
        toValue: value,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
    ]).start();
  };

  handleHideKeyboard = () => {
    this.input?.blur?.();
    this.setState({scrollEnable: false});
    const {heightInit = 19.5} = this.props;
    Animated.spring(this.heightAnimated, {
      toValue: heightInit,
      bounciness: 0,
      overshootClamping: true,
      useNativeDriver: false,
    }).start();
  };

  render() {
    const {style, ...props} = this.props;
    const {scrollEnable} = this.state;

    return (
      <Fragment>
        <ScrollViewAnimated
          scrollEnabled={false}
          style={{height: this.heightAnimated}}>
          <InputAnimated
            scrollEnabled={scrollEnable}
            onContentSizeChange={this.handleChangeSize}
            ref={(ref: any) => (this.input = ref)}
            multiline
            {...props}
            style={[style, styles.input, {height: this.heightInputAnimated}]}
          />
        </ScrollViewAnimated>
        <KeyboardListener
          onWillShow={this.handleKeyboardShow}
          onWillHide={this.handleHideKeyboard}
        />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  input: {},
});

export default InputScrollKeyboard;
