import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Descriptions, notification, Spin, Row, Button } from 'antd';
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
    const {
      totalRainDonations,
      totalRained,
      totalWithdrawn,
      currentBalance,
      walletAddress,
    } = this.props.adminState;

    const { loading } = this.state;
    return (
      <div className="wallet-container">
        <h2>Wallet</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <div>
            <Descriptions bordered>
              <Descriptions.Item label="Current Balance" span={3}>
                {currentBalance || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Total Rain Donations" span={3}>
                {totalRainDonations}
              </Descriptions.Item>
              <Descriptions.Item label="Total Rained" span={3}>
                {totalRained}
              </Descriptions.Item>
              <Descriptions.Item label="Total Withdrawn" span={3}>
                {totalWithdrawn}
              </Descriptions.Item>
              <Descriptions.Item label="Wallet address" span={3}>
                {walletAddress || 0}
              </Descriptions.Item>
            </Descriptions>
            <Row justify="center" style={{ marginTop: 40 }}>
              <Button type="primary">Withdraw from Main Wallet</Button>
            </Row>
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
