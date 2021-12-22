import {appConnect} from '@/App';
import {
  animatedSpringLayout,
  animatedTiming,
  promiseSringLayout,
  throwException,
  unMount,
} from '@/utils';
import bar from '@/utils/bar';
import {backgroundIconChat} from '@/utils/variables';
import React, {Component, Fragment, lazy, Suspense} from 'react';
import {View} from 'react-native';
import {Animated, KeyboardEvent, StyleSheet} from 'react-native';
import RNPhotosFramework from 'rn-photos-framework';
import KeyboardListener from '../KeyboardListener';
import ViewMove from '../ViewMove';
import Album from './Album';
import ButtonSelect from './ButtonSelect';
import Extension from './Extension';
import FlatListImage from './FlatListImage';
import {BlurView} from '@react-native-community/blur';
import PreviewImage from './PreviewImage';

const Permission = lazy(() => import('./Permission'));
const AnimatedBlur = Animated.createAnimatedComponent(BlurView);

interface IProps {
  toggleKeyboard?: (h?: number, animated?: boolean) => any;
  openWhenShowKeyboard?: boolean;
  fullScreen?: boolean;
  backgroundColor?: string;
  spaceTopWhenFullScreen?: number;
  colorText?: string;
  description?: string;
  maxPoint?: number;
  onSelectFinish?: (image: any[]) => any;
  onLoadWillMount?: (image: any) => any;
}
interface IState {
  permission: {isAuthorized: boolean; status?: string};
}

const initHeight = 260;
const maxHeightDrag = 37;

class SelectImage extends Component<IProps, IState> {
  animatedBackdropOpacity: Animated.Value;
  animatedBackdropHeight: Animated.Value;
  animatedHeight: Animated.Value | any;
  opacityChild: Animated.Value;
  heightDrag: Animated.Value;
  heightDragScale: Animated.Value;
  isOpen: boolean;
  isUpMove: boolean;
  maxHeightModal: number;
  forceDrag: boolean;
  detectMove: boolean;
  unSubAlbum: any;
  album?: Album | null;
  flatList?: FlatListImage | null;
  extension?: Extension | null;
  heightInit: number;
  buttonSelect?: ButtonSelect | null;
  previewImage?: PreviewImage | null;

  constructor(props: IProps) {
    super(props);
    const {fullScreen, maxPoint} = props;
    const {height} = appConnect;
    this.state = {permission: {isAuthorized: false, status: ''}};
    this.animatedBackdropOpacity = new Animated.Value(0);
    this.animatedBackdropHeight = new Animated.Value(0);
    this.animatedHeight = new Animated.Value(0);
    this.opacityChild = new Animated.Value(0);
    this.heightDrag = new Animated.Value(0);
    this.heightDragScale = new Animated.Value(0);
    this.isOpen = false;
    this.isUpMove = false;
    this.maxHeightModal = maxPoint || height - (fullScreen ? 0 : 70);
    this.forceDrag = false;
    this.detectMove = false;
    this.heightInit = 0;
  }

  async UNSAFE_componentWillMount() {
    const permission = await RNPhotosFramework.authorizationStatus();
    const {isAuthorized} = permission;
    if (isAuthorized) {
      await this.handleGetAlbum();
    } else {
      this.setState({permission});
    }
  }

  shouldComponentUpdate(_nProps: IProps, nState: any) {
    const state: any = this.state;
    return Object.keys(this.state).some(key => state[key] !== nState[key]);
  }

  componentWillUnmount() {
    this.unSubAlbum?.();
    animatedTiming(this.animatedBackdropHeight, 0).start();
    this.close();
    unMount(this);
  }

  handleAuthor = async () => {
    const permission = await RNPhotosFramework.requestAuthorization();
    if (!permission.isAuthorized) {
      return this.setState({permission});
    }
    await this.handleGetAlbum();
  };

  handleGetAlbum = async () => {
    const {onLoadWillMount} = this.props;
    try {
      const config = {
        subType: 'any',
        assetCount: 'exact',
        fetchOptions: {sortDescriptors: [{key: 'title', ascending: true}]},
        previewAssets: 1,
      };
      const data = await RNPhotosFramework.getAlbumsMany(
        [
          {type: 'smartAlbum', ...config},
          {type: 'album', ...config},
        ],
        true,
      );
      const albumSort = data.albums
        .filter((e: any) => e.assetCount)
        .sort?.((a: any, b: any) => (b.assetCount > a.assetCount ? 1 : -1));
      const albumActive = albumSort[0];
      const photos = await this.handleGetPhotos(albumActive);
      onLoadWillMount?.(photos[0]);
      this.setState({permission: {isAuthorized: true}});
      this.extension?.setAlbum?.(albumActive);
      this.flatList?.setPhotos?.(photos);
      this.album?.setAlbums?.(albumSort, albumActive);
    } catch (e) {
      throwException(e);
    }
  };

  handleSelectAlbum = async (albumItem: any) => {
    this.flatList?.scrollToOffset?.({animated: false, offset: 0});
    const photos = await this.handleGetPhotos(albumItem);
    this.extension?.setAlbum?.(albumItem);
    this.flatList?.setPhotos?.(photos);
    this.album?.setAlbum?.(albumItem);
  };

  handleGetPhotos = async (album: any) => {
    const {assets} = await this.getAssets(album);
    return assets;
  };

  getAssets = async (album: any) => {
    const data = await album.getAssets({
      startIndex: 0,
      endIndex: album.assetCount,
      trackInsertsAndDeletes: true,
      trackChanges: false,
    });
    this.unSubAlbum?.();
    album.onChange(async (changeDetails: any, update: any) => {
      const photos = this.flatList?.getPhotos?.() || [];
      if (changeDetails.hasIncrementalChanges) {
        update(photos, (updatedAssetArray: any[]) => {
          this.flatList?.setPhotos?.(updatedAssetArray);
        });
      }
    });
    this.unSubAlbum = () => album.stopTracking();
    return data;
  };

  open = () => {
    this.opacity(1);
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    const {toggleKeyboard, fullScreen} = this.props;
    if (fullScreen) {
      return this.handleOpenModal();
    }
    const heightBase = this.heightInit || initHeight;
    toggleKeyboard?.(heightBase);
    this.toggle(heightBase + bar.navbarHeight);
  };

  close = async () => {
    this.isOpen = false;
    const {toggleKeyboard} = this.props;
    toggleKeyboard?.(0);
    this.toggle(0);
    this.buttonSelect?.resetImage?.();
    await promiseSringLayout(this.opacityChild, 0);
    const albums = this.album?.getAlbums?.() || [];
    const album = this.extension?.getAlbum?.() || {};
    if (albums[0] && albums[0].localIdentifier !== album.localIdentifier) {
      await this.handleSelectAlbum(albums[0]);
    }
    this.flatList?.scrollToOffset?.({animated: false, offset: 0});
  };

  opacity = (toValue: 0 | 1) => {
    animatedSpringLayout(this.opacityChild, toValue).start();
  };

  toggle = (height: number = 0) => {
    animatedSpringLayout(this.animatedHeight, height).start();
  };

  handleShowKeyboard = (e: KeyboardEvent) => {
    this.opacity(0);
    const {openWhenShowKeyboard} = this.props;
    const {height} = e.endCoordinates;
    if (this.isOpen || (openWhenShowKeyboard && !this.isOpen)) {
      this.toggle(height);
    }
    if (this.heightInit !== 0) {
      return;
    }
    this.heightInit = height;
  };

  handleMove = (yChange: number) => {
    const {toggleKeyboard, fullScreen} = this.props;
    const y = this.animatedHeight._value - yChange;
    const {height} = appConnect;
    this.isUpMove = yChange < 0;
    if (y >= this.maxHeightModal) {
      return;
    }
    const scrollEnable = this.flatList?.getScroll?.();
    if (scrollEnable) {
      if (this.isUpMove && !this.flatList?.scrollEnd && !this.forceDrag) {
        return;
      }
      if (!this.isUpMove && this.flatList?.scrollYNow > 0 && !this.forceDrag) {
        return;
      }
      this.flatList?.enableScroll(false);
    }
    const heightIntBase = (this.heightInit || initHeight) + bar.navbarHeight;
    let scalce = (y - heightIntBase) / (this.maxHeightModal - heightIntBase);
    if (scalce <= 0) {
      scalce = 0;
    } else if (scalce >= 1) {
      scalce = 1;
    }
    this.detectMove = true;
    Animated.parallel([
      animatedTiming(this.animatedHeight, y, y > heightIntBase ? 15 : 0),
      animatedTiming(
        this.animatedBackdropHeight,
        y > heightIntBase ? appConnect.height : 0,
        0,
      ),
      animatedTiming(this.animatedBackdropOpacity, y / height - 0.4, 0, false),
      animatedTiming(this.heightDrag, scalce * maxHeightDrag, 0),
      animatedTiming(this.heightDragScale, scalce, 0),
    ]).start();
    if (y <= heightIntBase && !fullScreen) {
      toggleKeyboard?.(y, false);
    }
  };

  handleMoveEnd = () => {
    if (!this.detectMove) {
      return;
    }
    const scrollEnable = this.flatList?.getScroll?.();
    if (scrollEnable) {
      return;
    }
    if (!scrollEnable) {
      this.flatList?.enableScroll(true);
    }
    const yChange = this.animatedHeight._value;
    if (yChange >= (this.heightInit || initHeight)) {
      if (this.isUpMove) {
        this.handleOpenModal();
      } else {
        this.handleCloseInit();
      }
    } else {
      this.close();
    }
  };

  handleOpenModal = () => {
    Animated.parallel([
      animatedSpringLayout(this.animatedHeight, this.maxHeightModal),
      animatedSpringLayout(this.animatedBackdropOpacity, 0.5),
      animatedSpringLayout(this.heightDrag, maxHeightDrag),
      animatedSpringLayout(this.heightDragScale, 1),
    ]).start();
  };

  handleCloseInit = () => {
    const {fullScreen, toggleKeyboard} = this.props;
    let heightBase = this.heightInit || initHeight;
    if (fullScreen) {
      heightBase = 0;
      this.isOpen = false;
    }
    if (fullScreen) {
      animatedTiming(this.animatedBackdropHeight, 0).start();
      this.close();
    } else {
      toggleKeyboard?.(heightBase);
    }
    Animated.parallel([
      animatedSpringLayout(this.animatedHeight, heightBase + bar.navbarHeight),
      animatedSpringLayout(this.animatedBackdropOpacity, 0),
      animatedSpringLayout(this.heightDrag, 0),
      animatedSpringLayout(this.heightDragScale, 0),
    ]).start(({finished}) => {
      if (finished && !fullScreen) {
        animatedTiming(this.animatedBackdropHeight).start();
      }
    });
  };

  handleHideKeyboard = () => {
    animatedTiming(this.animatedBackdropHeight).start();
  };

  handleSelectImage = (
    image: any,
    callback?: any,
    type: 'add' | 'remove' = 'add',
  ) => {
    if (type === 'add') {
      this.buttonSelect?.setImage?.(image, callback);
    } else {
      this.buttonSelect?.removeImage?.(image, callback);
    }
  };

  onSubmit = (images: any[]) => {
    const {onSelectFinish} = this.props;
    onSelectFinish?.(images);
    this.close();
    Animated.parallel([
      animatedTiming(this.animatedBackdropHeight, 0),
      animatedSpringLayout(this.animatedHeight, 0),
      animatedSpringLayout(this.heightDrag, 0),
      animatedSpringLayout(this.heightDragScale, 0),
    ]).start();
  };

  handlePreview = (
    image: any,
    location: {pageX: number; pageY: number},
    size: number,
  ) => {
    this.previewImage?.handlePreview?.(image, location, size);
  };

  render() {
    const {width} = appConnect;
    const {permission} = this.state;
    const {
      fullScreen,
      backgroundColor = fullScreen ? '#000' : '#fff',
      spaceTopWhenFullScreen = bar.height - 10,
      colorText = fullScreen ? '#fff' : backgroundIconChat,
      description,
    } = this.props;
    const colorAlbum = fullScreen ? colorText : '#23071c';
    const paddingTop = fullScreen ? spaceTopWhenFullScreen : 8;

    return (
      <Fragment>
        <AnimatedBlur
          blurAmount={100}
          blurType={fullScreen ? 'light' : 'dark'}
          style={[
            styles.viewBackdrop,
            {
              height: this.animatedBackdropHeight,
              opacity: this.animatedBackdropOpacity,
              width,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.viewSelect,
            fullScreen ? {} : styles.shadow,
            {
              height: this.animatedHeight,
              opacity: this.opacityChild,
              width,
              backgroundColor,
            },
          ]}>
          <ViewMove onMove={this.handleMove} onMoveEnd={this.handleMoveEnd}>
            <View
              onTouchStart={() => (this.forceDrag = true)}
              onTouchEnd={() => (this.forceDrag = false)}
              style={[styles.previewDrag, {width, paddingTop}]}>
              {fullScreen ? null : (
                <View style={[styles.flexCenter, {width}]}>
                  <View style={styles.dropDrag} />
                </View>
              )}
              <Animated.View
                style={[
                  styles.viewListAlbum,
                  {
                    width,
                    height: this.heightDrag,
                    transform: [{scaleY: this.heightDragScale}],
                  },
                ]}>
                <Extension
                  ref={ref => (this.extension = ref)}
                  description={description}
                  colorAlbum={colorAlbum}
                  colorText={colorText}
                  handleCloseInit={this.handleCloseInit}
                  openAlbum={() => this.album?.open?.()}
                  permission={permission.isAuthorized}
                />
              </Animated.View>
            </View>
            {permission.isAuthorized ? (
              <FlatListImage
                handlePreview={this.handlePreview}
                onSelectImage={this.handleSelectImage}
                ref={ref => (this.flatList = ref)}
              />
            ) : null}
            <Suspense key="permission" fallback={null}>
              {!permission.isAuthorized ? (
                <Permission
                  handleAuthor={this.handleAuthor}
                  initPermission={permission.status === 'notDetermined'}
                />
              ) : null}
            </Suspense>
          </ViewMove>
        </Animated.View>
        <ButtonSelect
          onSubmit={this.onSubmit}
          ref={ref => (this.buttonSelect = ref)}
        />
        <Album
          onSelect={this.handleSelectAlbum}
          colorAlbum={colorAlbum}
          color={colorText}
          backgroundColor={backgroundColor}
          ref={ref => (this.album = ref)}
        />
        <PreviewImage ref={ref => (this.previewImage = ref)} />
        <KeyboardListener
          onWillHide={this.handleHideKeyboard}
          onWillShow={this.handleShowKeyboard}
        />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  viewBackdrop: {
    position: 'absolute',
    bottom: 0,
  },
  viewSelect: {
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
    paddingBottom: bar.navbarHeight,
  },
  shadow: {
    borderTopWidth: 2,
    borderTopColor: '#f8f8f8',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  previewDrag: {
    paddingVertical: 8,
    overflow: 'hidden',
  },
  dropDrag: {
    backgroundColor: '#a6a6a6',
    opacity: 0.7,
    height: 5,
    width: 40,
    borderRadius: 8,
  },
  flexCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgroundWhite: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flex: 1,
  },
  textCenter: {
    textAlign: 'center',
    color: '#2b1624',
  },
  viewListAlbum: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 1,
    overflow: 'hidden',
  },
});

export interface SImage extends SelectImage {}

export default SelectImage;
