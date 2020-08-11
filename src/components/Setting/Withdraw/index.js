/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Modal,
  notification,
  Row,
  Col,
  Input,
  InputNumber,
  Result,
  Steps,
  Form,
} from 'antd';
import {
  MailOutlined,
  SmileOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Request from '../../../utils/request';

const { Step } = Steps;
const { confirm } = Modal;

function mapStateToProps(state) {
  return {
    userInfo: state.user.userInfo,
    membershipUpgradeInfo: state.user.membershipUpgradeInfo,
  };
}

class Withdraw extends Component {
  state = {
    visible: false,
    amount: 0,
    verificationCode: null,
    walletAddress: null,
    currentStep: 0,
    sendCodeLoading: false,
    codeValid: true,
    addressValid: true,
    amountValid: true,
  };

  sendOtpCode = async () => {
    this.setState({ sendCodeLoading: true });

    try {
      const res = await Request.axios('get', `/api/v1/user/otp/request`);

      if (res && res.success) {
        this.setState({ visible: true });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      // console.log(error);
      notification.error({
        message: 'Failed to send verification code to your email.',
      });
    }

    this.setState({ sendCodeLoading: false });
  };

  verifyOtpCode = async () => {
    const { verificationCode } = this.state;

    if (verificationCode === null || verificationCode.length !== 6) {
      this.setState({ codeValid: false });
      return;
    }

    this.setState({ codeValid: true });

    try {
      const res = await Request.axios('post', `/api/v1/user/otp/verify`, {
        token: verificationCode,
      });

      if (res && res.success && res.isValid) {
        this.setState({ currentStep: 1 });
        notification.success({
          message: 'Your email is verified',
        });
      } else {
        notification.error({
          message: 'Code is not valid',
        });
        this.setState({ codeValid: false });
      }
    } catch (error) {
      // console.log(error);
      notification.error({
        message: 'Failed to verify the code.',
      });
    }
  };

  doWithdraw = async () => {
    const { walletAddress, amount } = this.state;

    try {
      const res = await Request.axios('post', `/api/v1/wallet/withdraw`, {
        walletAddress,
        amount,
      });

      if (res && res.success) {
        this.setState({ currentStep: 2 });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      // console.log(error);
      notification.error({
        message: 'Failed to withdraw.',
      });
    }
  };

  showModal = async () => {
    this.setState({
      currentStep: 0,
      amount: 0,
      verificationCode: null,
      walletAddress: null,
      codeValid: true,
      addressValid: true,
      amountValid: true,
    });
    this.sendOtpCode();
  };

  handleOk = async () => {
    const { currentStep, walletAddress, amount } = this.state;
    const _this = this;

    if (currentStep === 0) {
      await this.verifyOtpCode();
    } else if (currentStep === 1) {
      this.setState({ addressValid: true, amountValid: true });
      if (amount === 0 || walletAddress === null || walletAddress === '') {
        notification.error({
          message: 'Input correct address and amount.',
        });
        if (amount === 0) {
          this.setState({ amountValid: false });
        }
        if (walletAddress === null || walletAddress === '') {
          this.setState({ addressValid: false });
        }
      } else {
        confirm({
          title: `You are withdrawing ${amount} Vitae to ${walletAddress}.`,
          icon: <ExclamationCircleOutlined />,
          async onOk() {
            await _this.doWithdraw();
          },
        });
      }
    } else if (currentStep === 2) {
      this.setState({
        walletAddress: null,
        amount: 0,
        visible: false,
      });
    } else {
      this.setState({ currentStep: currentStep + 1 });
    }
  };

  handleCancel = e => {
    // console.log(e);
    this.setState({
      visible: false,
    });
  };

  _handleInputChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleAmountChange = value => {
    this.setState({
      amount: value,
    });
  };

  renderOtpStep = () => {
    const { verificationCode, codeValid } = this.state;
    return (
      <div className="withdraw-step-content">
        <Row gutter={[20, 20]} justify="space-around">
          <Col span={24}>
            <p>
              We sent a verification code to your email. Please input the code below. If the email
              does not arrive, please check your junk mail.
            </p>
          </Col>
          <Col span={24}>
            <Input
              name="verificationCode"
              value={verificationCode}
              style={{ width: 200, margin: 'auto', display: 'block' }}
              onChange={this._handleInputChange}
              maxLength={6}
              placeholder="Verification Code"
              className={codeValid ? '' : 'error-input'}
            />
          </Col>
        </Row>
      </div>
    );
  };

  renderWithdrawStep = () => {
    const { walletAddress, amount, addressValid, amountValid } = this.state;

    return (
      <div className="withdraw-step-content">
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <p>Input the Vitae amount and address to withdraw.</p>
          </Col>

          <Col span={24}>
            <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Form.Item
                label="Address"
                validateStatus={addressValid ? '' : 'error'}
                help={addressValid ? '' : 'Input valid address'}
              >
                <Input
                  name="walletAddress"
                  value={walletAddress}
                  onChange={this._handleInputChange}
                  placeholder="Wallet address"
                />
              </Form.Item>

              <Form.Item
                label="Amount"
                validateStatus={amountValid ? '' : 'error'}
                help={amountValid ? '' : 'Input valid amount'}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  value={amount}
                  onChange={this.handleAmountChange}
                  placeholder="Withdraw amount"
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    );
  };

  renderResultStep = () => {
    const { amount, walletAddress } = this.state;

    return (
      <Result
        status="success"
        title="Success!"
        subTitle={`You successfully withdrew ${amount} Vitae to ${walletAddress}.`}
        className="withdraw-step-content"
      />
    );
  };

  render() {
    const { visible, currentStep, sendCodeLoading } = this.state;
    const { userInfo } = this.props;

    const withdrawSteps = [
      {
        title: 'Verify',
        content: this.renderOtpStep(),
        buttonText: 'Verify',
        icon: <MailOutlined />,
        modalText: 'Verify your email',
      },
      {
        title: 'Withdraw',
        content: this.renderWithdrawStep(),
        buttonText: 'Withdraw',
        icon: <WalletOutlined />,
        modalText: 'Input withdraw amount',
      },
      {
        title: 'Complete',
        content: this.renderResultStep(),
        buttonText: 'Done',
        icon: <SmileOutlined />,
        modalText: 'Complete',
      },
    ];

    return (
      <div className="withdraw-container">
        <h3>Your Vitae balance: {userInfo.balance && userInfo.balance.toFixed(8)}</h3>
        <Button type="primary" onClick={this.showModal} loading={sendCodeLoading}>
          Withdraw
        </Button>

        <Modal
          title={withdrawSteps[currentStep].modalText}
          visible={visible}
          okText={withdrawSteps[currentStep].buttonText}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className="withdraw-modal"
        >
          <Steps
            type="navigation"
            size="small"
            current={currentStep}
            onChange={this.onChange}
            className="withdraw-steps"
          >
            {withdrawSteps.map((step, idx) => (
              <Step title={step.title} key={idx} icon={step.icon} />
            ))}
          </Steps>
          {withdrawSteps[currentStep].content}
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Withdraw);
