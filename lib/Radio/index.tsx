import React, {Component} from 'react';
import {Animated, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';

interface IProps {
  width?: number;
  height?: number;
  bordered?: boolean;
  checked?: boolean;
  borderColorChecked?: string;
  duration?: number;
  dotColorChecked?: string;
  disabled?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: any) => any;
  style?: ViewStyle;
}

interface IState {
  checked?: boolean;
}

class Radio extends Component<IProps, IState> {
  static defaultProps = {
    width: 16,
    height: 16,
    bordered: true,
    borderColorChecked: '#21C0F6',
    checked: undefined,
    duration: 300,
    dotColorChecked: '#21C0F6',
    disabled: false,
    defaultChecked: false,
  };
  animated: Animated.Value;

  constructor(props: IProps) {
    super(props);
    const checked = !!props.checked || !!props.defaultChecked;
    this.state = {checked};
    this.animated = new Animated.Value(checked ? 1 : 0);
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const {checked} = nextProps;
    const {checked: checkedState} = this.state;
    if (checked !== undefined && checked !== checkedState) {
      this.handleChangeChecked();
    }
  }

  handleChangeChecked = () => {
    const {checked} = this.state;
    const {duration, disabled} = this.props;
    if (disabled) return;
    let toValue = 0;
    if (!checked) {
      toValue = 1;
    }
    Animated.timing(this.animated, {
      duration: duration,
      toValue,
      useNativeDriver: false,
    }).start();
    this.setState({checked: !checked});
  };

  handlePress = () => {
    const {checked} = this.state;
    const {onChange, checked: checkedProps} = this.props;
    if (checkedProps === undefined) {
      this.handleChangeChecked();
    }
    if (typeof onChange === 'function') onChange(!checked);
  };

  render() {
    const {
      width = 16,
      height = 16,
      style,
      bordered,
      borderColorChecked = '#21C0F6',
      dotColorChecked = '#21C0F6',
      disabled,
    } = this.props;
    const {checked} = this.state;
    const borderColor = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: ['#A8A8A8', disabled ? '#A8A8A8' : borderColorChecked],
    });
    const backgroundColor = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [
        'rgba(255, 255, 255, 0)',
        disabled ? '#A8A8A8' : dotColorChecked,
      ],
    });

    let borderWidth = 1;
    if (!bordered && checked) {
      borderWidth = width / 4;
    }

    return (
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.6}
        onPress={this.handlePress}>
        <Animated.View
          style={{
            ...styles.radio,
            width,
            height,
            ...style,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderColor,
            borderWidth,
            opacity: disabled ? 0.5 : 1,
          }}>
          {bordered && (
            <Animated.View
              style={{
                width: width / 2,
                height: height / 2,
                backgroundColor,
                borderRadius: 100,
              }}
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  radio: {
    borderRadius: 100,
    borderStyle: 'solid',
  },
});

export default Radio;
