import React, {useEffect, useRef, useState} from 'react';
import {Animated, Text, StyleSheet, ViewStyle} from 'react-native';

let timeout: any;

interface IProps {
  text?: any;
  ghost?: boolean;
  onClick?: (v?: any) => any;
  size?: number;
  bold?: boolean;
  disabled?: boolean;
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
  color?: string;
  limit?: number;
}

const Button = (props: IProps) => {
  let {
    text,
    ghost,
    onClick,
    size,
    bold,
    disabled,
    width = '100%',
    height = 56,
    style,
    color = '#ffffff',
    limit,
  } = props;
  const animated = useRef(new Animated.Value(0)).current;
  const [clickLimit, setLimit] = useState(0);

  function onTouchStart() {
    if (disabled) return;
    if (limit && clickLimit === limit) return;
    setLimit(clickLimit + 1);
    Animated.timing(animated, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      Animated.timing(animated, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      if (onClick && typeof onClick === 'function') onClick();
    }, 300);
  }

  useEffect(() => {
    if (disabled) {
      Animated.timing(animated, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animated, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [disabled]);

  let styleCustom = {...styles.primary, ...style};
  let backgroundColor: any = '#fff';
  let opacity: any = 1;
  if (ghost) {
    color = '#21C0F6';
    styleCustom = {...styleCustom, borderColor: '#21C0F6'};
  } else {
    backgroundColor = animated.interpolate({
      inputRange: [0, 1],
      outputRange: ['#21C0F6', '#40a9ff'],
    });
  }
  opacity = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.4],
  });

  return (
    <Animated.View
      onTouchStart={onTouchStart}
      style={{width, height, ...styleCustom, backgroundColor, opacity}}>
      <Text
        style={{
          color,
          fontSize: size || 14,
          fontWeight: bold ? '700' : '500',
        }}>
        {text}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  primary: {
    paddingLeft: 17,
    paddingRight: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#21C0F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
