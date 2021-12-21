import React, {Component} from 'react';
import {GestureResponderEvent, StyleSheet, View, ViewProps} from 'react-native';

interface IProps extends ViewProps {
  onMove?: (v: number, diffY: number) => any;
  onMoveEnd?: (e: GestureResponderEvent) => any;
}

class ViewMove extends Component<IProps> {
  heightInitView: number;
  pageYNow: number;
  pageYStart: number;
  constructor(props: IProps) {
    super(props);
    this.heightInitView = 0;
    this.pageYNow = 0;
    this.pageYStart = 0;
  }

  handleLayout = ({nativeEvent}: any) => {
    const {layout} = nativeEvent;
    this.heightInitView = layout.height;
  };

  handleTouchStart = ({nativeEvent}: any) => {
    const {pageY} = nativeEvent;
    this.pageYNow = pageY;
    this.pageYStart = pageY;
  };

  handleMove = ({nativeEvent}: any) => {
    const {onMove} = this.props;
    const {pageY} = nativeEvent;
    if (Math.abs(pageY - this.pageYStart) < 20) {
      return;
    }
    onMove?.(pageY - this.pageYNow, pageY - this.pageYStart);
    this.pageYNow = pageY;
  };

  handleMoveEnd = (e: any) => {
    const {nativeEvent} = e;
    const {onMoveEnd} = this.props;
    const {pageY} = nativeEvent;
    if (Math.abs(pageY - this.pageYStart) < 20) {
      return;
    }
    onMoveEnd?.(e);
  };

  render() {
    const {children, style} = this.props;
    return (
      <View
        onTouchEnd={this.handleMoveEnd}
        onTouchStart={this.handleTouchStart}
        onLayout={this.handleLayout}
        style={[style, styles.viewMove]}
        onTouchMove={this.handleMove}>
        {children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewMove: {
    flex: 1,
  },
});

export default ViewMove;
