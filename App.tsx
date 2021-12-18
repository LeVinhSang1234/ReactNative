import React, {Component} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import Pages from './pages';
import {IScreen} from './sagas/models/screen';

interface IProps {
  screen: IScreen;
  dispatch: Dispatch;
}

class App extends Component<IProps> {
  handleLayout = ({nativeEvent}: LayoutChangeEvent) => {
    const {layout} = nativeEvent;
    const {dispatch} = this.props;
    dispatch({
      type: 'screen/change',
      payload: {screen: layout, loading: false},
    });
  };

  render() {
    const {screen} = this.props;
    const {loading} = screen;
    return (
      <View style={styles.flex} onLayout={this.handleLayout}>
        {loading ? null : <Pages />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

export default connect(({screen, language}: any) => ({
  screen,
  language,
}))(App);
