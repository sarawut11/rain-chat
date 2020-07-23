/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Tooltip, notification, Radio, Form, InputNumber, Row, Col } from 'antd';
import Icon, { SendOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { enableShowAds, disableShowAds } from '../../redux/actions/bShowAdsAction';
import { setVitaeToRainAction } from '../../redux/actions/sendVitaeToRainAction';
import { setUserInfoAction } from '../../redux/actions/userAction';
import Request from '../../utils/request';
import { SEND_ACTUAL_TOKEN, RAIN_FROM_BALANCE } from '../../constants/vitaeToRain';
import './style.scss';

function mapStateToProps(state) {
  return {
    vitaeToRainInfo: state.vitaeToRain,
    userInfo: state.user.userInfo,
  };
}

const mapDispatchToProps = dispatch => ({
  enableShowAds(arg) {
    dispatch(enableShowAds(arg));
  },
  disableShowAds(arg) {
    dispatch(disableShowAds(arg));
  },
  setVitaeToRain(arg) {
    dispatch(setVitaeToRainAction(arg));
  },
  setUserInfo(arg) {
    dispatch(setUserInfoAction(arg));
  },
});

class VitaeToRain extends Component {
  state = {
    visible: false,
    loadingModal: false,
    amount: 0,
    amountValid: true,
  };

  showModal = async () => {
    this.setState({ loadingModal: true, amountValid: true, amount: 0 });

    try {
      const res = await Request.axios('get', `/api/v1/wallet/company-rain-address`);

      if (res && res.success) {
        this.setState({
          visible: true,
        });
        this.props.setVitaeToRain({ walletAddress: res.rainAddress });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Failed to get rain address.',
      });
    }

    this.setState({ loadingModal: false });
    this.props.disableShowAds();
  };

  sendVitaeFromBalance = async () => {
    const { amount } = this.state;

    try {
      const res = await Request.axios('post', `/api/v1/rain/send-vitae/balance`, { amount });

      if (res && res.success) {
        notification.success({
          message: 'Successfully purchased',
        });
        this.props.setUserInfo({ data: res.userInfo });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Failed to purchase from your balance.',
      });
    }

    this.handleCancel();
  };

  handleOk = async () => {
    const { amount } = this.state;
    const { vitaeToRainMode } = this.props.vitaeToRainInfo;
    const { balance } = this.props.userInfo;

    if (vitaeToRainMode === SEND_ACTUAL_TOKEN) {
      this.handleCancel();
      return;
    }

    if (amount > 0 && amount < balance) {
      this.setState({
        amountValid: true,
      });
      const _this = this;

      Modal.confirm({
        title: `${amount} vitae tokens from your balance will be rained`,
        icon: <ExclamationCircleOutlined />,
        content: null,
        onOk() {
          _this.sendVitaeFromBalance();
        },
      });
    } else {
      this.setState({ amountValid: false });
    }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.enableShowAds();
  };

  handleRadioChange = e => {
    console.log('Radio value', e.target.value);
    this.props.setVitaeToRain({ vitaeToRainMode: e.target.value });
  };

  handleAmountChange = value => {
    this.setState({ amount: value });
  };

  render() {
    const { visible, loadingModal, amount, amountValid } = this.state;
    const { vitaeToRainMode, walletAddress } = this.props.vitaeToRainInfo;
    const { balance } = this.props.userInfo;

    const radioOptions = [
      { label: 'Send real tokens', value: SEND_ACTUAL_TOKEN },
      { label: 'Use my balance', value: RAIN_FROM_BALANCE },
    ];

    return (
      <div className="vitae-to-rain-container">
        <Tooltip title="Send Vitae to Rain" color="green" key="send-vitae-btn">
          <Button type="primary" className="send-vitae-btn" onClick={this.showModal}>
            {loadingModal ? (
              <LoadingOutlined />
            ) : (
              <img
                src="../../assets/vitae-token-white-logo.png"
                alt="send-vitae"
                className="send-vitae-btn-icon"
              />
            )}
          </Button>
        </Tooltip>

        <Modal
          title="Send Vitae To Rain"
          visible={visible}
          onOk={this.handleOk}
          cancelButtonProps={{ style: { display: 'none' } }}
          okButtonProps={{ style: { display: 'block', margin: 'auto' } }}
          onCancel={this.handleCancel}
          okText={vitaeToRainMode === SEND_ACTUAL_TOKEN ? 'OK' : 'Rain'}
          className="vitae-to-rain-modal"
        >
          <Row gutter={[20, 20]}>
            <Col span={24}>
              <Radio.Group
                onChange={this.handleRadioChange}
                value={vitaeToRainMode}
                buttonStyle="solid"
              >
                {radioOptions.map(option => (
                  <Radio.Button value={option.value} key={option.value}>
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Col>

            <Col span={24}>
              {vitaeToRainMode === SEND_ACTUAL_TOKEN ? (
                <p style={{ textAlign: 'center' }}>
                  Send vitae to address <span style={{ color: 'blue' }}>{walletAddress}</span>
                </p>
              ) : (
                <p style={{ textAlign: 'center' }}>
                  Your balance: <span style={{ color: 'blue' }}>{balance}</span> vitae
                </p>
              )}
            </Col>

            {vitaeToRainMode === RAIN_FROM_BALANCE && (
              <Col span={24} style={{ height: 60 }}>
                <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Form.Item
                    label="Amount"
                    validateStatus={amountValid ? '' : 'error'}
                    help={amountValid ? '' : 'Input valid amount'}
                  >
                    <InputNumber
                      name="amount"
                      value={amount}
                      onChange={this.handleAmountChange}
                      placeholder="Input amount"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Form>
              </Col>
            )}
          </Row>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VitaeToRain);
