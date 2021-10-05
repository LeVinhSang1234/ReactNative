import React from 'react';
import {StyleSheet, View, ActivityIndicator, ViewStyle} from 'react-native';

interface IProps {
  children?: any;
  spinning?: boolean;
  style?: ViewStyle;
  backgroundColor?: string;
}

const Spin = (props: IProps) => {
  const {children, spinning, backgroundColor = '#fff', style} = props;

  return (
    <View style={[styles.view, {backgroundColor}, style]}>
      {spinning && (
        <View style={{...styles.image}}>
          <ActivityIndicator size="small" />
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
  view: {
    position: 'relative',
    flex: 1,
  },
});

export default Spin;
