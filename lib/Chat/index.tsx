import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import Spin from '../Spin';
import Text from '../Text';
import InputChat from './InputChat';
import ScrollKeyboard from '../ScrollKeyboard';
import Camera from '../Camera';

interface IProps {}

class Chat extends Component<IProps> {
  camera?: any;
  constructor(props: IProps) {
    super(props);
  }

  handleSendMessage = (value: any) => {
    console.log(value);
  };

  handleOpenCamera = () => {
    this.camera?.open?.();
  };

  render() {
    return (
      <Spin>
        <ScrollKeyboard
          scrollEndFirst
          componentAvoidingView={
            <InputChat
              onOpenCamera={this.handleOpenCamera}
              onSend={this.handleSendMessage}
            />
          }>
          <View style={styles.contentScroll}>
            <Text>SangDz Le Vinh</Text>
            <Text style={styles.text}>SangDz Le Vinh</Text>
            <Text style={styles.text}>SangDz Le Vinh</Text>
            <Text style={styles.text}>SangDz Le Vinh</Text>
            <Text style={styles.text}>SangDz Le Vinh</Text>
          </View>
        </ScrollKeyboard>
        <Camera ref={ref => (this.camera = ref)} />
      </Spin>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    paddingTop: 200,
  },
  contentScroll: {
    paddingVertical: 16,
  },
});

export default Chat;
