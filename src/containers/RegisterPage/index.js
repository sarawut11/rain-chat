import React, { Component } from 'react';
import './index.scss';
import { Row, Spin, Modal } from 'antd';
import Request from '../../utils/request';
import notification from '../../components/Notification';
import SignUp from '../../components/SignUp';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      username: '',
      password: '',
      show: false,
      sponsor: '',
      loading: false,
    };
  }

  async componentDidMount() {
    // console.log('registerpage componentdidmount');
    const url_string = window.location.href;
    const url = new URL(url_string);
    const refcode = url.searchParams.get('ref');
    // console.log(refcode);
    if (refcode === null || refcode === '') {
      window.location.href = '/404';
    }

    const scope = this;

    try {
      const res = await Request.axios('post', '/api/v1/ref/validate', { refcode });

      if (res && res.success) {
        // Popup
        scope.setState({
          show: true,
          sponsor: refcode,
        });
      } else {
        notification(res.message, 'error');
        window.location.href = '/404';
      }
    } catch (error) {
      notification(error, 'error');
      window.location.href = '/404';
    }
  }

  register = async () => {
    const { name, email, username, password, sponsor, otp } = this.state;
    this.setState({ loading: true });
    try {
      const res = await Request.axios('post', '/api/v1/register', {
        name,
        email,
        username,
        password,
        sponsor,
        otp,
      });
      if (res && res.success) {
        // Popup
        Modal.success({
          title: 'You have successfully registered',
          onOk: this.confirm,
        });
      } else {
        notification(res.message, 'error');
      }
    } catch (error) {
      notification(error, 'error');
    }
    this.setState({ loading: false });
  };

  setValue = value => {
    const { name, email, username, password, otp } = value;
    this.setState(
      {
        name,
        email,
        username,
        password,
        otp,
      },
      async () => {
        await this.register();
      },
    );
  };

  confirm = () => {
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      visible: false,
    });

    // eslint-disable-next-line react/prop-types
    this.props.history.push('/login');
  };

  render() {
    const { show, loading } = this.state;

    // console.log('\n\n ------   Register Page Render   -------- \n\n', this);
    return (
      <div className="register">
        {show ? (
          <SignUp setValue={this.setValue} verifyLoading={loading} />
        ) : (
          <Row justify="center" align="middle">
            <Spin />
          </Row>
        )}
      </div>
    );
  }
}
