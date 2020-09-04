import React, { Component } from 'react';
import pathToRegexp from 'path-to-regexp';
import { connect } from 'dva';
import { Icon, Card, Table, Popover } from 'antd';
import DescriptionList from 'components/DescriptionList';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import moment from 'moment';

const { Description } = DescriptionList;

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

    const description = (
      <DescriptionList className={styles.headerList} size="small" col="2">
        <Description term="Order Id">{orderInfo.orderId}</Description>
        <Description term="Type">{orderInfo.type === 1 ? 'seller' : 'buyer'}</Description>
        <Description term="User Id">{orderInfo.userId}</Description>
        <Description term="Energy Type">{orderInfo.energyType}</Description>
        <Description term="Price">{orderInfo.price}</Description>
        <Description term="Amount">{orderInfo.amount}</Description>
        <Description term="Remain Amount">{orderInfo.remainAmount}</Description>
        <Description term="Time">{moment(orderInfo.time * 1000).format('YYYY-MM-DD HH:mm:ss')}</Description>
      </DescriptionList>
    );

    return (
      <PageHeaderLayout
        title={`Order Id: ${orderInfo.orderId}`}
        logo={
          <Icon type="code-o" style={{ fontSize: 30, color: '#40a9ff' }} />
        }
        loading={loading}
        content={description}
      >
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