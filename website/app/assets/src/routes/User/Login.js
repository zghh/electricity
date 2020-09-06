import React, { Component } from 'react';
import { connect } from 'dva';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import Login from 'components/Login';
import styles from './Login.less';
import { Button } from 'antd';
import { routerRedux } from 'dva/router';

const { UserName, Password, Submit } = Login;

const messages = defineMessages({
  button: {
    login: {
      id: 'Login.Button.Login',
      defaultMessage: 'Login',
    },
    register: {
      id: 'Login.Button.Register',
      defaultMessage: 'Register',
    },
  },
  placeholder: {
    username: {
      id: 'Login.Placeholder.Username',
      defaultMessage: 'Username',
    },
    password: {
      id: 'Login.Placeholder.Password',
      defaultMessage: 'Password',
    },
  },
})

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  handleSubmit = (err, values) => {
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          ...values,
        },
      });
    }
  };

  onClick = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/user/register',
      })
    );
  }

  render() {
    const { submitting, intl } = this.props;
    return (
      <div className={styles.main}>
        <Login onSubmit={this.handleSubmit}>
          <UserName name="username" placeholder={intl.formatMessage(messages.placeholder.username)} />
          <Password name="password" placeholder={intl.formatMessage(messages.placeholder.password)} />
          <Submit loading={submitting}><FormattedMessage {...messages.button.login} /></Submit>
          <Button type="primary" size="large" onClick={this.onClick} block><FormattedMessage {...messages.button.register} /></Button>
        </Login>
      </div>
    );
  }
}

export default injectIntl(LoginPage);
