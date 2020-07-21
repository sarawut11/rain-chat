/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Row, notification as antNotification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ModalBase from '../ModalBase';
import './styles.scss';
import Request from '../../utils/request';
import AvatarUpload from '../AvatarUpload';

class userInfoRender extends Component {
  state = {
    avatar: null,
    email: '',
    intro: '',
    name: '',
    referral: '',
    username: '',
    role: '',
    updateAvailable: false,
    updating: false,
  };

  componentDidMount() {
    this.setState({ ...this.props.userInfo });
  }

  _onChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value, updateAvailable: true });
  };

  onUpdateClick = async () => {
    const { name, intro, username, avatar } = this.state;
    this.setState({ updating: true });
    try {
      const data = new FormData();
      data.append('avatar', avatar);
      data.append('name', name);
      data.append('intro', intro);
      const res = await Request.axios('put', `/api/v1/user/${username}`, data);

      if (res && res.success) {
        localStorage.setItem(
          'userInfo',
          JSON.stringify({ ...this.props.userInfo, ...res.userInfo }),
        );
        antNotification.success({
          message: res.message,
        });
      } else {
        antNotification.error({
          message: res.message,
        });
      }
    } catch (error) {
      antNotification.error({
        message: 'Profile update failed.',
      });
    }
    this.setState({ updating: false });
  };

  onAvatarImageChange = file => {
    this.setState({ avatar: file, updateAvailable: true });
  };

  onCopyReferral = () => {
    const { referral } = this.state;
    const refLink = `${window.location.origin}/register?ref=${referral}`;
    navigator.clipboard.writeText(refLink);
  };

  render() {
    const {
      username,
      name,
      intro,
      avatar,
      referral,
      email,
      role,
      updateAvailable,
      updating,
    } = this.state;
    const reflink = `${window.location.origin}/register?ref=${referral}`;
    const reftext = reflink;

    return (
      <div className="userInfo">
        <Row justify="center">
          <AvatarUpload onChange={this.onAvatarImageChange} originalAvatar={avatar} />
        </Row>

        {username && <p className="name">{username}</p>}

        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
          <Form.Item label="Name">
            <Input value={name} name="name" onChange={this._onChange} placeholder="Name" />
          </Form.Item>
          <Form.Item label="Intro">
            <Input.TextArea
              value={intro}
              name="intro"
              onChange={this._onChange}
              placeholder="Introduce yourself."
            />
          </Form.Item>
          <Form.Item label="Email">{email}</Form.Item>
          <Form.Item label="Referral link">{reftext}</Form.Item>
          <Form.Item label="Role">{role}</Form.Item>
          <Row justify="center" align="middle">
            <Button
              type="primary"
              onClick={this.onUpdateClick}
              disabled={!updateAvailable}
              loading={updating}
            >
              Update
            </Button>
          </Row>
        </Form>
      </div>
    );
  }
}

const ModalRender = ModalBase(userInfoRender);

class ProfileInfo extends Component {
  render() {
    const { userInfo, modalVisible, hide } = this.props;
    return <ModalRender userInfo={userInfo} visible={modalVisible} cancel={hide} />;
  }
}

ProfileInfo.propTypes = {
  userInfo: PropTypes.object,
  hide: PropTypes.func,
  modalVisible: PropTypes.bool,
};

ProfileInfo.defaultProps = {
  userInfo: {},
  hide() {},
  modalVisible: false,
};

export default withRouter(ProfileInfo);
