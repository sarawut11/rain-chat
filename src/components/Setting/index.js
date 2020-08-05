import React from 'react';
import { Modal, Button, Row, Col, Card, Divider } from 'antd';
import { withRouter } from 'react-router-dom';
import { SettingOutlined } from '@ant-design/icons';
import UserUpgrader from './UserUpgrader';
import Withdraw from './Withdraw';
import PasswordChange from './PasswordChange';
import './styles.scss';

function Setting({ initApp, history, userInfo }) {
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
          {userInfo.role === 'FREE' && (
            <Col span={24}>
              <Divider>Upgrade Membership</Divider>
              <UserUpgrader />
            </Col>
          )}
          <Col span={24}>
            <Divider>Withdraw your vitae</Divider>
            <Withdraw />
          </Col>
          <Col span={24}>
            <Divider />
            <PasswordChange />
          </Col>
          <Col span={24}>
            <Divider />
            <Button onClick={showLogoutModal}>Sign Out</Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default withRouter(Setting);
