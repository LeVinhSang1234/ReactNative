import translate from '@/translate';
import React, {Component, Fragment} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

interface IProps {
  handleCloseInit?: () => any;
  colorText: string;
  colorAlbum: string;
  description: any;
  openAlbum?: () => any;
  permission?: boolean;
}

interface Istate {
  album: any;
}

const maxHeightDrag = 37;

class Extension extends Component<IProps, Istate> {
  constructor(props: IProps) {
    super(props);
    this.state = {album: {}};
  }

  setAlbum = (album: any) => {
    this.setState({album});
  };

  getAlbum = () => {
    const {album} = this.state;
    return album;
  };

  render() {
    const {album} = this.state;
    const {
      handleCloseInit,
      colorText,
      description,
      openAlbum,
      permission,
      colorAlbum,
    } = this.props;
    return (
      <Fragment>
        <Pressable onPress={handleCloseInit}>
          <View style={styles.buttonCancel}>
            <Text style={[styles.ml5, styles.fw5, {color: colorText}]}>
              {translate({
                id: 'screen.list_image.button.cancel',
                defaultValue: 'Huỷ',
              })}
            </Text>
          </View>
        </Pressable>
        <View>
          <Text
            style={[styles.textCenter, styles.textAlbum, {color: colorAlbum}]}>
            {album?.title ||
              translate({
                id: 'screen.list_image.title_image_default',
                defaultValue: 'Ảnh',
              })}
          </Text>
          {description ? (
            <Text style={[styles.textCenter, styles.albumDescription]}>
              {description}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={openAlbum}>
          <View style={[styles.buttonCancel, styles.justiEnd]}>
            {permission ? (
              <Text
                style={[
                  styles.pr5,
                  styles.fw5,
                  styles.alignRight,
                  {color: colorText},
                ]}>
                {translate({
                  id: 'screen.list_image.button.open_list_album',
                  defaultValue: 'Album',
                })}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  buttonCancel: {
    width: 70,
    height: maxHeightDrag,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ml5: {
    marginLeft: 15,
  },
  pr5: {
    paddingRight: 15,
  },
  w60: {},
  alignRight: {
    textAlign: 'right',
  },
  textAlbum: {
    fontWeight: '700',
    fontSize: 17,
  },
  albumDescription: {
    color: '#aaa4a6',
  },
  fw5: {
    fontWeight: '600',
  },
  justiEnd: {
    justifyContent: 'flex-end',
  },
  textCenter: {
    textAlign: 'center',
    color: '#2b1624',
  },
});

export default Extension;
