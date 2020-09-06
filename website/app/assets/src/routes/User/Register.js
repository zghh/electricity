import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './Register.less';
import { Form, Input, Button, Select, message, Icon } from 'antd';
import { routerRedux } from 'dva/router';
import { IntlProvider, defineMessages, injectIntl } from 'react-intl';
import { getLocale } from "../../utils/utils";

const FormItem = Form.Item;

const currentLocale = getLocale();
const intlProvider = new IntlProvider(
  { locale: currentLocale.locale, messages: currentLocale.messages },
  {}
);
const { intl } = intlProvider.getChildContext();
const messages = defineMessages({
  username: {
    id: 'Register.Username',
    defaultMessage: 'Username',
  },
  password: {
    id: 'Register.Password',
    defaultMessage: 'Password',
  },
  confirmPassword: {
    id: 'Register.ConfirmPassword',
    defaultMessage: 'ConfirmPassword',
  },
  name: {
    id: 'Register.Name',
    defaultMessage: 'Name',
  },
  normal: {
    id: 'Register.Normal',
    defaultMessage: 'Normal',
  },
  productive: {
    id: 'Register.Productive',
    defaultMessage: 'Productive',
  },
  traditional: {
    id: 'Register.Traditional',
    defaultMessage: 'Traditional',
  },
  submit: {
    id: 'Register.Submit',
    defaultMessage: 'Submit',
  },
  back: {
    id: 'Register.Back',
    defaultMessage: 'Back',
  },
  usernameMessage: {
    id: 'Register.UsernameMessage',
    defaultMessage: 'Please input username!',
  },
  passwordMessage: {
    id: 'Register.PasswordMessage',
    defaultMessage: 'Please input password!',
  },
  confirmPasswordMessage: {
    id: 'Register.ConfirmPasswordMessage',
    defaultMessage: 'Two passwords that you enter is inconsistent!',
  },
  nameMessage: {
    id: 'Register.NameMessage',
    defaultMessage: 'Please input name!',
  },
  successMessage: {
    id: 'Register.SuccessMessage',
    defaultMessage: 'Register successfully.',
  },
  failMessage: {
    id: 'Register.FailMessage',
    defaultMessage: 'Register failed.',
  },
})

@connect(({ register, loading }) => ({
  register,
  submitting: loading.effects['register/register'],
}))
@Form.create()
class RegisterPage extends Component {

  submitCallback = ({ payload, success }) => {
    if (success) {
      message.success(intl.formatMessage(messages.successMessage));
      this.props.dispatch(
        routerRedux.push({
          pathname: '/',
        })
      );
    } else {
      message.error(intl.formatMessage(messages.failMessage));
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'register/register',
          payload: {
            ...values,
            callback: this.submitCallback,
          },
        })
      }
    });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(intl.formatMessage(messages.confirmPasswordMessage));
    } else {
      callback();
    }
  };

  onClick = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/',
      })
    );
  };

  render() {
    const { submitting, intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit} hideRequiredMark>
          <FormItem>
            {getFieldDecorator('username', {
              rules: [
                {
                  required: true,
                  message: intl.formatMessage(messages.usernameMessage),
                },
              ],
            })(<Input placeholder={intl.formatMessage(messages.username)} prefix={<Icon type="user" className={styles.prefixIcon} />} size='large' />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: intl.formatMessage(messages.passwordMessage),
                },
              ],
            })(<Input.Password placeholder={intl.formatMessage(messages.password)} prefix={<Icon type="lock" className={styles.prefixIcon} />} size='large' />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('confirmPassword', {
              rules: [
                {
                  required: true,
                  message: intl.formatMessage(messages.passwordMessage),
                },
                {
                  validator: this.compareToFirstPassword,
                },
              ],
            })(<Input.Password placeholder={intl.formatMessage(messages.confirmPassword)} prefix={<Icon type="lock" className={styles.prefixIcon} />} size='large' />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: intl.formatMessage(messages.nameMessage),
                },
              ],
            })(<Input placeholder={intl.formatMessage(messages.name)} prefix={<Icon type="idcard" className={styles.prefixIcon} />} size='large' />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('type', {
              initialValue: 'normal',
            })(<Select size='large' >
              <Select.Option value="normal" >{intl.formatMessage(messages.normal)}</Select.Option>
              <Select.Option value="productive"  >{intl.formatMessage(messages.productive)}</Select.Option>
              <Select.Option value="traditional">{intl.formatMessage(messages.traditional)}</Select.Option>
            </Select>)}
          </FormItem>
          <FormItem>
            <Button loading={submitting} type="primary" htmlType="submit" size='large' block>
              {intl.formatMessage(messages.submit)}
            </Button>
          </FormItem>
          <FormItem>
            <Button onClick={this.onClick} type="primary" size='large' block>
              {intl.formatMessage(messages.back)}
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default injectIntl(RegisterPage);
