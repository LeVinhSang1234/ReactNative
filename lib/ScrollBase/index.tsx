import {unMount} from '@/utils';
import React, {Component} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
} from 'react-native';

interface IProps extends ScrollViewProps {
  onScroll?: any;
}

class ScrollBase extends Component<IProps> {
  previousScroll: number;
  nowScroll: number;
  scroll?: ScrollView | null;
  constructor(props: IProps) {
    super(props);
    this.previousScroll = 0;
    this.nowScroll = 0;
  }

  componentWillUnmount() {
    unMount(this);
  }

  scrollNextAdd = (y: number) => {
    this.scroll?.scrollTo?.({y: this.previousScroll + y, animated: true});
  };

  handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {nativeEvent} = e;
    this.previousScroll = this.nowScroll;
    const {contentOffset} = nativeEvent;
    const {y} = contentOffset;
    this.nowScroll = y;
    const {onScroll} = this.props;
    if (onScroll) {
      onScroll(e, this.previousScroll, y);
    }
  };

  render() {
    const {
      children,
      showsHorizontalScrollIndicator,
      showsVerticalScrollIndicator,
      ...p
    } = this.props;
    return (
      <ScrollView
        ref={ref => (this.scroll = ref)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={!!showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={!!showsHorizontalScrollIndicator}
        {...p}
        onScroll={this.handleScroll}>
        {children}
      </ScrollView>
    );
  }
}

export default ScrollBase;
