import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Descriptions, notification, Spin, Row, Col } from 'antd';
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

class FinanceReport extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: false,
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

      this.setState({ loading: false });
    }
  }

  render() {
    const {
      adRevenue,
      upgradedRevenue,
      ownerPayment,
      moders,
      totalModeratorsPayment,
      totalExpenses,
      paidExpenses,
      unpaidExpenses,
    } = this.props.adminState;

    const { loading } = this.state;
    return (
      <div>
        <h2>Financial Report</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Row gutter={[0, 20]}>
            <Col span={24}>
              <Descriptions bordered>
                <Descriptions.Item label="Ad revenue">{adRevenue}</Descriptions.Item>
                <Descriptions.Item label="Upgraded revenue">{upgradedRevenue}</Descriptions.Item>
              </Descriptions>
            </Col>

            <Col span={24}>
              <Descriptions bordered title="Owner Payments">
                <Descriptions.Item label="Owner 1">{ownerPayment}</Descriptions.Item>
                <Descriptions.Item label="Owner 2">{ownerPayment}</Descriptions.Item>
              </Descriptions>
            </Col>

            <Col span={24}>
              <Descriptions bordered title="Moderator Payments">
                {moders.map(moder => (
                  <Descriptions.Item label={moder.name}>
                    {moder.balance.toFixed(2)}
                  </Descriptions.Item>
                ))}
                <Descriptions.Item label="Total payments" span={2}>
                  {totalModeratorsPayment}
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col span={24}>
              <Descriptions bordered title="Expenses">
                <Descriptions.Item label="TotalExpenses">{totalExpenses}</Descriptions.Item>
                <Descriptions.Item label="Expenses Unpaid">{unpaidExpenses}</Descriptions.Item>
                <Descriptions.Item label="Expenses Paid">{paidExpenses}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FinanceReport);
