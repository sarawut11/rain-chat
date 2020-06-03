/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { List, Avatar, Space, Spin, Card, Row, Col, Button } from 'antd';
import { EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import Request from '../../utils/request';
import './styles.scss';
import notification from '../Notification';
import UserAvatar from '../UserAvatar';
import CreateAds from './CreateAds';

const { Meta } = Card;

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

class Ads extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user_info: {},
      loadingAds: false,
      adsList: [],
      createAdsVisible: false,
    };
  }

  async componentDidMount(props) {
    const user_info = JSON.parse(localStorage.getItem('userInfo'));
    this.setState({ user_info, loadingAds: true });

    try {
      let res = null;
      if (user_info.username) {
        res = await Request.axios('get', `/api/v1/ads/${user_info.username}`);
      }

      if (res && res.success) {
        if (res.ads) {
          this.setState({ adsList: res.ads });
        }
      } else {
        notification(res.message, 'error');
      }
    } catch (error) {
      notification(error, 'error');
    }

    this.setState({ loadingAds: false });
  }

  hideCreateAdsModal = () => {
    this.setState({ createAdsVisible: false });
  };

  onCreateAdsClick = () => {
    this.setState({ createAdsVisible: true });
  };

  render() {
    const { loadingAds, adsList, user_info, createAdsVisible } = this.state;
    console.log('ads component', this);
    return (
      <div className="ads-container">
        <CreateAds visible={createAdsVisible} hideModal={this.hideCreateAdsModal} />
        {loadingAds ? (
          <Space size="middle">
            <Spin size="large" />
          </Space>
        ) : (
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Button
                className="ads-add-button"
                type="primary"
                onClick={this.onCreateAdsClick}
                size="large"
              >
                Create ads
              </Button>
            </Col>
            <Col span={24}>
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 3,
                  xxl: 3,
                }}
                dataSource={adsList}
                renderItem={item => (
                  <List.Item>
                    <Card
                      cover={<img alt="example" src={item.asset_link} />}
                      actions={[
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" />,
                        <DeleteOutlined key="delete" />,
                      ]}
                    >
                      <Meta
                        avatar={
                          <UserAvatar name={user_info.name} src={user_info.avatar} size="36" />
                        }
                        title={item.title}
                        description={item.description}
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        )}
      </div>
    );
  }
}

export default Ads;
