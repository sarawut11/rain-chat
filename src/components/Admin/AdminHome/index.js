import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Descriptions, notification, Spin } from 'antd';
import { setAdminAction } from '../../../containers/AdminPage/adminAction';
import Request from '../../../utils/request';

function mapStateToProps(state) {
  return {
    adminState: state.adminState,
  };
}

const mapDispatchToProps = dispatch => ({
  setAdmin(arg) {
    dispatch(setAdminAction(arg));
  },
});

class AdminHome extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: false,
  };

  async componentDidMount() {
    const user_info = JSON.parse(localStorage.getItem('userInfo'));

    if (user_info.role === 'OWNER') {
      this.setState({ loading: true });

      try {
        const res = await Request.axios('get', `/api/v1/admin/chat`);

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

      this.setState({ loading: false });
    }
  }

  render() {
    const { userCount, onlineUserCount, groupCount } = this.props.adminState;

    const { loading } = this.state;
    return (
      <div>
        <h2>Admin Dashboard</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Descriptions bordered>
            <Descriptions.Item label="Number of Users">{userCount}</Descriptions.Item>
            <Descriptions.Item label="Number of users online">{onlineUserCount}</Descriptions.Item>
            <Descriptions.Item label="Number of chat rooms">{groupCount}</Descriptions.Item>
          </Descriptions>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminHome);
