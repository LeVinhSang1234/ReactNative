import React, {Component, Fragment} from 'react';
import {ScrollViewProps} from 'react-native';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ViewStyle,
} from 'react-native';
import KeyboardLayout from '../KeyboardLayout';

interface IProps extends ScrollViewProps {
  componentAvoidingView?: any;
  styleKeyboard?: ViewStyle;
  scrollEventThrottle?: number;
  scrollEndFirst?: boolean;
}

class ScrollKeyboard extends Component<IProps> {
  scrollView?: ScrollView | null;
  scrollNow: number;
  firstComponent: boolean;

  constructor(props: IProps) {
    super(props);
    this.scrollNow = 0;
    this.firstComponent = true;
  }

  handleScroll = ({nativeEvent}: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset} = nativeEvent;
    const {y} = contentOffset;
    this.scrollNow = y;
  };

  handleHeightChangeKeyboard = (hPre: number, hNow: number) => {
    this.scrollView?.scrollTo({
      y: this.scrollNow + hNow - hPre,
      animated: false,
    });
  };

  onLayout = (e: LayoutChangeEvent) => {
    const {onLayout, scrollEndFirst} = this.props;
    if (scrollEndFirst && this.firstComponent) {
      this.firstComponent = false;
      this.scrollView?.scrollToEnd({animated: false});
    }
    if (onLayout) {
      onLayout(e);
    }
  };

  render() {
    const {
      children,
      componentAvoidingView,
      styleKeyboard,
      scrollEventThrottle = 200,
      ...props
    } = this.props;
    return (
      <Fragment>
        <ScrollView
          {...props}
          onLayout={this.onLayout}
          scrollEventThrottle={scrollEventThrottle}
          onScroll={this.handleScroll}
          ref={ref => (this.scrollView = ref)}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        <KeyboardLayout
          style={styleKeyboard}
          distanceHeight={10}
          onHeightChange={this.handleHeightChangeKeyboard}>
          {componentAvoidingView}
        </KeyboardLayout>
      </Fragment>
    );
  }
}

export default ScrollKeyboard;
