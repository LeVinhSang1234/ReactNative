import {appConnect} from '@/App';
import React, {Component, ReactNode} from 'react';
import {FlatList} from 'react-native';
import PreImage from '../PreImage';

interface IProps {
  onSelectImage?: (i: any, callback?: any, type?: 'add' | 'remove') => any;
  handlePreview?: (
    image: any,
    location: {pageX: number; pageY: number},
    size: number,
  ) => any;
}

interface IState {
  scrollEnable: boolean;
  photos: any[];
}

class FlatListImage extends Component<IProps, IState> {
  flatList?: FlatList<any> | null;
  scrollYNow: any;
  scrollEnd: any;
  constructor(props: IProps) {
    super(props);
    this.state = {scrollEnable: true, photos: []};
  }

  shouldComponentUpdate(_nProps: IProps, nState: IState) {
    const {scrollEnable, photos} = this.state;
    return scrollEnable !== nState.scrollEnable || photos !== nState.photos;
  }

  enableScroll = (flag?: boolean) => {
    this.setState({scrollEnable: !!flag});
  };

  getScroll = () => {
    const {scrollEnable} = this.state;
    return scrollEnable;
  };

  handleScroll = ({nativeEvent}: any) => {
    const {contentOffset} = nativeEvent;
    this.scrollYNow = contentOffset.y;
    this.scrollEnd = this.isScrollEnd(nativeEvent);
  };

  isScrollEnd = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 0;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  onSelect = (image: any, callback?: any, type?: 'add' | 'remove') => {
    const {onSelectImage} = this.props;
    onSelectImage?.(image, callback, type);
  };

  renderItem = ({item}: any) => {
    const {handlePreview} = this.props;
    return (
      <PreImage
        handlePreview={handlePreview}
        onSelect={this.onSelect}
        image={item}
      />
    );
  };

  scrollToOffset = (config: any) => {
    this.flatList?.scrollToOffset?.(config);
  };

  setPhotos = (photos: any[]) => {
    this.setState({photos});
  };

  getPhotos = () => {
    const {photos} = this.state;
    return photos;
  };

  render(): ReactNode {
    const {scrollEnable, photos} = this.state;
    const {width} = appConnect;

    return (
      <FlatList
        getItemLayout={(_data, index) => ({
          length: width / 4 - 2,
          offset: (width / 4 - 2) * index,
          index,
        })}
        bounces={scrollEnable}
        ref={ref => (this.flatList = ref)}
        scrollEnabled={scrollEnable}
        numColumns={4}
        onScroll={this.handleScroll}
        scrollEventThrottle={16}
        data={photos}
        renderItem={this.renderItem}
        keyExtractor={item => item.localIdentifier}
      />
    );
  }
}

export default FlatListImage;
