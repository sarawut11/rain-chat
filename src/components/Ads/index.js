/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { List, Space, Spin, Card, Row, Col, Button, notification, Modal } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import './styles.scss';
import UserAvatar from '../UserAvatar';
import CreateAds from './CreateAds';
import Request from '../../utils/request';

const { Meta } = Card;
const { confirm } = Modal;

class Ads extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user_info: {},
      createAdsVisible: false,
      editingAds: {},
      editAdsVisible: false,
    };
  }

  componentDidMount() {
    const user_info = JSON.parse(localStorage.getItem('userInfo'));
    this.setState({ user_info });
  }

  showConfirm = item => async () => {
    const pointer = this;
    confirm({
      title: 'Do you Want to delete this ads?',
      icon: <ExclamationCircleOutlined />,
      content: `You can not recover this item after remove it.`,
      async onOk() {
        await pointer.onDeleteAds(item);
      },
    });
  };

  hideCreateAdsModal = () => {
    this.setState({ createAdsVisible: false });
  };

  hideEditAdsModal = () => {
    this.setState({ editAdsVisible: false, editingAds: {} });
  };

  onCreateAdsClick = () => {
    this.setState({ createAdsVisible: true });
  };

  onEditAds = item => () => {
    console.log('edit ads');
    this.setState({ editingAds: item, editAdsVisible: true });
  };

  onDeleteAds = async item => {
    const { username } = this.state.user_info;
    const { id } = item;
    try {
      const res = await Request.axios('delete', `/api/v1/ads/${username}/${id}`);

      if (res && res.success) {
        this.props.deleteAdsAction({ id, adsState: this.props.ads });
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
        message: 'Delete failed.',
      });
    }
  };

  render() {
    const { user_info, createAdsVisible, editAdsVisible, editingAds } = this.state;
    const { ads, createAdsAction, editAdsAction } = this.props;

    console.log('render', ads);

    return (
      <div className="ads-container">
        <CreateAds
          visible={createAdsVisible}
          hideModal={this.hideCreateAdsModal}
          createAdsAction={createAdsAction}
          ads={this.props.ads}
        />

        {editAdsVisible && (
          <CreateAds
            visible={editAdsVisible}
            hideModal={this.hideEditAdsModal}
            editAdsAction={editAdsAction}
            ads={this.props.ads}
            editingAds={editingAds}
            editMode
          />
        )}

        {ads && ads.adsList ? (
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
                dataSource={ads.adsList}
                renderItem={item => (
                  <List.Item>
                    <Card
                      cover={<img alt="example" src={item.asset_link} />}
                      actions={[
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" onClick={this.onEditAds(item)} />,
                        <DeleteOutlined key="delete" onClick={this.showConfirm(item)} />,
                      ]}
                    >
                      <Meta
                        avatar={
                          <UserAvatar name={user_info.name} src={user_info.avatar} size="36" />
                        }
                        title={item.title}
                        description={
                          <div>
                            <p>
                              Description: <b>{item.description}</b>
                            </p>
                            <p>
                              Button Label: <b>{item.button_name}</b>
                            </p>
                            <p>
                              Link: <b>{item.link}</b>
                            </p>
                          </div>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        ) : (
          <Space size="middle">
            <Spin size="large" />
          </Space>
        )}
      </div>
    );
  }
}

export default Ads;
