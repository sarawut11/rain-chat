/* eslint-disable no-template-curly-in-string */
import React, { Component } from 'react';
import { Form, Input, Button, Card, message, Row, Col, notification } from 'antd';
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

  sendEmailConfirmRequest = async values => {
    console.log('\n---   sendEmailConfirmRequest   ---\n', this);
    const { username, email } = values;

    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      message.error('Username can only consist of numbers, letters, underscores');
      return;
    }

    try {
      const res = await Request.axios('post', '/api/v1/email/confirm', { email });

      if (res && res.success) {
        this.setState({
          expireIn: res.expireIn,
          step: 'verification',
        });
        message.success(res.message);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      message.error('Failed to sign up');
    }
  };

  onFinish = async values => {
    console.log('\n\n---   on Finish   ----\n\n', values);
    // this.props.setValue(values);
    this.setState({ registerValues: { ...values }, loadingSubmit: true });
    await this.sendEmailConfirmRequest(values);
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
    const { loadingSubmit, step, expireIn } = this.state;
    const { verifyLoading } = this.props;

    return (
      <div className="sign-up-container">
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
                    <Button
                      onClick={this.onGoBack}
                      style={{ width: '100%' }}
                      disabled={verifyLoading}
                    >
                      Go Back
                    </Button>
                  </Col>

                  <Col span={12}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={verifyLoading}
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
