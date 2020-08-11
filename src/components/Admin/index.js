/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { Tabs } from 'antd';
import Moderators from './Moderators';
import AdminHome from './AdminHome';
import AdReport from './AdReport';
import Wallet from './Wallet';
import FinanceReport from './FinanceReport';
import './styles.scss';

const { TabPane } = Tabs;

class Admin extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: false,
  };

  componentWillMount() {
    // console.log('component will mount', this);
    const { role } = this.props.userInfo;

    if (role !== 'OWNER') {
      this.props.history.push('/');
    }
  }

  render() {
    // console.log('Admin', this);
    return (
      <div className="dashboard-container">
        <Tabs>
          <TabPane tab="Chat Report" key="chat-report">
            <AdminHome />
          </TabPane>
          <TabPane tab="Moderators" key="moderators">
            <Moderators />
          </TabPane>
          <TabPane tab="Ad Report" key="ad-report">
            <AdReport />
          </TabPane>
          <TabPane tab="Wallet" key="wallet">
            <Wallet />
          </TabPane>
          <TabPane tab="Finance Report" key="finance-report" id="finance-report">
            <FinanceReport />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Admin;
