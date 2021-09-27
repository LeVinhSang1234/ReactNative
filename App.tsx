import React, {Component} from 'react';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Button from './lib/Button';
import Form, {FormHandle} from './lib/Form';
import Input from './lib/Input';
import Message, {IMessage} from './lib/Message';
import Spin from './lib/Spin';

interface IProps {
  form: FormHandle;
  message: IMessage;
}

class App extends Component<IProps> {
  render() {
    const {form, message} = this.props;
    return (
      <Spin backgroundColor="#fff">
        <SafeAreaView>
          <View style={{padding: 16}}>
            <Form>
              <Form.Item name="input" label="test" rule={{required: true}}>
                <Input />
              </Form.Item>
            </Form>
            <Button
              text="Submit"
              onClick={() => {
                form.validateFields((err, values) => {
                  if (err) {
                    message.error({content: err[0].input});
                  }
                  console.log(err, values);
                });
              }}
            />
          </View>
        </SafeAreaView>
      </Spin>
    );
  }
}

export default Message.create()(Form.create()(App));
