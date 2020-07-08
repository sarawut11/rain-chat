import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
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
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <UserUpgrader />
        </Col>
        <Col span={24}>
          <Button onClick={showLogoutModal}>Sign Out</Button>
        </Col>
      </Row>
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
