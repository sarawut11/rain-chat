/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, notification } from 'antd';
import Request from '../../../utils/request';
import { setMembershipUpgradeInfo } from '../../../redux/actions/userAction';
import MembershipCountDown from './MembershipCountDown';
import { MEMBERSHIP_UPGRADE_DEADLINE_PERIOD } from '../../../constants/user';

function mapStateToProps(state) {
  return {
    userInfo: state.user.userInfo,
    membershipUpgradeInfo: state.user.membershipUpgradeInfo,
  };
}

const mapDispatchToProps = dispatch => ({
  setMembershipUpgradeInfo(arg) {
    dispatch(setMembershipUpgradeInfo(arg));
  },
});

class UserUpgrader extends Component {
  state = {
    loadingPrice: false,
    visible: false,
    vitaePrice: 0,
    usdPrice: 0,
    walletAddress: null,
  };

  showModal = async () => {
    const { userInfo } = this.props;

    if (userInfo.role === 'FREE') {
      this.setState({
        loadingPrice: true,
      });
      try {
        const res = await Request.axios('get', `/api/v1/membership/price`);

        if (res && res.success) {
          this.setState({
            visible: true,
            usdPrice: res.usdPrice,
            vitaePrice: res.vitaePrice,
            walletAddress: res.walletAddress,
          });
        } else {
          notification.error({
            message: res.message,
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to get user upgrader data.',
        });
      }

      this.setState({ loadingPrice: false });
    }
  };

  handleOk = async () => {
    const { userInfo } = this.props;
    const { vitaePrice, usdPrice, walletAddress } = this.state;

    if (userInfo.role === 'FREE') {
      try {
        const res = await Request.axios('post', `/api/v1/membership/role/upgrade/request`, {
          expectAmount: vitaePrice,
        });

        if (res && res.success) {
          notification.success({
            message: 'You requested to upgrade membership successfully.',
          });
        } else {
          notification.error({
            message: res.message,
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to request to upgrade membership.',
        });
      }

      this.props.setMembershipUpgradeInfo({
        membershipUpgradePending: true,
        usdPrice,
        vitaePrice,
        walletAddress,
        deadline: Date.now() + MEMBERSHIP_UPGRADE_DEADLINE_PERIOD,
      });

      this.setState({ visible: false });
    }
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  render() {
    console.log('\n\n----       User Upgrade       -----\n\n', this);
    const { loadingPrice, visible, vitaePrice, usdPrice, walletAddress } = this.state;
    const { membershipUpgradePending } = this.props.membershipUpgradeInfo;
    const { userInfo } = this.props;
    return (
      <div>
        {membershipUpgradePending ? (
          <MembershipCountDown />
        ) : (
          userInfo.role === 'FREE' && (
            <Button type="primary" onClick={this.showModal} loading={loadingPrice}>
              Upgrade Membership
            </Button>
          )
        )}
        <Modal
          title="Uprgrade membership"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div>
            <p>You have to pay ${usdPrice} in Vitae.</p>
            <p>
              Send {vitaePrice}vitae to the vitae address {walletAddress}.
            </p>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserUpgrader);
