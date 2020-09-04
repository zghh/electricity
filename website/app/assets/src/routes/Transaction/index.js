import React, { PureComponent } from 'react';
import { Card, Icon, Table, Popover } from 'antd';
import { connect } from 'dva';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';

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
        title: 'Id',
        dataIndex: 'transactionId',
        key: 'transactionId',
        render: text => text.length > 20 ? (
          <Popover content={text}>
            {text.substring(0, 20) + '...'}
          </Popover>
        ) : text,
      },
      {
        title: 'Seller Order Id',
        dataIndex: 'sellerOrderId',
        key: 'sellerOrderId',
        render: text => text.length > 20 ? (
          <Popover content={text}>
            {text.substring(0, 20) + '...'}
          </Popover>
        ) : text,
      },
      {
        title: 'Buyer Order Id',
        dataIndex: 'buyerOrderId',
        key: 'buyerOrderId',
        render: text => text.length > 20 ? (
          <Popover content={text}>
            {text.substring(0, 20) + '...'}
          </Popover>
        ) : text,
      },
      {
        title: 'Seller Id',
        dataIndex: 'sellerId',
        key: 'sellerId',
      },
      {
        title: 'Buyer Id',
        dataIndex: 'buyerId',
        key: 'buyerId',
      },
      {
        title: 'Energy Type',
        dataIndex: 'energyType',
        key: 'energyType',
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Time',
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
          You can view the your transactions here.
        </p>
      </div>
    );

    const extraContent = (
      <div className={styles.extraImg}>
        <QueueAnim>
          <Icon key="smart-contract" type="link" style={{ fontSize: 80 }} />
        </QueueAnim>
      </div>
    );

    return (
      <PageHeaderLayout title="Transactions List" content={content} extraContent={extraContent}>
        <Card
          title="Transactions List"
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
