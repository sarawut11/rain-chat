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

class Wallet extends Component {
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
    const { totalRainDonations, totalRained, totalWithdrawn } = this.props.adminState;

    const { loading } = this.state;
    return (
      <div>
        <h2>Wallet</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Descriptions bordered title="Current Balance">
            <Descriptions.Item label="Total Rain Donations">{totalRainDonations}</Descriptions.Item>
            <Descriptions.Item label="Total Rained">{totalRained}</Descriptions.Item>
            <Descriptions.Item label="Total Withdrawn">{totalWithdrawn}</Descriptions.Item>
          </Descriptions>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
