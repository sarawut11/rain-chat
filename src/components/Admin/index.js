/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { List, notification, Switch } from 'antd';
import UserAvatar from '../UserAvatar';
import Request from '../../utils/request';

class Admin extends Component {
  state = {
    loading: false,
    totalCount: 0,
  };

  async componentDidMount() {
    const user_info = JSON.parse(localStorage.getItem('userInfo'));

    if (user_info.role === 'OWNER') {
      this.setState({ loading: true });

      try {
        const res = await Request.axios('get', `/api/v1/membership/role/users`);

        if (res && res.success) {
          this.props.setAdmin({ data: res.users });
          this.setState({ totalCount: res.totalCount });
        } else {
          notification.error({
            message: res.message,
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to get all ads.',
        });
      }

      this.setState({ loading: false });
    }
  }

  render() {
    console.log('Admin render', this);
    const { loading, totalCount } = this.state;
    const { admin } = this.props;

    return (
      <div className="dashboard-container">
        <h2>Role management</h2>
        {admin && admin.usersList ? (
          <List
            className="demo-loadmore-list"
            itemLayout="horizontal"
            dataSource={admin.usersList}
            size="large"
            loading={loading}
            pagination={{
              onChange(page, pageSize) {
                console.log(page, pageSize);
              },
              pageSize: 10,
              total: totalCount,
            }}
            renderItem={item => (
              <List.Item actions={[<Switch checked={item.role === 'MODERATOR'} />]}>
                <List.Item.Meta
                  avatar={<UserAvatar name={item.name} src={item.avatar} size="36" />}
                  title={item.username}
                  description={item.intro}
                />
                <div>Role: {item.role}</div>
              </List.Item>
            )}
          />
        ) : null}
      </div>
    );
  }
}

export default Admin;
