import React, { PureComponent } from 'react';
import { Card, Icon, Table, Popover } from 'antd';
import { connect } from 'dva';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { IntlProvider, defineMessages } from 'react-intl';
import { getLocale } from "../../utils/utils";

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';

const currentLocale = getLocale();
const intlProvider = new IntlProvider(
  { locale: currentLocale.locale, messages: currentLocale.messages },
  {}
);
const { intl } = intlProvider.getChildContext();
const messages = defineMessages({
  title: {
    id: 'Title.Transaction',
    defaultMessage: 'Transactions List',
  },
  content: {
    id: 'Content.Transaction',
    defaultMessage: 'You can view the your transactions here.',
  },
  id: {
    id: 'Transaction.Id',
    defaultMessage: 'Id',
  },
  sellerOrderId: {
    id: 'Transaction.SellerOrderId',
    defaultMessage: 'Seller Order Id',
  },
  buyerOrderId: {
    id: 'Transaction.BuyerOrderId',
    defaultMessage: 'Buyer Order Id',
  },
  sellerId: {
    id: 'Transaction.SellerId',
    defaultMessage: 'Seller Id',
  },
  buyerId: {
    id: 'Transaction.BuyerId',
    defaultMessage: 'Buyer Id',
  },
  energyType: {
    id: 'Transaction.EnergyType',
    defaultMessage: 'Energy Type',
  },
  price: {
    id: 'Transaction.Price',
    defaultMessage: 'Price',
  },
  amount: {
    id: 'Transaction.Amount',
    defaultMessage: 'Amount',
  },
  time: {
    id: 'Transaction.Time',
    defaultMessage: 'Create Time',
  },
});

@connect(({ transaction, loading }) => ({
  transaction,
  loading: loading.effects['transaction/fetch'],
}))
export default class Transaction extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'transaction/fetch',
    })
  }

  render() {
    const { transaction: { transactions }, loading } = this.props;
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
          <Icon key="transactions" type="transaction" style={{ fontSize: 80 }} />
        </QueueAnim>
      </div>
    );

    return (
      <PageHeaderLayout title={intl.formatMessage(messages.title)} content={content} extraContent={extraContent}>
        <Card
          title={intl.formatMessage(messages.title)}
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
