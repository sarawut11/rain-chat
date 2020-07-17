import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Descriptions, notification, Spin, Row, Button } from 'antd';
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

class Wallet extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: false,
  };

  async componentDidMount() {
    const user_info = this.props.userInfo;
    console.log('componentDidMount', this, user_info);

    if (user_info.role === 'OWNER') {
      this.setState({ loading: true });

      try {
        const res = await Request.axios('get', `/api/v1/admin/wallet`);

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
      totalRainDonation,
      totalRained,
      totalWithdrawn,
      currentBalance,
      stockpileAddress,
      stockpileBalance,
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
                {totalRainDonation}
              </Descriptions.Item>
              <Descriptions.Item label="Total Rained" span={3}>
                {totalRained}
              </Descriptions.Item>
              <Descriptions.Item label="Total Withdrawn" span={3}>
                {totalWithdrawn}
              </Descriptions.Item>
              <Descriptions.Item label="Stockpile address" span={3}>
                {stockpileAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Stockpile balance" span={3}>
                {stockpileBalance}
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
