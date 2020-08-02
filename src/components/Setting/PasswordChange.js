import React, { Component } from 'react';
import { Modal, Button, Form, Input, notification } from 'antd';
import Request from '../../utils/request';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

class PasswordChange extends Component {
  state = { visible: false, password: '', confirmPassword: '' };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  onChangePasswordClick = async () => {
    const { password, confirmPassword, oldPassword } = this.state;
    // eslint-disable-next-line eqeqeq
    if (!oldPassword || !password || !confirmPassword || password != confirmPassword) {
      return;
    }

    try {
      const data = new FormData();
      data.append('oldPassword', oldPassword);
      data.append('newPassword', password);
      const res = await Request.axios('put', `/api/v1/user/password/update`, data);

      if (res && res.success) {
        this.handleCancel();
        notification.success({
          message: res.message,
        });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Change password failed.',
      });
    }
  };

  _onChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    console.log('Chnage password', this);

    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Change Password
        </Button>
        <Modal
          title="Change Password"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
        >
          <Form
            {...formItemLayout}
            // form={form}
            name="register"
            scrollToFirstError
          >
            <Form.Item
              name="oldPassword"
              label="Old password"
              rules={[
                {
                  required: true,
                  message: 'Please input your old password!',
                },
              ]}
              hasFeedback
            >
              <Input.Password name="oldPassword" onChange={this._onChange} />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ]}
              hasFeedback
            >
              <Input.Password name="password" onChange={this._onChange} />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject('The two passwords that you entered do not match!');
                  },
                }),
              ]}
            >
              <Input.Password name="confirmPassword" onChange={this._onChange} />
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit" onClick={this.onChangePasswordClick}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default PasswordChange;
