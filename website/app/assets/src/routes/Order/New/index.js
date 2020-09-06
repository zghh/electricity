import React, { PureComponent } from 'react';
import { Card, Form, Input, Button, Select, message, InputNumber } from 'antd';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import pathToRegexp from 'path-to-regexp';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { IntlProvider, defineMessages } from 'react-intl';
import { getLocale } from "../../../utils/utils";

const currentLocale = getLocale();
const intlProvider = new IntlProvider(
  { locale: currentLocale.locale, messages: currentLocale.messages },
  {}
);
const { intl } = intlProvider.getChildContext();
const messages = defineMessages({
  title: {
    id: 'Title.NewOrder',
    defaultMessage: 'Create New Order',
  },
  type: {
    id: 'Order.New.Type',
    defaultMessage: 'Order Type',
  },
  seller: {
    id: 'Order.New.Seller',
    defaultMessage: 'Seller',
  },
  buyer: {
    id: 'Order.New.Buyer',
    defaultMessage: 'Buyer',
  },
  energyType: {
    id: 'Order.New.EnergyType',
    defaultMessage: 'Energy Type',
  },
  energyTypeMessage: {
    id: 'Order.New.EnergyTypeMessage',
    defaultMessage: 'Must input energy type of order',
  },
  price: {
    id: 'Order.New.Price',
    defaultMessage: 'Price',
  },
  amount: {
    id: 'Order.New.Amount',
    defaultMessage: 'Amount',
  },
  submit: {
    id: 'Order.New.Submit',
    defaultMessage: 'Submit',
  },
  cancel: {
    id: 'Order.New.Cancel',
    defaultMessage: 'Cancel',
  },
  successMessage: {
    id: 'Order.New.SuccessMessage',
    defaultMessage: 'Create order successfully.',
  },
  failMessage: {
    id: 'Order.New.FailMessage',
    defaultMessage: 'Create order failed.',
  },
});

const FormItem = Form.Item;

@connect(({ order, loading }) => ({
  order,
  loading: loading.effects['order/new'],
}))
@Form.create()
class NewOrder extends PureComponent {
  static contextTypes = {
    routes: PropTypes.array,
    params: PropTypes.object,
    location: PropTypes.object,
  };
  state = {
    submitting: false,
    type: 'seller',
  };
  componentDidMount() {
    const { location } = this.props;
    const info = pathToRegexp('/order/new/:type').exec(location.pathname);
    if (info) {
      const type = info[1];
      if (type === 'buyer') {
        this.setState({
          type: type,
        });
      }
    }
  }
  submitCallback = ({ payload, success }) => {
    if (success) {
      message.success(intl.formatMessage(messages.successMessage));
      this.props.dispatch(
        routerRedux.push({
          pathname: '/order/current',
        })
      );
    } else {
      message.error(intl.formatMessage(messages.failMessage));
    }
  };
  clickCancel = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/order/current',
      })
    );
  };
  handleSubmit = e => {
    const { type } = this.state;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'order/new',
          payload: {
            type: type,
            ...values,
            userId: window.id,
            callback: this.submitCallback,
          },
        })
      }
    });
  };

  render() {
    const { type } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <PageHeaderLayout
        title={intl.formatMessage(messages.title)}
      >
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label={intl.formatMessage(messages.type)}>
              {getFieldDecorator('type', {
                initialValue: type,
              })(<Select disabled>
                <Select.Option value="seller">{intl.formatMessage(messages.seller)}</Select.Option>
                <Select.Option value="buyer">{intl.formatMessage(messages.buyer)}</Select.Option>
              </Select>)}
            </FormItem>
            <FormItem {...formItemLayout} label={intl.formatMessage(messages.energyType)}>
              {getFieldDecorator('energyType', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage(messages.energyTypeMessage),
                  },
                ],
              })(<Input placeholder={intl.formatMessage(messages.energyType)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={intl.formatMessage(messages.price)}>
              {getFieldDecorator('price', {
                initialValue: 10,
              })(<InputNumber min={1} max={1000000} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={intl.formatMessage(messages.amount)}>
              {getFieldDecorator('amount', {
                initialValue: 100,
              })(<InputNumber min={1} max={1000000} />)}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button loading={loading} type="primary" htmlType="submit">
                {intl.formatMessage(messages.submit)}
              </Button>
              <Button onClick={this.clickCancel} style={{ marginLeft: 8 }}>
                {intl.formatMessage(messages.cancel)}
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }

}

export default injectIntl(NewOrder);