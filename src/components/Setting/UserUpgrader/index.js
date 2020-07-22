/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, notification, Row, Col, Radio } from 'antd';
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
    upgradeMode: 0,
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
    const { vitaePrice, usdPrice, walletAddress, upgradeMode } = this.state;

    if (userInfo.role === 'FREE') {
      try {
        if (upgradeMode === 0) {
          const res = await Request.axios('post', `/api/v1/membership/role/upgrade/request`, {
            expectAmount: vitaePrice,
          });

          if (res && res.success) {
            notification.success({
              message: 'You requested to upgrade membership successfully.',
            });

            this.props.setMembershipUpgradeInfo({
              membershipUpgradePending: true,
              usdPrice,
              vitaePrice,
              walletAddress,
              deadline: Date.now() + MEMBERSHIP_UPGRADE_DEADLINE_PERIOD,
            });
          } else {
            notification.error({
              message: res.message,
            });
          }
        } else {
          const res = await Request.axios('post', `/api/v1/membership/role/upgrade/balance`, {
            expectAmount: vitaePrice,
          });

          if (res && res.success) {
            notification.success({
              message: 'You upgraded membership successfully.',
            });
          } else {
            notification.error({
              message: res.message,
            });
          }
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to request to upgrade membership.',
        });
      }

      this.setState({ visible: false });
    }
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleRadioChange = e => {
    this.setState({ upgradeMode: e.target.value });
  };

  render() {
    const { loadingPrice, visible, vitaePrice, usdPrice, walletAddress, upgradeMode } = this.state;
    const { membershipUpgradePending } = this.props.membershipUpgradeInfo;
    const { userInfo } = this.props;
    const { balance } = this.props.userInfo;

    const radioOptions = [
      { label: 'Send vitae tokens', value: 0 },
      { label: 'Use my balance', value: 1 },
    ];

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
          className="membership-upgrade-modal"
        >
          <Row gutter={[20, 20]}>
            <Col span={24}>
              <Radio.Group
                onChange={this.handleRadioChange}
                value={upgradeMode}
                buttonStyle="solid"
              >
                {radioOptions.map(option => (
                  <Radio.Button value={option.value} key={option.value}>
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Col>

            <Col span={24} className="membership-upgrade-text">
              {upgradeMode === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <p>
                    You have to pay <span>${usdPrice}</span> in Vitae.
                  </p>
                  <p>
                    Send <span>{vitaePrice}</span> vitae to the vitae address{' '}
                    <span>{walletAddress}</span>.
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p>
                    Your balance: <span>{balance}</span> vitae
                  </p>
                  <p>
                    You have to pay <span>${usdPrice}</span> in Vitae.
                  </p>
                </div>
              )}
            </Col>
          </Row>
          {/* <div className="membership-upgrade-text">
            <p>
              You have to pay <span>${usdPrice}</span> in Vitae.
            </p>
            <p>
              Send <span>{vitaePrice}</span> vitae to the vitae address <span>{walletAddress}</span>
              .
            </p>
          </div> */}
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserUpgrader);
