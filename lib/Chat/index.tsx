import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import Spin from '../Spin';
import Text from '../Text';
import InputChat from './InputChat';
import ScrollKeyboard from '../ScrollKeyboard';
import Camera from '../Camera';
import SelectImage, {SImage} from '../SelectImage';
import {Keyboard} from 'react-native';

interface IProps {}

class Chat extends Component<IProps> {
  camera?: any;
  scrollKeyboard?: ScrollKeyboard | null;
  selectImage?: SImage | null;
  toggleImage: boolean;
  constructor(props: IProps) {
    super(props);
    this.toggleImage = false;
  }

  handleSendMessage = (value: any) => {
    console.log(value);
  };

  handleOpenCamera = () => {
    this.camera?.open?.();
  };

  toggleKeyboard = (height: number = 0, animated: boolean = true) => {
    this.scrollKeyboard?.toggleKeyboard?.(height, animated);
  };

  openSelectImage = () => {
    this.toggleImage = true;
    Keyboard.dismiss();
    this.selectImage?.open?.();
  };

  closeSelectImage = () => {
    this.selectImage?.close?.();
  };

  render() {
    return (
      <Spin>
        <ScrollKeyboard
          onPress={() => {
            this.closeSelectImage();
          }}
          keepLayoutWhenHiddenKeyboard={() => this.toggleImage}
          ref={ref => (this.scrollKeyboard = ref)}
          scrollEndFirst
          componentAvoidingView={
            <InputChat
              openSelectImage={this.openSelectImage}
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
        <SelectImage
          openWhenShowKeyboard
          ref={ref => (this.selectImage = ref)}
          toggleKeyboard={this.toggleKeyboard}
        />
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
