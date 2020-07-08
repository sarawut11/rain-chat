import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Row, Col, Card, Divider } from 'antd';
import { withRouter } from 'react-router-dom';
import { SettingOutlined } from '@ant-design/icons';
import UserUpgrader from './UserUpgrader';
import './styles.scss';

function Setting({ initApp, history }) {
  const logout = () => {
    window.socket.disconnect();
    localStorage.removeItem('userInfo');
    initApp(false);
    history.push('/login');
  };

  const showLogoutModal = () => {
    Modal.confirm({
      onOk: logout,
      title: 'Are you sure to exit?',
    });
  };

  return (
    <div className="setting">
      <Card>
        <h1>
          <SettingOutlined />
          Settings
        </h1>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Divider>Upgrade Membership</Divider>
          </Col>
          <Col span={24}>
            <UserUpgrader />
          </Col>
          <Col span={24}>
            <Divider />
          </Col>
          <Col span={24}>
            <Button onClick={showLogoutModal}>Sign Out</Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

Setting.propTypes = {
  initApp: PropTypes.func,
  history: PropTypes.object.isRequired,
};

Setting.defaultProps = {
  initApp() {},
};

export default withRouter(Setting);
