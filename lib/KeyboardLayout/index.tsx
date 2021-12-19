import KeyboardListener from '@/lib/KeyboardListener';
import bar from '@/utils/bar';
import React, {Component} from 'react';
import {Keyboard} from 'react-native';
import {Animated, LayoutChangeEvent, View, ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';

interface IProps {
  onLayout?: (e: LayoutChangeEvent) => any;
  onHeightChange?: (hPre: number, hNow: number) => any;
  onWidthChange?: (wPre: number, wNow: number) => any;
  distanceHeight?: number;
  style?: ViewStyle;
  keepLayoutWhenHiddenKeyboard?: () => boolean;
}

interface IState {}

class KeyboardLayout extends Component<IProps, IState> {
  animated: Animated.Value;
  hPre: number;
  hNow: number;
  wPre: number;
  wNow: number;
  initApp: boolean;
  constructor(props: IProps) {
    super(props);
    this.animated = new Animated.Value(0);
    this.hPre = 0;
    this.hNow = 0;
    this.wPre = 0;
    this.wNow = 0;
    this.initApp = true;
  }

  handleShowKeyboard = (e: any) => {
    const {endCoordinates} = e;
    const {height} = endCoordinates;
    this.handleAnimated(height - bar.navbarHeight);
  };

  handleHideKeyboard = () => {
    const {keepLayoutWhenHiddenKeyboard} = this.props;
    if (!keepLayoutWhenHiddenKeyboard?.()) {
      this.handleAnimated(0);
    }
  };

  handleAnimated = (height: number, animated: boolean = true) => {
    if (animated) {
      Animated.spring(this.animated, {
        toValue: height,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(this.animated, {
        toValue: height,
        useNativeDriver: false,
        duration: 0,
      }).start();
    }
  };

  handleLayout = (e: LayoutChangeEvent) => {
    if (this.initApp) {
      return (this.initApp = false);
    }
    const {nativeEvent} = e;
    const {onHeightChange, onWidthChange, onLayout} = this.props;
    onLayout?.(e);
    this.hPre = this.hNow;
    this.wPre = this.wNow;
    const {layout} = nativeEvent;
    const {height, width} = layout;
    this.hNow = height;
    this.wNow = width;
    onHeightChange?.(this.hPre, this.hNow);
    onWidthChange?.(this.wPre, this.wNow);
  };

  render() {
    const {children, style = {}} = this.props;
    return (
      <View onLayout={this.handleLayout}>
        {children}
        <Animated.View style={[styles.view, style, {height: this.animated}]}>
          <KeyboardListener
            onWillShow={this.handleShowKeyboard}
            onWillHide={this.handleHideKeyboard}
          />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  view: {},
});

export default KeyboardLayout;
