import React, { PureComponent } from 'react';
import { Card, Button, Icon, Table } from 'antd';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';

const format = require("string-format");
format.extend(String.prototype);

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
        title: 'Id',
        dataIndex: 'orderId',
        key: 'orderId',
        render: text => (
          <Link to={'/order/detail/{id}'.format({ id: text })}>{text}</Link>
        ),
      },
      {
        title: 'UserId',
        dataIndex: 'userId',
        key: 'userId',
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
          You can view the current orders here.
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
      <PageHeaderLayout title="Current Order List" content={content} extraContent={extraContent}>
        <Card
          title="Seller Order List"
          bordered={false}
        >
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onNewOrder('seller')}>
                New
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
          title="Buyer Order List"
          style={{ marginTop: 20 }}
          bordered={false}
        >
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onNewOrder('buyer')}>
                New
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