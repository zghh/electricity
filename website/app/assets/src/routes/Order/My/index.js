import React, { PureComponent } from 'react';
import { Card, Icon, Table } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';

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
        title: 'Id',
        dataIndex: 'orderId',
        key: 'orderId',
        render: text => (
          <Link to={'/order/detail/{id}'.format({ id: text })}>{text}</Link>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: text => (
          <div>{text == 1 ? 'seller' : 'buyer'}</div>
        ),
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
        title: 'RemainAmount',
        dataIndex: 'remainAmount',
        key: 'remainAmount',
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
          You can view the your orders here.
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
      <PageHeaderLayout title="My Order List" content={content} extraContent={extraContent}>
        <Card
          title="My Order List"
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