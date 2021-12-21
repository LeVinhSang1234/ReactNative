import React, {Component} from 'react';
import {Animated, Image, Pressable, StyleSheet, View} from 'react-native';
import Text from '@/lib/Text';
import {appConnect} from '@/App';
import bar from '@/utils/bar';
import {backgroundIconChat} from '@/utils/variables';
import IconIon from 'react-native-vector-icons/Ionicons';
import translate from '@/translate';
import {animatedSpringLayout, promiseDelayFinished} from '@/utils';

interface IProps {
  backgroundColor?: string;
  color?: string;
  colorAlbum?: string;
  onSelect?: (a: any) => any;
}

interface IState {
  albums: any[];
  album: any;
}

const colorButton = '#4477f3';

class Album extends Component<IProps, IState> {
  heightAlbum: Animated.Value;
  constructor(props: IProps) {
    super(props);
    this.heightAlbum = new Animated.Value(0);
    this.state = {albums: [], album: {}};
  }

  shouldComponentUpdate(_nProps: IProps, nState: IState) {
    const {albums, album} = this.state;
    return album !== nState.album || albums !== nState.albums;
  }

  setAlbum = (album: any) => {
    this.setState({album});
  };

  setAlbums = (albums: any[], album: any) => {
    this.setState({albums, album});
  };

  getAlbums = (): any[] => {
    const {albums} = this.state;
    return albums;
  };

  open = () => {
    const {height} = appConnect;
    animatedSpringLayout(this.heightAlbum, height).start();
  };

  close = () => {
    animatedSpringLayout(this.heightAlbum, 0).start();
  };

  handleSelectAlbum = async (albumItem: any) => {
    await promiseDelayFinished(this.heightAlbum, 0, 260);
    const {onSelect} = this.props;
    const {album} = this.state;
    if (album.localIdentifier !== albumItem.localIdentifier) {
      onSelect?.(albumItem);
    }
  };

  renderAlbum = (albumItem: any) => {
    const {image, _imageRef} = albumItem.previewAsset;
    const {colorAlbum} = this.props;
    const {album} = this.state;
    return (
      <Pressable
        onPress={() => this.handleSelectAlbum(albumItem)}
        key={albumItem.localIdentifier}>
        <View style={styles.viewAlbumList}>
          <Image style={styles.image} source={image || _imageRef} />
          <View style={styles.flex}>
            <View>
              <Text style={[styles.titleAlbum, {color: colorAlbum}]}>
                {albumItem.title}
              </Text>
              <Text style={{color: colorAlbum}}>{albumItem.assetCount}</Text>
            </View>
            {album.localIdentifier === albumItem.localIdentifier ? (
              <IconIon size={20} color={colorButton} name="checkmark-outline" />
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  render() {
    let {backgroundColor = '#fff', colorAlbum} = this.props;
    if (!colorAlbum) {
      colorAlbum = backgroundIconChat;
    }
    const {albums = []} = this.state;
    const {width} = appConnect;
    return (
      <Animated.View
        style={[
          styles.viewAlbum,
          {height: this.heightAlbum, width, backgroundColor},
        ]}>
        <Animated.View style={[styles.viewButton]}>
          <Pressable onPress={this.close}>
            <View style={styles.buttonCancel}>
              <Text style={[styles.textButton, {color: colorButton}]}>
                {translate({
                  id: 'screen.list_album.button.cancel',
                  defaultValue: 'Huỷ',
                })}
              </Text>
            </View>
          </Pressable>
          <View>
            <Text style={[styles.textAlbum, {color: colorAlbum}]}>
              {translate({
                id: 'screen.list_album.title',
                defaultValue: 'Chọn Album',
              })}
            </Text>
          </View>
          <Pressable>
            <View style={[styles.buttonCancel]} />
          </Pressable>
        </Animated.View>
        {albums.map((e: any) => this.renderAlbum(e))}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  viewAlbum: {
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flex: 1,
  },
  buttonCancel: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32 + bar.height,
    paddingTop: bar.height,
  },
  textAlbum: {
    fontWeight: '700',
    fontSize: 17,
    height: 18,
  },
  textButton: {
    fontWeight: '600',
  },
  viewAlbumList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  image: {
    borderRadius: 8,
    width: 65,
    height: 65,
    marginRight: 15,
  },
  titleAlbum: {
    fontWeight: '600',
    marginBottom: 15,
    fontSize: 17,
  },
  fw6: {
    fontWeight: '600',
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
});

export default Album;
