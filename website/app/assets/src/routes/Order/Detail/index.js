import React, { Component } from 'react';
import pathToRegexp from 'path-to-regexp';
import { connect } from 'dva';
import { Icon, Card, Table, Popover } from 'antd';
import DescriptionList from 'components/DescriptionList';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import moment from 'moment';
import { IntlProvider, defineMessages } from 'react-intl';
import { getLocale } from "../../../utils/utils";

const { Description } = DescriptionList;

const currentLocale = getLocale();
const intlProvider = new IntlProvider(
  { locale: currentLocale.locale, messages: currentLocale.messages },
  {}
);
const { intl } = intlProvider.getChildContext();
const messages = defineMessages({
  title: {
    id: 'Title.Detail',
    defaultMessage: 'Order Id:',
  },
  type: {
    id: 'Order.Detail.Type',
    defaultMessage: 'Order Type',
  },
  userId: {
    id: 'Order.Detail.UserId',
    defaultMessage: 'User Id',
  },
  energyType: {
    id: 'Order.Detail.EnergyType',
    defaultMessage: 'Energy Type',
  },
  price: {
    id: 'Order.Detail.Price',
    defaultMessage: 'Price',
  },
  amount: {
    id: 'Order.Detail.Amount',
    defaultMessage: 'Amount',
  },
  remainAmount: {
    id: 'Order.Detail.RemainAmount',
    defaultMessage: 'Remain Amount',
  },
  time: {
    id: 'Order.Detail.Time',
    defaultMessage: 'Create Time',
  },
  transactionList: {
    id: 'Order.Detail.TransactionList',
    defaultMessage: 'Transaction List',
  },
  id: {
    id: 'Order.Detail.Id',
    defaultMessage: 'Id',
  },
  sellerOrderId: {
    id: 'Order.Detail.SellerOrderId',
    defaultMessage: 'Seller Order Id',
  },
  buyerOrderId: {
    id: 'Order.Detail.BuyerOrderId',
    defaultMessage: 'Buyer Order Id',
  },
  sellerId: {
    id: 'Order.Detail.SellerId',
    defaultMessage: 'Seller Id',
  },
  buyerId: {
    id: 'Order.Detail.BuyerId',
    defaultMessage: 'Buyer Id',
  },
  seller: {
    id: 'Order.Detail.Seller',
    defaultMessage: 'Seller',
  },
  buyer: {
    id: 'Order.Detail.Buyer',
    defaultMessage: 'Buyer',
  },
});

@connect(({ order, loading }) => ({
  order,
  loading: loading.effects['order/fetchDetail'],
}))
export default class Detail extends Component {
  componentDidMount() {
    const { location, dispatch } = this.props;
    const info = pathToRegexp('/order/detail/:id').exec(location.pathname);
    if (info) {
      const id = info[1];
      dispatch({
        type: 'order/fetchDetail',
        payload: {
          id,
        },
      });
    }
  }

  render() {
    const { order: { orderInfo, transactions }, loading } = this.props;
    const dataColumns = [
      {
        title: intl.formatMessage(messages.id),
        dataIndex: 'transactionId',
        key: 'transactionId',
        render: text => text.length > 20 ? (
          <Popover content={text}>
            {text.substring(0, 20) + '...'}
          </Popover>
        ) : text,
      },
      {
        title: intl.formatMessage(messages.sellerOrderId),
        dataIndex: 'sellerOrderId',
        key: 'sellerOrderId',
        render: text => text.length > 20 ? (
          <Popover content={text}>
            {text.substring(0, 20) + '...'}
          </Popover>
        ) : text,
      },
      {
        title: intl.formatMessage(messages.buyerOrderId),
        dataIndex: 'buyerOrderId',
        key: 'buyerOrderId',
        render: text => text.length > 20 ? (
          <Popover content={text}>
            {text.substring(0, 20) + '...'}
          </Popover>
        ) : text,
      },
      {
        title: intl.formatMessage(messages.sellerId),
        dataIndex: 'sellerId',
        key: 'sellerId',
      },
      {
        title: intl.formatMessage(messages.buyerId),
        dataIndex: 'buyerId',
        key: 'buyerId',
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
        title: intl.formatMessage(messages.time),
        dataIndex: 'time',
        key: 'time',
        render: text => (
          <div>{moment(text * 1000).format('YYYY-MM-DD HH:mm:ss')}</div>
        ),
      },
    ];

    const description = (
      <DescriptionList className={styles.headerList} size="small" col="2">
        <Description term={intl.formatMessage(messages.type)}>{orderInfo.type === 1 ? intl.formatMessage(messages.seller) : intl.formatMessage(messages.buyer)}</Description>
        <Description term={intl.formatMessage(messages.userId)}>{orderInfo.userId}</Description>
        <Description term={intl.formatMessage(messages.energyType)}>{orderInfo.energyType}</Description>
        <Description term={intl.formatMessage(messages.price)}>{orderInfo.price}</Description>
        <Description term={intl.formatMessage(messages.amount)}>{orderInfo.amount}</Description>
        <Description term={intl.formatMessage(messages.remainAmount)}>{orderInfo.remainAmount}</Description>
        <Description term={intl.formatMessage(messages.time)}>{moment(orderInfo.time * 1000).format('YYYY-MM-DD HH:mm:ss')}</Description>
      </DescriptionList>
    );

    return (
      <PageHeaderLayout
        title={`${intl.formatMessage(messages.title)} ${orderInfo.orderId}`}
        logo={
          <Icon type="form" style={{ fontSize: 30, color: '#40a9ff' }} />
        }
        loading={loading}
        content={description}
      >
        <Card
          title={intl.formatMessage(messages.transactionList)}
          bordered={false}
        >
          <div className={styles.tableList}>
            <Table
              pagination={false}
              loading={loading}
              columns={dataColumns}
              dataSource={transactions}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }

}