import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Descriptions, notification, Spin, Row, Col, Divider } from 'antd';
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
      <div className="ad-report-container">
        <h2>Ad Report</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <div>
            <Row justify="center" gutter={[0, 20]} style={{ marginTop: '20px' }}>
              <Col xs={24} sm={24} md={24} lg={11} xl={11}>
                <Descriptions bordered title="Static Ads">
                  <Descriptions.Item label="Awaiting Approval" span={3}>
                    {staticAds.pendingAds}
                  </Descriptions.Item>
                  <Descriptions.Item label="Approved" span={3}>
                    {staticAds.approvedAds}
                  </Descriptions.Item>
                  <Descriptions.Item label="Available for Display" span={3}>
                    {staticAds.purchasedAds}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Purchases" span={3}>
                    {staticAds.totalPurchase}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Impressions Purchased" span={3}>
                    {staticAds.totalImpPurchased}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Impressions Given" span={3}>
                    {staticAds.totalImpGiven}
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              <Col xs={0} sm={0} md={0} lg={2} xl={2}>
                <Divider type="vertical" />
              </Col>

              <Col xs={24} sm={24} md={24} lg={11} xl={11}>
                <Descriptions bordered title="Rain Ads">
                  <Descriptions.Item label="Awaiting Approval" span={3}>
                    {rainAds.pendingAds}
                  </Descriptions.Item>
                  <Descriptions.Item label="Approved" span={3}>
                    {rainAds.approvedAds}
                  </Descriptions.Item>
                  <Descriptions.Item label="Available for Display" span={3}>
                    {rainAds.purchasedAds}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Purchases" span={3}>
                    {rainAds.totalPurchase}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Impressions Purchased" span={3}>
                    {rainAds.totalImpPurchased}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Impressions Given" span={3}>
                    {rainAds.totalImpGiven}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdReport);
