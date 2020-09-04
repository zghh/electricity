import React, { PureComponent } from 'react';
import { Card, Form, Input, Button, Select, message, InputNumber } from 'antd';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import pathToRegexp from 'path-to-regexp';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

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
      message.success(`Create order successfully.`);
      this.props.dispatch(
        routerRedux.push({
          pathname: '/order/current',
        })
      );
    } else {
      message.error(`Create order failed.`);
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
        title="Create New Order"
      >
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="Type">
              {getFieldDecorator('type', {
                initialValue: type,
              })(<Select disabled>
                <Select.Option value="seller">Seller</Select.Option>
                <Select.Option value="buyer">Buyer</Select.Option>
              </Select>)}
            </FormItem>
            <FormItem {...formItemLayout} label="Energy Type">
              {getFieldDecorator('energyType', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message: 'Must input energy type of order',
                  },
                ],
              })(<Input placeholder="Energy Type" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Price">
              {getFieldDecorator('price', {
                initialValue: 10,
              })(<InputNumber min={1} max={1000000} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Amount">
              {getFieldDecorator('amount', {
                initialValue: 100,
              })(<InputNumber min={1} max={1000000} />)}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button loading={loading} type="primary" htmlType="submit">
                Submit
              </Button>
              <Button onClick={this.clickCancel} style={{ marginLeft: 8 }}>
                Cancel
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }

}

export default injectIntl(NewOrder);