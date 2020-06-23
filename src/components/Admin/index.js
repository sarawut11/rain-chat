/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { Tabs } from 'antd';
import { HomeFilled } from '@ant-design/icons';
import RoleDashboard from './RoleDashboard';
import AdminHome from './AdminHome';
import './styles.scss';

const { TabPane } = Tabs;

class Admin extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: false,
  };

  render() {
    const homeTab = <HomeFilled />;
    return (
      <div className="dashboard-container">
        <Tabs>
          <TabPane tab={homeTab} key="home" className="dashboard-home-tab">
            <AdminHome />
          </TabPane>
          <TabPane tab="Chat Report" key="chat-report">
            Chat Report
          </TabPane>
          <TabPane tab="Moderators" key="moderators">
            <RoleDashboard />
          </TabPane>
          <TabPane tab="Ad Report" key="ad-report">
            Ad Report
          </TabPane>
          <TabPane tab="Wallet" key="wallet">
            Wallet
          </TabPane>
          <TabPane tab="Rain Report" key="rain-report">
            Rain Report
          </TabPane>
          <TabPane tab="Finance Report" key="finance-report">
            Finance Report
          </TabPane>
          <TabPane tab="Membership" key="membership">
            <RoleDashboard />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Admin;
