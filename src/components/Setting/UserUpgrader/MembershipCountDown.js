/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Statistic, notification } from 'antd';
import { setMembershipUpgradeInfo } from '../../../redux/actions/userAction';

const { Countdown } = Statistic;

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

class MembershipCountDown extends Component {
  onFinish = () => {
    console.log('onFinish');
    try {
      const { role } = this.props.userInfo;
      if (role === 'FREE') {
        // notification.error({
        //   message: 'Time up for the payment. Membership upgrade has been failed.',
        // });

        this.props.setMembershipUpgradeInfo({
          membershipUpgradePending: false,
          usdPrice: null,
          vitaePrice: null,
          walletAddress: null,
          deadline: null,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    const {
      membershipUpgradePending,
      vitaePrice,
      deadline,
      walletAddress,
    } = this.props.membershipUpgradeInfo;
    return (
      <div>
        {membershipUpgradePending && (
          <div>
            <p>
              You should pay {vitaePrice}vitae to the wallet {walletAddress}
            </p>
            <Countdown
              title="Time left for the payment"
              value={deadline}
              onFinish={this.onFinish}
              format="mm:ss:SSS"
            />
          </div>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembershipCountDown);
