import React, {Component} from 'react';
import {GestureResponderEvent, StyleSheet, View, ViewProps} from 'react-native';

interface IProps extends ViewProps {
  onMove?: (v: number) => any;
  onMoveEnd?: (e: GestureResponderEvent) => any;
}

class ViewMove extends Component<IProps> {
  heightInitView: number;
  pageYNow: number;
  constructor(props: IProps) {
    super(props);
    this.heightInitView = 0;
    this.pageYNow = 0;
  }

  handleLayout = ({nativeEvent}: any) => {
    const {layout} = nativeEvent;
    this.heightInitView = layout.height;
  };

  handleTouchStart = ({nativeEvent}: any) => {
    const {pageY} = nativeEvent;
    this.pageYNow = pageY;
  };

  handleMove = ({nativeEvent}: any) => {
    const {onMove} = this.props;
    const {pageY} = nativeEvent;
    onMove?.(pageY - this.pageYNow);
    this.pageYNow = pageY;
  };

  handleMoveEnd = (e: any) => {
    const {onMoveEnd} = this.props;
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
