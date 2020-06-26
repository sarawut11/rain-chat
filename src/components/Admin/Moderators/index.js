/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List, notification, Descriptions, Button, Row, Col, Select } from 'antd';
import {
  setAdminAction,
  addModerators,
  removeModer,
} from '../../../containers/AdminPage/adminAction';
import UserAvatar from '../../UserAvatar';
import Request from '../../../utils/request';

const { Option } = Select;

class Moderators extends Component {
  state = {
    loading: false,
    usernameOptions: [],
    usernamesToAdd: [],
  };

  async componentDidMount() {
    const user_info = JSON.parse(localStorage.getItem('userInfo'));

    if (user_info.role === 'OWNER') {
      this.setState({ loading: true });

      try {
        const res = await Request.axios('get', `/api/v1/admin/moders`);

        if (res && res.success) {
          this.props.setAdmin({ data: res });
        } else {
          notification.error({
            message: res.message,
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to get data.',
        });
      }

      try {
        const res = await Request.axios('get', `/api/v1/admin/moders/usernamelist`);

        if (res && res.success) {
          this.props.setAdmin({ data: res });
          const { usernameList } = res;
          // const usernameOptions = [];

          // usernameList.forEach((item, index) => {
          //   usernameOptions.push(
          //     <Option key={index} value={item.username} label={`${item.username}(${item.email})`}>
          //       {item.username}({item.email})
          //     </Option>,
          //   );
          // });

          // this.setState({ usernameOptions });
          this.setUsernameOptions(usernameList);
        } else {
          notification.error({
            message: res.message,
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to get data.',
        });
      }

      this.setState({ loading: false });
    }
  }

  setUsernameOptions = usernameList => {
    const usernameOptions = [];

    usernameList.forEach((item, index) => {
      usernameOptions.push(
        <Option key={index} value={item.username} label={`${item.username}(${item.email})`}>
          {item.username}({item.email})
        </Option>,
      );
    });

    this.setState({ usernameOptions });
  };

  onUsernameChange = (value, option) => {
    console.log('onUsernameChange', value, option);
    this.setState({ usernamesToAdd: value });
  };

  onAddModerators = async () => {
    console.log('onAddModerators', this.state.usernamesToAdd);

    const { usernamesToAdd } = this.state;

    try {
      const res = await Request.axios('post', `/api/v1/admin/moders/set`, {
        usernamelist: usernamesToAdd,
      });

      if (res && res.success) {
        console.log('here', this.props.adminState.usernameList, res);
        let usernameList = [...this.props.adminState.usernameList];

        usernameList = usernameList.filter(item => {
          const newUsers = res.users.filter(item1 => {
            return item.username === item1.username;
          });
          if (newUsers && newUsers.length > 0) {
            return false;
          }
          return true;
        });

        this.setUsernameOptions(usernameList);

        this.props.addModerators({ addedModers: res.users });

        this.setState({ usernamesToAdd: [] });

        notification.success({ message: 'Added the moderators successfully.' });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);

      notification.error({
        message: 'Failed to get data.',
      });
    }
  };

  onRemoveModer = username => async () => {
    console.log('onRemoveModer', username);

    try {
      const res = await Request.axios('post', `/api/v1/admin/moders/cancel`, {
        username,
      });

      if (res && res.success) {
        const { userInfo } = res;
        const usernameList = [...this.props.adminState.usernameList];

        console.log('here', usernameList);

        // usernameList = usernameList.filter(item => {
        //   return item.username !== userInfo.username;
        // });

        usernameList.push({ username: userInfo.username, email: userInfo.email });

        this.setUsernameOptions(usernameList);

        this.props.removeModer({ moder: userInfo });

        notification.success({ message: 'Removed the moderator successfully.' });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);

      notification.error({
        message: 'Failed to get data.',
      });
    }
  };

  render() {
    console.log('Admin render', this);
    const { loading } = this.state;
    const { modersCount, onlineModersCount, moders } = this.props.adminState;
    const { usernameOptions, usernamesToAdd } = this.state;

    return (
      <div className="dashboard-role-container">
        <h2>Moderators</h2>

        <Descriptions bordered>
          <Descriptions.Item label="Number of moderators">{modersCount}</Descriptions.Item>
          <Descriptions.Item label="Number of online moderators">
            {onlineModersCount}
          </Descriptions.Item>
        </Descriptions>

        <Row gutter={[20, 10]} style={{ marginTop: '20px' }}>
          <Col xs={24} sm={24} md={24} lg={18} xl={20}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Please select email or username to add moderators"
              onChange={this.onUsernameChange}
              value={usernamesToAdd}
            >
              {usernameOptions}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={6} xl={4}>
            <Button
              type="primary"
              style={{ width: '100%' }}
              onClick={this.onAddModerators}
              disabled={!(usernamesToAdd && usernamesToAdd.length)}
            >
              Add moderators
            </Button>
          </Col>
        </Row>

        {moders ? (
          <List
            className="demo-loadmore-list"
            itemLayout="horizontal"
            dataSource={moders}
            size="large"
            loading={loading}
            pagination={{
              onChange(page, pageSize) {
                console.log(page, pageSize);
              },
              pageSize: 10,
            }}
            renderItem={item => (
              <List.Item>
                <Row style={{ width: '100%' }} gutter={[20, 10]}>
                  <Col xs={12} sm={12} md={12} lg={5} xl={5}>
                    <List.Item.Meta
                      avatar={<UserAvatar name={item.name} src={item.avatar} size="36" />}
                      title={item.name}
                      description={`@${item.username}`}
                    />
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={5} xl={5}>
                    Email: <br />
                    {item.email}
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={5} xl={5}>
                    Balance: <br />
                    {item.balance.toFixed(2)}
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={5} xl={5}>
                    <div>
                      Role: <br />
                      {item.role}
                    </div>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                    <Button danger onClick={this.onRemoveModer(item.username)}>
                      Remove
                    </Button>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  adminState: state.adminState,
});

const mapDispatchToProps = dispatch => ({
  setAdmin(arg) {
    dispatch(setAdminAction(arg));
  },
  addModerators(arg) {
    dispatch(addModerators(arg));
  },
  removeModer(arg) {
    dispatch(removeModer(arg));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Moderators);
