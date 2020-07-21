/* eslint-disable no-template-curly-in-string */
import React, { Component } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Row, Col } from 'antd';
import Request from '../../utils/request';
import './style.scss';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const verificationLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not validate email!',
    number: '${label} is not a validate number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
    len: '${label} must be ${len} numbers',
  },
  string: {
    len: '${label} must be ${len} numbers',
  },
};

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSpinner: true,
      registerValues: {},
      expireIn: 0,
      loadingSubmit: false,
      step: 'sign-up',
      verificationCode: '',
    };
  }

  handleChange = event => {
    const { target } = event;
    this.setState({ [target.name]: target.value });
  };

  componentDidMount() {
    this.setState({ showSpinner: false });
  }

  handleClick = () => {
    this.props.setValue(this.state);
  };

  sendEmailConfirmRequest = async email => {
    console.log('sendEmailConfirmRequest');

    try {
      const res = await Request.axios('post', '/api/v1/email/confirm', { email });

      if (res && res.success) {
        this.setState({
          expireIn: res.expireIn,
          step: 'verification',
        });
      } else {
        message.error(res.message);
        // notification(res.message, 'error');
      }
    } catch (error) {
      message.error('Failed to sign up');
      // notification(error, 'error');
    }
  };

  onFinish = async values => {
    console.log('\n\n---   on Finish   ----\n\n', values);
    // this.props.setValue(values);
    this.setState({ registerValues: { ...values }, loadingSubmit: true });
    await this.sendEmailConfirmRequest(values.email);
    this.setState({ loadingSubmit: false });
  };

  onGoBack = () => {
    this.setState({ step: 'sign-up', verificationCode: '' });
  };

  verifyEmail = async values => {
    console.log('\n\n---   on verify email   ----\n\n', values);

    const { registerValues } = this.state;
    const { verificationCode } = values;

    this.props.setValue({ ...registerValues, otp: verificationCode });
  };

  render() {
    const { loadingSubmit, step, loadingVerify, expireIn } = this.state;

    return (
      <div className="sign-up-container">
        {/* {this.state.showSpinner && <Spinner />}
        <div className="userAvatarWrapper">
          <UserAvatar name={username || 'U'} size="100" color="#44C97D" />
        </div>
        <div className="center">
          <div className="center">
            <input
              type="text"
              name="name"
              value={name}
              onChange={this.handleChange}
              placeholder="Full Name"
            />
          </div>
          <div className="center">
            <input
              type="text"
              name="email"
              value={email}
              onChange={this.handleChange}
              placeholder="Email"
            />
          </div>
        </div>
        <div className="center">
          <input
            type="text"
            name="username"
            value={username}
            onChange={this.handleChange}
            placeholder="Username"
          />
        </div>
        <div className="center">
          <input
            type="password"
            name="password"
            value={password}
            onChange={this.handleChange}
            placeholder="Password"
          />
        </div>
        <div className="center">
          <input type="button" onClick={this.handleClick} value="Register" />
        </div> */}
        <Card
          title="Sign Up"
          bordered={false}
          style={step === 'sign-up' ? {} : { display: 'none' }}
        >
          <Form
            {...layout}
            name="sign-up"
            onFinish={this.onFinish}
            validateMessages={validateMessages}
          >
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input placeholder="Input your name" />
            </Form.Item>
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
              <Input placeholder="Input username" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
              <Input placeholder="Input your email" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password placeholder="Input password" />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button type="primary" htmlType="submit" loading={loadingSubmit}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {step === 'verification' && (
          <Card title="Verify your email" bordered={false}>
            <Form
              {...verificationLayout}
              name="verification"
              onFinish={this.verifyEmail}
              validateMessages={validateMessages}
              className="sign-up-verification-form"
            >
              <p>
                We sent verification code to your email. Please input the code below. The code will
                expire in {Number(expireIn) / 1000} seconds.
              </p>

              <Form.Item name="verificationCode" label="Code" rules={[{ required: true, len: 6 }]}>
                <Input placeholder="Verification code" />
              </Form.Item>

              <Form.Item>
                <Row justify="space-between">
                  <Col span={12}>
                    <Button onClick={this.onGoBack} style={{ width: '100%' }}>
                      Go Back
                    </Button>
                  </Col>

                  <Col span={12}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loadingVerify}
                      style={{ width: '100%' }}
                    >
                      Verify
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    );
  }
}
