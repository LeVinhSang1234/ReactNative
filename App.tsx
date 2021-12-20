import React, {Component} from 'react';
import {Dimensions, LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import Pages from './pages';
import {Lang} from './sagas/models/language';
import {IScreen} from './sagas/models/screen';

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
  state = {loading: true};

  UNSAFE_componentWillReceiveProps(nProps: IProps) {
    appConnect.language = nProps.language.lang;
  }

  handleLayout = ({nativeEvent}: LayoutChangeEvent) => {
    const {layout} = nativeEvent;
    const {language} = this.props;
    appConnect = {
      ...layout,
      language: language.lang,
    };
    this.setState({loading: false});
  };

  render() {
    const {loading} = this.state;
    return (
      <View style={styles.flex} onLayout={this.handleLayout}>
        {loading ? null : <Pages />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {flex: 1},
});

export {appConnect};

export default connect(({language}: any) => ({language}))(App);
