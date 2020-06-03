/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import {
  List,
  Space,
  Spin,
  Card,
  Row,
  Col,
  Button,
  notification,
  Modal,
  Divider,
  Menu,
  Dropdown,
  InputNumber,
  Tag,
} from 'antd';
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
const { confirm, warning } = Modal;

class Ads extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user_info: {},
      createAdsVisible: false,
      editingAds: {},
      editAdsVisible: false,
      impressions: 0,
    };
  }

  componentDidMount() {
    const user_info = JSON.parse(localStorage.getItem('userInfo'));
    this.setState({ user_info });
  }

  showConfirm = item => async () => {
    const pointer = this;
    if (item.status === 0) {
      confirm({
        title: 'Do you Want to delete this ads?',
        icon: <ExclamationCircleOutlined />,
        content: `You can not recover this item after remove it.`,
        async onOk() {
          await pointer.onDeleteAds(item);
        },
      });
    } else {
      warning({
        title: `You can't edit or delete a pending ads.`,
      });
    }
  };

  showImpressionsInput = item => async () => {
    const pointer = this;
    this.setState({ impressions: 0 });
    confirm({
      title: 'Please input impressions',
      icon: <ExclamationCircleOutlined />,
      content: (
        <InputNumber
          value={pointer.state.impressions}
          name="impressions"
          onChange={pointer.onImpressionsChange}
        />
      ),
      async onOk() {
        await pointer.onRequest(item);
        pointer.setState({ impressions: 0 });
      },
      onCancel() {
        pointer.setState({ impressions: 0 });
      },
    });
  };

  hideCreateAdsModal = () => {
    this.setState({ createAdsVisible: false });
  };

  hideEditAdsModal = () => {
    this.setState({ editAdsVisible: false, editingAds: {} });
  };

  onImpressionsChange = value => {
    this.setState({ impressions: value });
  };

  onCreateAdsClick = () => {
    this.setState({ createAdsVisible: true });
  };

  onEditAds = item => () => {
    console.log('edit ads');
    if (item.status > 0) {
      warning({
        title: `You can't edit or delete a pending ads.`,
      });
    } else {
      this.setState({ editingAds: item, editAdsVisible: true });
    }
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

  onRequest = async item => {
    console.log('onRequest', item);
    const { username } = this.state.user_info;
    const { id } = item;
    const { impressions } = this.state;
    try {
      const data = new FormData();
      data.append('impressions', impressions);
      const res = await Request.axios('post', `/api/v1/ads/${username}/${id}/request`, data);

      if (res && res.success) {
        this.props.requestAdsAction({ id, status: 1, adsState: this.props.ads });
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
        message: 'Request failed.',
      });
    }
  };

  onCancelRequest = item => () => {
    console.log('onCancelRequest', item);
  };

  renderItem = item => {
    const { user_info } = this.state;
    const { status } = item;
    return (
      <List.Item>
        <Card
          className="ads-card"
          cover={<img alt="example" src={item.asset_link} />}
          actions={[
            <Dropdown overlay={this.renderMenu(item)} placement="bottomCenter">
              <SettingOutlined key="setting" />
            </Dropdown>,
            <EditOutlined key="edit" onClick={this.onEditAds(item)} />,
            <DeleteOutlined key="delete" onClick={this.showConfirm(item)} />,
          ]}
        >
          <Row justify="end">
            {status === 2 && <Tag color="#87d068">approved</Tag>}
            {status === 1 && <Tag color="#f50">pending</Tag>}
            {status === 0 && <Tag color="#108ee9">created</Tag>}
          </Row>
          <Meta
            avatar={<UserAvatar name={user_info.name} src={user_info.avatar} size="36" />}
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
    );
  };

  renderMenu = item => {
    return (
      <Menu>
        {item.status === 0 ? (
          <Menu.Item onClick={this.showImpressionsInput(item)}>Request ads</Menu.Item>
        ) : (
          <Menu.Item onClick={this.onCancelRequest(item)}>Cancel request</Menu.Item>
        )}
      </Menu>
    );
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

            {ads.approvedAdsList && ads.approvedAdsList.length > 0 && (
              <Col span={24}>
                <Divider orientation="left" plain>
                  <h3>Approved ads</h3>
                </Divider>
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
                  dataSource={ads.approvedAdsList}
                  renderItem={this.renderItem}
                />
              </Col>
            )}

            {ads.pendingAdsList && ads.pendingAdsList.length > 0 && (
              <Col span={24}>
                <Divider orientation="left" plain>
                  <h3>Pending ads</h3>
                </Divider>
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
                  dataSource={ads.pendingAdsList}
                  renderItem={this.renderItem}
                />
              </Col>
            )}

            {ads.createdAdsList && ads.createdAdsList.length > 0 && (
              <Col span={24}>
                <Divider orientation="left" plain>
                  <h3>Created ads</h3>
                </Divider>
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
                  dataSource={ads.createdAdsList}
                  renderItem={this.renderItem}
                />
              </Col>
            )}
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
