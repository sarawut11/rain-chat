/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Row, notification as antNotification } from 'antd';
import ModalBase from '../ModalBase';
import './styles.scss';
import Request from '../../utils/request';
import AvatarUpload from '../AvatarUpload';
import { setUserInfoAction } from '../../redux/actions/userAction';

class userInfoRender extends Component {
  state = {
    avatar: null,
    email: '',
    intro: '',
    name: '',
    refcode: '',
    username: '',
    role: '',
    myRefs: 0,
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

      const _this = this;

      if (res && res.success) {
        _this.props.setUserInfo({ data: res.userInfo });
        _this.props.cancel();
        antNotification.success({
          message: res.message,
        });
      } else {
        antNotification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      antNotification.error({
        message: 'Profile update failed.',
      });
    }
    this.setState({ updating: false });
  };

  onAvatarImageChange = file => {
    this.setState({ avatar: file, updateAvailable: true });
  };

  onCopyrefcode = () => {
    const { refcode } = this.state;
    const refLink = `${window.location.origin}/register?ref=${refcode}`;
    navigator.clipboard.writeText(refLink);
  };

  render() {
    const {
      username,
      name,
      intro,
      avatar,
      refcode,
      email,
      role,
      myRefs,
      updateAvailable,
      updating,
    } = this.state;
    const reflink = `${window.location.origin}/register?ref=${refcode}`;
    const reftext = reflink;
    const dList1 = 10;
    const dList2 = 20;
    const dList3 = 15;

    console.log('\n --- ProfileInfo --- \n', this);

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
              value={intro || ''}
              name="intro"
              onChange={this._onChange}
              placeholder="Introduce yourself."
            />
          </Form.Item>
          <Form.Item label="Email">{email}</Form.Item>
          {/* <Form.Item label="refcode link">{reftext}</Form.Item> */}
          <Form.Item label="Role">{role}</Form.Item>
          <Form.Item label="Downlines">{myRefs}</Form.Item>
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
    const { userInfo, modalVisible, hide, setUserInfo } = this.props;
    return (
      <ModalRender
        userInfo={userInfo}
        visible={modalVisible}
        cancel={hide}
        setUserInfo={setUserInfo}
      />
    );
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

const mapStateToProps = state => ({
  userInfo: state.user.userInfo,
});

const mapDispatchToProps = dispatch => ({
  setUserInfo(arg) {
    dispatch(setUserInfoAction(arg));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProfileInfo));
