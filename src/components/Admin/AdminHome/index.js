import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Descriptions, notification, Spin } from 'antd';
import { setAdminAction } from '../../../containers/AdminPage/adminAction';
import Request from '../../../utils/request';

function mapStateToProps(state) {
  return {
    adminState: state.adminState,
    userInfo: state.user.userInfo,
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
    const user_info = this.props.userInfo;

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

  async componentDidUpdate(prevProps) {
    const user_info = this.props.userInfo;
    const prevUser = prevProps.userInfo;

    console.log('\n --- user_info --- \n', user_info, prevUser);

    if (prevUser.username !== user_info.username) {
      if (user_info.role === 'OWNER') {
        // this.setState({ loading: true });

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

        // this.setState({ loading: false });
      }
    }
  }

  render() {
    const { userCount, onlineUserCount, groupCount } = this.props.adminState;

    const { loading } = this.state;
    return (
      <div className="chat-report-container">
        <h2>Chat Report</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Descriptions bordered>
            <Descriptions.Item label="Number of Users" span={3}>
              {userCount}
            </Descriptions.Item>
            <Descriptions.Item label="Number of users online" span={3}>
              {onlineUserCount}
            </Descriptions.Item>
            <Descriptions.Item label="Number of chat rooms" span={3}>
              {groupCount}
            </Descriptions.Item>
          </Descriptions>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminHome);
