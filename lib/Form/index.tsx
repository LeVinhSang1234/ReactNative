import React, {ReactChild, Fragment, Component} from 'react';
import {
  View,
  StyleSheet,
  NativeEventEmitter,
  ViewStyle,
  Text,
} from 'react-native';
import {translate} from '../../translate';

const form: any = {
  ref: {},
  value: {},
  touched: {},
  validateFirst: false,
};

export interface IErrorForm {
  [key: string]: any;
}

export interface IValueForm {
  [key: string]: any;
}

export interface FormHandle {
  setFieldsValue: (value: any, errors?: any) => void;
  setFieldValue: (
    key: string,
    value?: any,
    error?: ReactChild | undefined,
  ) => void;
  getFieldValue: (field: string) => any;
  getFieldsValue: (fields: string[]) => any;
  validateFields: (
    calback: (err?: IErrorForm, values?: IValueForm) => any,
    data?: {fields?: string[]; excepts?: string[]},
  ) => Promise<any>;
  resetFields: (fields?: any, errors?: any) => void;
  setFieldError: (field: string, error?: any) => void;
  getTouched: (field?: string) => any;
}

const handle: any = {};
const handleForm: FormHandle = {
  setFieldsValue: () => null,
  setFieldValue: () => null,
  getFieldValue: () => undefined,
  getFieldsValue: () => {},
  validateFields: async () => undefined,
  resetFields: () => undefined,
  setFieldError: () => undefined,
  getTouched: () => undefined,
};

let errors: any = {};

const styles = StyleSheet.create({
  label: {},
  Viewlabel: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotRequired: {
    color: '#ff4d4f',
    marginRight: 4,
  },
  dotRequiredAfter: {
    color: '#ff4d4f',
    marginRight: 2,
    marginLeft: 2,
  },
  layoutForm: {
    flexDirection: 'row',
  },
  styleSpanCol: {
    minHeight: 34,
    paddingTop: 8.5,
    paddingBottom: 8.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  error: {
    minHeight: 22,
    fontSize: 12,
    color: '#ff4d4f',
    lineHeight: 16,
    paddingBottom: 5,
  },
});

interface IPropsItem {
  children?: any;
  defaultValue?: any;
  checked?: boolean;
  name: string;
  onBlurInput?: any;
  onBlur?: any;
  onParseField?: (v?: any, callback?: any) => any;
  onChange?: (v: any, name: string) => any;
  value?: any;
  onPress?: (v?: any, key?: any) => any;
  rule?: {
    whitespace?: boolean;
    required?: boolean;
    message?: any;
    validator?: (v: any, callback: (v?: any) => any, touched?: any) => any;
    trigger?: 'onChange' | 'blur';
  };
  validateFirst?: (v?: any) => any;
  onValueChange?: (v?: any, key?: string) => any;
  onChangeText?: (v?: any, name?: string) => any;
  onChangeInput?: (v?: any, key?: any) => any;
  label?: any;
  colon?: string;
  dotRequired?: string;
  formItemLayout?: {
    labelCol: {
      xs: number;
      sm: number;
    };
    wrapperCol: {
      xs: number;
      sm: number;
    };
  };
}

interface IStateItem {
  valueState: {value: any; error: any};
  initialValues: {value: any; error: any};
}

class Item extends Component<IPropsItem, IStateItem> {
  constructor(props: IPropsItem) {
    super(props);
    const {value, defaultValue, validateFirst, name} = props;
    const initialValues = {value: value || defaultValue, error: undefined};
    this.state = {
      valueState: {value: value || defaultValue, error: undefined},
      initialValues,
    };
    this.handleRemapItem(props);
    if (name && validateFirst) {
      form.ref[name](initialValues.value);
    }
  }

  shouldComponentUpdate(nProps: IPropsItem, nState: IStateItem) {
    const {label, children} = this.props;
    const {valueState} = this.state;
    return (
      label !== nProps.label ||
      valueState !== nState.valueState ||
      children !== nProps.children
    );
  }

  componentWillUnmount() {
    const {name} = this.props;
    delete errors[name];
    delete form.ref[name];
    delete form.value[name];
    delete form.touched[name];
  }

  handleRemapItem = (props: IPropsItem) => {
    const {
      name,
      onParseField,
      defaultValue,
      onChangeInput,
      rule = {},
      label,
    } = props;
    if (name && onParseField) {
      onParseField(name, defaultValue);
      form.ref[name] = (
        val: string | undefined = undefined,
        error: string,
        detectValidate?: boolean,
      ) => {
        const {initialValues} = this.state;
        const {value} = this.props;
        if (!detectValidate && onChangeInput) {
          onChangeInput(val);
        }
        if ((val || '') !== (initialValues.value || '')) {
          form.touched[name] = true;
        } else {
          form.touched[name] = false;
        }
        const newValue = {...value, value: val};
        let v = val;
        if (rule.whitespace && v && typeof v === 'string') {
          v = v.trim();
        }
        if (error) {
          newValue.error = error;
        } else if (rule.required && !v) {
          if (rule.message) {
            newValue.error = rule.message;
          } else if (!label) {
            newValue.error = translate({
              id: 'field.validate.required',
              defaultMessage: 'Field is required',
            });
          } else {
            newValue.error = translate({
              id: 'field.validate.required_with_name',
              defaultMessage: '{name} is required',
              value: {name: label},
            });
          }
        } else if (
          rule.validator &&
          typeof rule.validator === 'function' &&
          (rule.trigger === 'onChange' || !rule.trigger || detectValidate)
        ) {
          rule.validator(
            v,
            (message: string | undefined) => {
              newValue.error = message;
            },
            form.touched,
          );
        }
        if (newValue.error) {
          if (errors[name] !== newValue.error) {
            errors[name] = newValue.error;
          }
        } else {
          delete errors[name];
        }
        this.setState({valueState: newValue});
      };
    }
  };

  renderWithLabel = (
    styleForm: object | undefined,
    styleSpanCol: object | undefined,
    styleSpanWrapCol: object | undefined,
  ) => {
    const {
      dotRequired,
      rule = {},
      label,
      name,
      colon,
      children,
      onChange,
      onPress,
      onChangeText,
      onValueChange,
      onBlur,
      onBlurInput,
    } = this.props;
    const {valueState} = this.state;
    return (
      <View style={styleForm}>
        <View style={styleSpanCol}>
          <View style={styles.Viewlabel}>
            {rule.required && dotRequired === 'before' ? (
              <Text style={styles.dotRequired}>*</Text>
            ) : null}
            {typeof label === 'string' ? (
              <Text style={styles.label}>{label}</Text>
            ) : (
              label
            )}
            {rule.required && dotRequired === 'after' ? (
              <Text style={styles.dotRequiredAfter}>*</Text>
            ) : null}
            <Text>{colon ? ':' : ''}</Text>
          </View>
        </View>
        <View style={styleSpanWrapCol}>
          {{
            ...children,
            props: {
              ...children.props,
              onChange: (v: string) => onChange?.(v, name),
              value: valueState.value,
              error: valueState.error,
              onPress: (e: NativeEventEmitter) =>
                onPress?.(e, children.props.onPress),
              onValueChange: (e: NativeEventEmitter) =>
                onValueChange?.(e, name),
              onChangeText: (e: NativeEventEmitter) => onChangeText?.(e, name),
              checked: !!valueState.value,
              onBlur: (e: NativeEventEmitter) => {
                if (typeof onBlur === 'function') {
                  onBlur(e);
                }
                if (
                  typeof onBlurInput === 'function' &&
                  rule.trigger === 'blur'
                ) {
                  onBlurInput(name, valueState.value);
                }
              },
            },
          }}
          <Text style={styles.error}>{valueState.error}</Text>
        </View>
      </View>
    );
  };

  render() {
    const {
      children,
      name,
      onChange,
      onPress = () => null,
      rule = {},
      onValueChange,
      onChangeText,
      label,
      onBlurInput,
      onBlur,
    } = this.props;
    const {valueState} = this.state;

    if (label) {
      return this.renderWithLabel(undefined, undefined, undefined);
    }

    return (
      <Fragment>
        {{
          ...children,
          props: {
            ...children.props,
            onChange: (v: string) => onChange?.(v, name),
            value: valueState.value,
            error: valueState.error,
            onPress: (e: NativeEventEmitter) =>
              onPress(e, children.props.onPress),
            onValueChange: (e: NativeEventEmitter) => onValueChange?.(e, name),
            onChangeText: (e: NativeEventEmitter) => onChangeText?.(e, name),
            checked: !!valueState.value,
            onBlur: (e: NativeEventEmitter) => {
              if (typeof onBlur === 'function') {
                onBlur(e);
              }
              if (
                typeof onBlurInput === 'function' &&
                rule.trigger === 'blur'
              ) {
                onBlurInput(name, valueState.value);
              }
            },
          },
        }}
        <Text style={styles.error}>{valueState.error}</Text>
      </Fragment>
    );
  }
}

interface IPropsForm {
  initialValues?: {
    [key: string]: any;
  };
  children: any;
  validateFirst?: (v?: any) => any;
  style?: ViewStyle;
  colon?: boolean;
  formItemLayout?: {
    labelCol: {
      xs: number;
      sm: number;
    };
    wrapperCol: {
      xs: number;
      sm: number;
    };
  };
  dotRequired?: 'before' | 'after';
}

class Form extends Component<IPropsForm> {
  static useForm: () => FormHandle;
  static Item: (props: IPropsItem) => JSX.Element;
  static create: () => (WrapComponent: any) => (props: any) => JSX.Element;
  constructor(props: IPropsForm) {
    super(props);
    this.initApp();
  }

  initApp = async () => {
    const {
      initialValues = {},
      validateFirst,
      colon,
      formItemLayout,
      dotRequired = 'after',
    } = this.props;
    handle.onChange = this.onChange;
    handle.onBlurInput = this.onBlurInput;
    handle.onValueChange = this.onChange;
    handle.onParseField = this.onParseField;
    handle.onPress = this.onPress;
    handle.colon = colon;
    handle.formItemLayout = formItemLayout;
    handle.dotRequired = dotRequired;
    handleForm.setFieldsValue = this.setFieldsValue;
    handleForm.setFieldValue = this.setFieldValue;
    handleForm.getFieldValue = this.getFieldValue;
    handleForm.getFieldsValue = this.getFieldsValue;
    handleForm.validateFields = this.validateFields;
    handleForm.setFieldError = this.setFieldError;
    handleForm.resetFields = this.resetFields;
    handleForm.getTouched = this.getTouched;
    form.validateFirst = validateFirst;
    const data = Object.keys(initialValues).map(
      async key => (form.value[key] = initialValues[key]),
    );
    await Promise.all(data);
  };

  onChange = (v: any, name: string, error?: string) => {
    form.value[name] = v;
    if (typeof form.ref[name] === 'function') {
      form.ref[name](v, error);
    }
  };

  onBlurInput = (name: string, v: any) => {
    form.ref[name]?.(v, undefined, true);
  };

  onParseField = (name: string, value?: any) => {
    const {initialValues} = this.props;
    if (value !== undefined || initialValues?.[name] !== undefined) {
      form.value[name] = value || initialValues?.[name];
    } else {
      form.value[name] = initialValues?.[name];
    }
  };

  onPress = (e: NativeEventEmitter, func: any) => {
    if (typeof func === 'function') {
      func(e, {
        value: form.value,
        erorrs: Object.keys(errors).map(key => ({[key]: errors[key]})),
      });
    }
  };

  setFieldsValue = async (values: any, errorsValue: any = {}) => {
    const promise = Object.keys(values).map(async key => {
      if (typeof form.ref[key] === 'function') {
        form.value[key] = values[key];
        return this.onChange(values[key], key, errorsValue[key]);
      }
    });
    await Promise.all(promise);
  };

  setFieldValue(key: string, value: any, error: any) {
    form.value[key] = value;
    if (typeof form.ref[key] === 'function') {
      form.ref[key](value, error);
    }
  }

  getFieldValue = (key: string) => {
    return form.value[key];
  };

  getFieldsValue = () => {
    return form.value;
  };

  validateFields = async (
    calback: (err?: IErrorForm[], v?: IValueForm) => any,
    custom?: {fields?: string[]; excepts?: string[]},
  ) => {
    const {fields = Object.keys(form.value), excepts} = custom || {};
    const promise = fields.map(async key => {
      if (typeof form.ref[key] === 'function') {
        return form.ref[key](form.value[key], undefined, true);
      }
    });
    await Promise.all(promise);
    let arrayKeys = Object.keys(errors);
    if (excepts && excepts.length) {
      arrayKeys = arrayKeys.filter((key: string) => !excepts.includes(key));
    }
    let errorArr: {[key: string]: any}[] | undefined = arrayKeys.map(
      (key: string) => ({
        [key]: errors[key],
      }),
    );
    if (!errorArr.length) {
      errorArr = undefined;
    }
    if (calback && typeof calback === 'function') {
      calback(errorArr, form.value);
    }
  };

  setFieldError = (field: string, error?: string) => {
    if (typeof form.ref[field] === 'function') {
      form.ref[field](form.value[field], error);
    }
  };

  resetFields = async (
    fields: any[] = Object.keys(form.value),
    errorsValue: any = {},
  ) => {
    const promise = fields.map(async key => {
      return this.onChange(undefined, key, errorsValue[key]);
    });
    await Promise.all(promise);
  };

  getTouched = (field?: string) => {
    if (!field) {
      return form.touched;
    }
    return form.touched?.[field];
  };

  render() {
    const {style, children} = this.props;
    return <View style={style}>{children}</View>;
  }
}

Form.useForm = (): FormHandle => {
  return handleForm;
};

Form.Item = (props: IPropsItem) => {
  return (
    <Item
      {...props}
      onChange={handle.onChange}
      onChangeText={handle.onChange}
      onValueChange={handle.onValueChange}
      onChangeInput={props.onChange}
      onParseField={handle.onParseField}
      onPress={handle.onPress}
      value={form[props.name] || props.defaultValue}
      validateFirst={form.validateFirst}
      colon={handle.colon}
      dotRequired={handle.dotRequired}
      formItemLayout={handle.formItemLayout}
      onBlurInput={handle.onBlurInput}
    />
  );
};

Form.create = () => {
  return (WrapComponent: any) => (props: any) => {
    return <WrapComponent {...props} form={handleForm} />;
  };
};

export default Form;
