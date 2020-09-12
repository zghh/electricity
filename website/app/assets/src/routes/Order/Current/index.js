import React, { PureComponent } from 'react';
import { Card, Button, Icon, Table } from 'antd';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { IntlProvider, defineMessages } from 'react-intl';
import { getLocale } from "../../../utils/utils";

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';

const format = require("string-format");
format.extend(String.prototype);

const currentLocale = getLocale();
const intlProvider = new IntlProvider(
  { locale: currentLocale.locale, messages: currentLocale.messages },
  {}
);
const { intl } = intlProvider.getChildContext();
const messages = defineMessages({
  title: {
    id: 'Title.CurrentOrders',
    defaultMessage: 'Current Order List',
  },
  content: {
    id: 'Content.CurrentOrders',
    defaultMessage: 'You can view the current orders here.',
  },
  sellerOrderList: {
    id: 'Order.CurrentOrders.SellerOrderList',
    defaultMessage: 'Seller Order List',
  },
  buyerOrderList: {
    id: 'Order.CurrentOrders.BuyerOrderList',
    defaultMessage: 'Buyer Order List',
  },
  orderId: {
    id: 'Order.CurrentOrders.OrderId',
    defaultMessage: 'Order Id',
  },
  userId: {
    id: 'Order.CurrentOrders.UserId',
    defaultMessage: 'User Id',
  },
  energyType: {
    id: 'Order.CurrentOrders.EnergyType',
    defaultMessage: 'Energy Type',
  },
  price: {
    id: 'Order.CurrentOrders.Price',
    defaultMessage: 'Price',
  },
  amount: {
    id: 'Order.CurrentOrders.Amount',
    defaultMessage: 'Amount',
  },
  time: {
    id: 'Order.CurrentOrders.Time',
    defaultMessage: 'Time',
  },
  new: {
    id: 'Order.CurrentOrders.New',
    defaultMessage: 'New',
  },
});

@connect(({ order, loading }) => ({
  order,
  loading: loading.effects['order/fetchCurrentOrders'],
}))
export default class CurrentOrders extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'order/fetchCurrentOrders',
    })
  }

  onNewOrder = (type) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({
      pathname: `/order/new/${type}`,
    }));
  };

  render() {
    const { order: { sellerOrders, buyerOrders }, loading } = this.props;
    const dataColumns = [
      {
        title: intl.formatMessage(messages.orderId),
        dataIndex: 'orderId',
        key: 'orderId',
        render: text => (
          <Link to={'/order/detail/{id}'.format({ id: text })}>{text}</Link>
        ),
      },
      {
        title: intl.formatMessage(messages.userId),
        dataIndex: 'userId',
        key: 'userId',
      },
      {
        title: intl.formatMessage(messages.energyType),
        dataIndex: 'energyType',
        key: 'energyType',
      },
      {
        title: intl.formatMessage(messages.price),
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: intl.formatMessage(messages.amount),
        dataIndex: 'remainAmount',
        key: 'remainAmount',
      },
      {
        title: intl.formatMessage(messages.time),
        dataIndex: 'time',
        key: 'time',
        render: text => (
          <div>{moment(text * 1000).format('YYYY-MM-DD HH:mm:ss')}</div>
        ),
      },
    ];


    const content = (
      <div className={styles.pageHeaderContent}>
        <p>
          {intl.formatMessage(messages.content)}
        </p>
      </div>
    );

    const extraContent = (
      <div className={styles.extraImg}>
        <QueueAnim>
          <Icon key="current-orders" type="form" style={{ fontSize: 80 }} />
        </QueueAnim>
      </div>
    );

    return (
      <PageHeaderLayout title={intl.formatMessage(messages.title)} content={content} extraContent={extraContent}>
        <Card
          title={intl.formatMessage(messages.sellerOrderList)}
          bordered={false}
        >
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onNewOrder('seller')}>
                {intl.formatMessage(messages.new)}
              </Button>
            </div>
            <Table
              pagination={false}
              loading={loading}
              columns={dataColumns}
              dataSource={sellerOrders}
            />
          </div>
        </Card>
        <Card
          title={intl.formatMessage(messages.buyerOrderList)}
          style={{ marginTop: 20 }}
          bordered={false}
        >
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onNewOrder('buyer')}>
                {intl.formatMessage(messages.new)}
              </Button>
            </div>
            <Table
              pagination={false}
              loading={loading}
              columns={dataColumns}
              dataSource={buyerOrders}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }

}