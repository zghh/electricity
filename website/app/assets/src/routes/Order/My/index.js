import React, { PureComponent } from 'react';
import { Card, Icon, Table } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { IntlProvider, defineMessages } from 'react-intl';
import { getLocale } from "../../../utils/utils";

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';

const currentLocale = getLocale();
const intlProvider = new IntlProvider(
  { locale: currentLocale.locale, messages: currentLocale.messages },
  {}
);
const { intl } = intlProvider.getChildContext();
const messages = defineMessages({
  title: {
    id: 'Title.MyOrders',
    defaultMessage: 'My Order List',
  },
  content: {
    id: 'Content.MyOrders',
    defaultMessage: 'You can view the your orders here.',
  },
  myOrderList: {
    id: 'Order.MyOrders.MyOrderList',
    defaultMessage: 'My Order List',
  },
  orderId: {
    id: 'Order.MyOrders.OrderId',
    defaultMessage: 'Order Id',
  },
  type: {
    id: 'Order.MyOrders.Type',
    defaultMessage: 'Order Type',
  },
  energyType: {
    id: 'Order.MyOrders.EnergyType',
    defaultMessage: 'Energy Type',
  },
  price: {
    id: 'Order.MyOrders.Price',
    defaultMessage: 'Price',
  },
  amount: {
    id: 'Order.MyOrders.Amount',
    defaultMessage: 'Amount',
  },
  remainAmount: {
    id: 'Order.MyOrders.RemainAmount',
    defaultMessage: 'Remain Amount',
  },
  time: {
    id: 'Order.MyOrders.Time',
    defaultMessage: 'Create Time',
  },
  seller: {
    id: 'Order.New.Seller',
    defaultMessage: 'Seller',
  },
  buyer: {
    id: 'Order.New.Buyer',
    defaultMessage: 'Buyer',
  },
});

@connect(({ order, loading }) => ({
  order,
  loading: loading.effects['order/fetchMyOrders'],
}))
export default class MyOrders extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'order/fetchMyOrders',
    })
  }

  render() {
    const { order: { myOrders }, loading } = this.props;
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
        title: intl.formatMessage(messages.type),
        dataIndex: 'type',
        key: 'type',
        render: text => (
          <div>{text == 1 ? intl.formatMessage(messages.seller) : intl.formatMessage(messages.buyer)}</div>
        ),
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
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: intl.formatMessage(messages.remainAmount),
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
          <Icon key="my-orders" type="code-o" style={{ fontSize: 80 }} />
        </QueueAnim>
      </div>
    );

    return (
      <PageHeaderLayout title={intl.formatMessage(messages.title)} content={content} extraContent={extraContent}>
        <Card
          title={intl.formatMessage(messages.myOrderList)}
          bordered={false}
        >
          <div className={styles.tableList}>
            <Table
              pagination={false}
              loading={loading}
              columns={dataColumns}
              dataSource={myOrders}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }

}