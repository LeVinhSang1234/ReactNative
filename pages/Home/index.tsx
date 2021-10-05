import Chat from '@/lib/Chat';
import React from 'react';
import {StyleSheet, View} from 'react-native';

interface IProps {}
const Home = (_props: IProps) => {
  return (
    <View style={styles.view}>
      <Chat />
    </View>
  );
};

const styles = StyleSheet.create({
  view: {flex: 1},
});

export default Home;
