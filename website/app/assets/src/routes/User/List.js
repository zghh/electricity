import React, { PureComponent } from 'react';
import { Card, Icon, Table } from 'antd';
import { connect } from 'dva';
import QueueAnim from 'rc-queue-anim';
import { IntlProvider, defineMessages } from 'react-intl';
import { getLocale } from "../../utils/utils";

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './List.less';

const currentLocale = getLocale();
const intlProvider = new IntlProvider(
  { locale: currentLocale.locale, messages: currentLocale.messages },
  {}
);
const { intl } = intlProvider.getChildContext();
const messages = defineMessages({
  title: {
    id: 'Title.UserList',
    defaultMessage: 'User List',
  },
  content: {
    id: 'Content.UserList',
    defaultMessage: 'You can view the all users here.',
  },
  id: {
    id: 'UserList.Id',
    defaultMessage: 'Id',
  },
  name: {
    id: 'UserList.Name',
    defaultMessage: 'Name',
  },
  type: {
    id: 'UserList.Type',
    defaultMessage: 'Type',
  },
  normal: {
    id: 'UserList.Normal',
    defaultMessage: 'Normal Consumer',
  },
  productive: {
    id: 'UserList.Productive',
    defaultMessage: 'Productive Consumer',
  },
  traditional: {
    id: 'UserList.Traditional',
    defaultMessage: 'Traditional Energy Company',
  },
});

@connect(({ user, loading }) => ({
  user,
  loading: loading.effects['user/list'],
}))
export default class UserList extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'user/list',
    })
  }

  render() {
    const { user: { userList }, loading } = this.props;
    const dataColumns = [
      {
        title: intl.formatMessage(messages.id),
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: intl.formatMessage(messages.name),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: intl.formatMessage(messages.type),
        dataIndex: 'type',
        key: 'type',
        render: text => {
          if (text == 1) {
            return intl.formatMessage(messages.normal);
          } else if (text == 2) {
            return intl.formatMessage(messages.productive);
          } else {
            return intl.formatMessage(messages.traditional);
          }
        },
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
          <Icon key="userList" type="user" style={{ fontSize: 80 }} />
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
              dataSource={userList}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
