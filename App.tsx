import React, {Component} from 'react';
import {Dimensions, LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import Spin from './lib/Spin';
import Pages from './pages';
import {Lang} from './sagas/models/language';
import {IScreen} from './sagas/models/screen';

export const ScreenProvider = React.createContext({
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
});

interface IProps {
  screen: IScreen;
  dispatch: Dispatch;
  language: Lang;
}
interface IAppConnect {
  width: number;
  height: number;
  language: string;
}

let appConnect: IAppConnect = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
  language: 'en',
};

interface IState {
  loading: boolean;
}

class App extends Component<IProps, IState> {
  timeout?: NodeJS.Timeout;
  constructor(props: IProps) {
    super(props);
    this.state = {loading: true};
  }

  UNSAFE_componentWillReceiveProps(nProps: IProps) {
    appConnect.language = nProps.language.lang;
  }

  handleLayout = ({nativeEvent}: LayoutChangeEvent) => {
    this.setState({loading: true});
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.timeout = setTimeout(() => {
      const {layout} = nativeEvent;
      const {language, dispatch} = this.props;
      appConnect = {
        ...layout,
        language: language.lang,
      };
      dispatch({
        type: 'screen/change',
        payload: {screen: layout},
        callback: () => {
          this.timeout = undefined;
          this.setState({loading: false});
        },
      });
    }, 300);
  };

  render() {
    const {loading} = this.state;
    const {screen} = this.props;
    return (
      <ScreenProvider.Provider value={screen.screen}>
        <View style={styles.flex} onLayout={this.handleLayout}>
          {loading ? <Spin spinning /> : <Pages />}
        </View>
      </ScreenProvider.Provider>
    );
  }
}

const styles = StyleSheet.create({
  flex: {flex: 1},
});

export {appConnect};

export default connect(({language, screen}: any) => ({language, screen}))(App);
