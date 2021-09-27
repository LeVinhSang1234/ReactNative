import React from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';

interface IProps {
  children?: any;
  spinning?: boolean;
  style?: any;
  backgroundColor?: string;
}

const Spin = (props: IProps) => {
  const {children, spinning, backgroundColor = 'transparent'} = props;

  return (
    <View
      style={{
        position: 'relative',
        flex: 1,
        backgroundColor,
      }}>
      {spinning && (
        <View style={{...styles.image}}>
          <ActivityIndicator size="large" color="#21c0f6" />
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Spin;
