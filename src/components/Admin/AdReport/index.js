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

class AdReport extends Component {
  state = {
    loading: false,
  };

  async componentDidMount() {
    const user_info = JSON.parse(localStorage.getItem('userInfo'));

    if (user_info.role === 'OWNER') {
      this.setState({ loading: true });

      try {
        const res = await Request.axios('get', `/api/v1/admin/ads`);

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
    const { staticAds, rainAds } = this.props.adminState;

    const { loading } = this.state;
    return (
      <div>
        <h2>Ad Report</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <div>
            <Descriptions bordered title="Static Ads">
              <Descriptions.Item label="Awaiting Approval">
                {staticAds.pendingAds}
              </Descriptions.Item>
              <Descriptions.Item label="Approved">{staticAds.approvedAds}</Descriptions.Item>
              <Descriptions.Item label="Available for Display">
                {staticAds.purchasedAds}
              </Descriptions.Item>
              <Descriptions.Item label="Total Purchases">
                {staticAds.totalPurchase}
              </Descriptions.Item>
              <Descriptions.Item label="Total Impressions Purchased">
                {staticAds.totalImpPurchased}
              </Descriptions.Item>
              <Descriptions.Item label="Total Impressions Given">
                {staticAds.totalImpGiven}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions bordered title="Rain Ads" style={{ marginTop: 20 }}>
              <Descriptions.Item label="Awaiting Approval">{rainAds.pendingAds}</Descriptions.Item>
              <Descriptions.Item label="Approved">{rainAds.approvedAds}</Descriptions.Item>
              <Descriptions.Item label="Available for Display">
                {rainAds.purchasedAds}
              </Descriptions.Item>
              <Descriptions.Item label="Total Purchases">{rainAds.totalPurchase}</Descriptions.Item>
              <Descriptions.Item label="Total Impressions Purchased">
                {rainAds.totalImpPurchased}
              </Descriptions.Item>
              <Descriptions.Item label="Total Impressions Given">
                {rainAds.totalImpGiven}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdReport);
