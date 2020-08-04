/* eslint-disable react/jsx-indent */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/no-multi-comp */
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
  Form,
  Input,
  Timeline,
  Tabs,
  Empty,
  Badge,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  LikeOutlined,
} from '@ant-design/icons';
import './styles.scss';
import UserAvatar from '../UserAvatar';
import CreateAds from './CreateAds';
import Request from '../../utils/request';
import { getUserLS } from '../../utils/user';
import {
  ADS_APPROVED,
  ADS_PAID,
  ADS_CREATED,
  ADS_PENDING,
  ADS_PENDING_CONFIRM,
  ADS_PENDING_PURCHASE,
  ADS_REJECTED,
  ADS_TYPE_RAIN_ROOM,
  ADS_TYPE_STATIC,
} from '../../constants/ads';

const { Meta } = Card;
const { TabPane } = Tabs;
const { confirm, warning } = Modal;

const getAmount = (impressions, price) => {
  let amount = Number(impressions) * Number(price);
  amount = Number(amount.toFixed(8));
  amount = amount > 0 ? amount + 0.00000001 : amount;
  return amount;
};

class ImpressionsContent extends Component {
  state = {
    impressions: 0,
  };

  onImpressionsChange = value => {
    const { pointer } = this.props;
    this.setState({ impressions: value });
    pointer.onImpressionsChange(value);
  };

  render() {
    console.log('ImpressionsContent', this);
    const { pointer } = this.props;
    const amount = getAmount(this.state.impressions, pointer.state.price);
    console.log(amount, this.state.impressions, pointer.state.price);

    return (
      <div>
        <Form style={{ marginTop: '20px' }} labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
          <Form.Item label="Impressions" name="impression-form">
            <InputNumber
              name="impressions"
              onChange={this.onImpressionsChange}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Amount">
            <Input value={amount} disabled />
          </Form.Item>
        </Form>
      </div>
    );
  }
}
class Ads extends Component {
  constructor(props) {
    super(props);

    this.state = {
      createAdsVisible: false,
      editingAds: {},
      editAdsVisible: false,
      impressions: 0,
      price: 0,
      loading: false,

      // pendingTran: false,
      // pendingTranAdsId: 0,
      // paidAmount: 0,
      // expectAmount: 0,
    };
  }

  async componentDidMount() {
    const userInfoLS = getUserLS();
    const userInfo = this.props.userInfo;

    const role = userInfo.role ? userInfo.role : userInfoLS.role;

    if (role === 'MODERATOR' || role === 'OWNER') {
      this.setState({ loading: true });

      try {
        const res = await Request.axios('get', `/api/v1/campaign/mod/all`);

        if (res && res.success) {
          this.props.setAds({ data: res.ads });
        } else {
          notification.error({
            message: res.message,
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to get all ads.',
        });
      }

      this.setState({ loading: false });
    }
  }

  showConfirm = item => async () => {
    const pointer = this;
    if (item.status !== ADS_PAID) {
      confirm({
        title: 'Do you want to delete this ads?',
        icon: <ExclamationCircleOutlined />,
        content: `You can not recover this item after remove it.`,
        async onOk() {
          await pointer.onDeleteAds(item);
        },
      });
    } else {
      warning({
        title: `You can't edit or delete a paid ads.`,
      });
    }
  };

  showImpressionModal = item => {
    const pointer = this;
    confirm({
      title: 'Please input impressions',
      icon: <ExclamationCircleOutlined />,
      content: <ImpressionsContent pointer={pointer} />,
      async onOk() {
        await pointer.onPurchase(item);
        pointer.setState({ impressions: 0 });
      },
      onCancel() {
        pointer.setState({ impressions: 0 });
      },
    });
  };

  showImpressionsInput = item => async () => {
    const pointer = this;
    this.setState({ impressions: 0, price: 0 });
    const { price, impressions } = this.state;
    const amount = Number(impressions) * price;
    console.log('amount', amount, impressions, price);
    await this.getImpcost(item);

    // get pending transaction

    try {
      const res = await Request.axios('get', `/api/v1/wallet/get-pending-tran`);

      if (res && res.success) {
        const { pendingTran, walletAddress } = res;
        const { type, status, paidAmount, expectAmount, adsId } = pendingTran;

        // eslint-disable-next-line eqeqeq
        if (type === 0 && status === 4 && item.id == adsId) {
          // this.setState({
          //   pendingTran: true,
          //   pendingTranStatus: status,
          //   paidAmount,
          //   expectAmount,
          //   pendingTranAdsId: adsId,
          // });

          confirm({
            title: `You already have pending transaction.`,
            icon: <ExclamationCircleOutlined />,
            content: (
              <div className="pending-tran-modal-content">
                You have to pay <span>${expectAmount}</span> vitae to <span>${walletAddress}</span>.
                But you sent only <span>${paidAmount}</span> vitae. Please send the rest{' '}
                <span>${expectAmount - paidAmount}</span> to wallet address{' '}
                <span>${walletAddress}</span>
              </div>
            ),
            onOk() {
              pointer.setState({ impressions: 0 });
            },
            onCancel() {
              pointer.setState({ impressions: 0 });
            },
          });
        } else if (type === 0) {
          confirm({
            title: `You already have pending transaction.`,
            icon: <ExclamationCircleOutlined />,
            // content: <ImpressionsContent pointer={pointer} />,
            onOk() {
              pointer.setState({ impressions: 0 });
            },
            onCancel() {
              pointer.setState({ impressions: 0 });
            },
          });
        } else {
          this.showImpressionModal(item);
        }
      } else {
        this.showImpressionModal(item);
      }
    } catch (error) {
      this.showImpressionModal(item);
    }
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
    if (item.status === 1 || item.status === 2) {
      warning({
        title: `You can't edit or delete a pending or approved ads.`,
      });
    } else {
      this.setState({ editingAds: item, editAdsVisible: true });
    }
  };

  onDeleteAds = async item => {
    const { id } = item;
    try {
      const res = await Request.axios('delete', `/api/v1/campaign/pub/${id}`);

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

  onRequest = item => async () => {
    const { id } = item;
    const { impressions, price } = this.state;
    try {
      const data = new FormData();
      const res = await Request.axios('post', `/api/v1/campaign/pub/${id}/request`);

      if (res && res.success) {
        this.props.requestAdsAction({ id, status: res.ads.status, adsState: this.props.ads });
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

  onPurchase = async item => {
    const { id } = item;
    const { impressions, price } = this.state;
    try {
      const data = new FormData();
      data.append('impressions', impressions);
      data.append('costPerImp', price);
      const amount = getAmount(this.state.impressions, this.state.price);
      console.log(amount, this.state.impressions, this.state.price);
      data.append('expectAmount', amount);
      data.append('type', item.type);
      const res = await Request.axios('post', `/api/v1/campaign/pub/${id}/purchase`, data);

      if (res && res.success) {
        this.props.requestAdsAction({ id, status: res.ads.status, adsState: this.props.ads });
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
        message: 'Purchase failed.',
      });
    }
  };

  getImpcost = async item => {
    const { type } = item;
    try {
      const res = await Request.axios('get', `/api/v1/campaign/impcost?type=${type}`);

      if (res && res.success) {
        this.setState({ price: res.price });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  onCancelRequest = item => async () => {
    console.log('onCancelRequest', item);
    const { id } = item;
    try {
      const res = await Request.axios('post', `/api/v1/campaign/pub/${id}/request/cancel`);

      if (res && res.success) {
        this.props.requestAdsAction({ id, status: 0, adsState: this.props.ads });
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
        message: 'Cancel request failed.',
      });
    }
  };

  onApproveAds = item => async () => {
    const { id } = item;
    try {
      const data = new FormData();
      data.append('adsId', id);
      const res = await Request.axios('post', `/api/v1/campaign/mod/${id}/approve`);

      if (res && res.success) {
        this.props.requestAdsAction({ id, status: 2, adsState: this.props.ads });
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
        message: 'Failed to approve.',
      });
    }
  };

  onRejectAds = item => async () => {
    console.log('onRejectAds', item);

    const { id } = item;
    try {
      const res = await Request.axios('post', `/api/v1/campaign/mod/${id}/reject`);

      if (res && res.success) {
        this.props.requestAdsAction({ id, status: 3, adsState: this.props.ads });
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
        message: 'Failed to approve.',
      });
    }
  };

  renderItem = item => {
    const { userInfo } = this.props;
    const { status } = item;
    let actions = [];
    const { role } = userInfo;
    const isModeratorOrOwner = role === 'MODERATOR' || role === 'OWNER';
    const isModerator = role === 'MODERATOR';
    const isOwner = role === 'OWNER';

    if (!isModeratorOrOwner) {
      // normal user
      if (status === ADS_CREATED || status === ADS_REJECTED) {
        actions = [
          <Dropdown overlay={this.renderMenu(item)} placement="bottomCenter">
            <SettingOutlined key="setting" />
          </Dropdown>,
          <EditOutlined key="edit" onClick={this.onEditAds(item)} />,
          <DeleteOutlined key="delete" onClick={this.showConfirm(item)} />,
        ];
      } /* else if (status >= ADS_PENDING_PURCHASE) {
        actions = [<DeleteOutlined key="delete" onClick={this.showConfirm(item)} />];
      } */ else {
        actions = [
          <Dropdown overlay={this.renderMenu(item)} placement="bottomCenter">
            <SettingOutlined key="setting" />
          </Dropdown>,
          <DeleteOutlined key="delete" onClick={this.showConfirm(item)} />,
        ];
      }
    }

    if (isModerator) {
      // moderator
      if (status === ADS_PENDING) {
        actions = [
          <span key="approve" onClick={this.onApproveAds(item)} style={{ color: 'green' }}>
            <CheckOutlined /> Approve
          </span>,
          <span key="reject" onClick={this.onRejectAds(item)} style={{ color: 'red' }}>
            <CloseOutlined /> Reject
          </span>,
        ];
      } else {
        actions = [<div style={{ height: '24px', width: '100%' }} />];
      }
    }

    if (isOwner) {
      // owner
      if (status === ADS_CREATED || status === ADS_REJECTED) {
        actions = [
          <Dropdown overlay={this.renderMenu(item)} placement="bottomCenter">
            <SettingOutlined key="setting" />
          </Dropdown>,
          <EditOutlined key="edit" onClick={this.onEditAds(item)} />,
          <DeleteOutlined key="delete" onClick={this.showConfirm(item)} />,
        ];
      } else if (status === ADS_PENDING) {
        actions = [
          <span key="approve" onClick={this.onApproveAds(item)} style={{ color: 'green' }}>
            <CheckOutlined /> Approve
          </span>,
          <span key="reject" onClick={this.onRejectAds(item)} style={{ color: 'red' }}>
            <CloseOutlined /> Reject
          </span>,
        ];
      } /* else if (status >= ADS_PENDING_PURCHASE) {
        actions = [<DeleteOutlined key="delete" onClick={this.showConfirm(item)} />];
      } */ else if (
        status === ADS_APPROVED &&
        item.creatorUsername === userInfo.username
      ) {
        actions = [
          <Dropdown overlay={this.renderMenu(item)} placement="bottomCenter">
            <SettingOutlined key="setting" />
          </Dropdown>,
          <DeleteOutlined key="delete" onClick={this.showConfirm(item)} />,
        ];
      } else {
        actions = [<div style={{ height: '24px', width: '100%' }} />];
      }
    }

    return (
      <List.Item className="campaign-list-item">
        <Card
          className="campaign-card"
          cover={<img alt="example" src={item.assetLink} />}
          actions={actions}
        >
          <Row justify="end">
            {status === ADS_APPROVED && <Tag color="blue">approved</Tag>}
            {status === ADS_PENDING && <Tag color="magenta">pending</Tag>}
            {status === ADS_CREATED && <Tag color="gold">created</Tag>}
            {status === ADS_REJECTED && <Tag color="red">rejected</Tag>}
            {status === ADS_PAID && <Tag color="#44c97d">purchased</Tag>}
            {status === ADS_PENDING_PURCHASE && <Tag color="orange">awaiting deposit</Tag>}
            {status === ADS_PENDING_CONFIRM && <Tag color="pink">pending deposit</Tag>}
          </Row>
          {item.creatorUsername && (
            <Row justify="end">
              <p>
                Created By: <b>{item.creatorUsername}</b>
              </p>
            </Row>
          )}
          {item.reviewerUsername && (
            <Row justify="end">
              <p>
                Approved By: <b>{item.reviewerUsername}</b>
              </p>
            </Row>
          )}
          <Meta
            avatar={
              <UserAvatar
                name={item.creatorUsername ? item.creatorUsername : this.props.userInfo.name}
                src={item.creatorAvatar ? item.creatorAvatar : ''}
                size="36"
              />
            }
            title={item.title}
            description={item.description}
          />
          <Divider />
          <Timeline className="camp-item-timeline">
            {item.buttonLabel && (
              <Timeline.Item color="green">
                <p>
                  <b>Button Label: </b>
                  {item.buttonLabel}
                </p>
              </Timeline.Item>
            )}
            {item.link && (
              <Timeline.Item color="green">
                <p>
                  <b>Link:</b>
                </p>
                <p>
                  <a href={item.link} target="_blank">
                    {item.link}
                  </a>
                </p>
              </Timeline.Item>
            )}
            <Timeline.Item color="green">
              <p>
                <b>Type: </b>
                {item.type === ADS_TYPE_RAIN_ROOM && 'Rain room ads'}
                {item.type === ADS_TYPE_STATIC && 'Static ads'}
              </p>
            </Timeline.Item>
            {item.impressions && (
              <Timeline.Item color="green">
                <p>
                  <b>Impressions: </b>
                  {item.impressions}
                </p>
              </Timeline.Item>
            )}
            {item.costPerImp && (
              <Timeline.Item color="green">
                <p>
                  <b>Cost per impression:</b>
                </p>
                <p>{item.costPerImp}</p>
              </Timeline.Item>
            )}
          </Timeline>
        </Card>
      </List.Item>
    );
  };

  renderMenu = item => {
    return (
      <Menu>
        {(item.status === 0 || item.status === 3) && item.role !== 'MODERATOR' && (
          <Menu.Item onClick={this.onRequest(item)}>
            {item.role === 'OWNER' ? 'Approve ads' : 'Request ads'}
          </Menu.Item>
        )}
        {item.status === ADS_PENDING && item.role !== 'MODERATOR' && (
          <Menu.Item onClick={this.onCancelRequest(item)}>Cancel request</Menu.Item>
        )}
        {item.status === ADS_APPROVED && item.role !== 'MODERATOR' && (
          <Menu.Item onClick={this.showImpressionsInput(item)}>Purchase</Menu.Item>
        )}
      </Menu>
    );
  };

  renderTabPaneBadge = (isModerator, text, adsList) => {
    let color = '#44c97d';

    switch (text) {
      case 'Created':
        color = 'gold';
        break;
      case 'Rejected':
        color = 'red';
        break;
      case 'Pending':
        color = 'magenta';
        break;
      case 'Approved':
        color = 'blue';
        break;
      case 'Awaiting Purchase':
        color = 'orange';
        break;
      case 'Purchased':
        color = '#44c97d';
        break;
      default:
        color = '#44c97d';
    }
    if (isModerator && text === 'Pending') {
      text = 'Requested';
    }

    if (adsList && adsList.length > 0) {
      return (
        <span>
          {text}
          <Badge count={adsList.length} overflowCount={99} style={{ backgroundColor: color }} />
        </span>
      );
    }

    return text;
  };

  render() {
    const { createAdsVisible, editAdsVisible, editingAds, loading } = this.state;
    const { ads, createAdsAction, editAdsAction, userInfo } = this.props;

    const isModerator = userInfo.role === 'MODERATOR';
    const isOwner = userInfo.role === 'OWNER';
    const isOwnerOrModerator = isModerator || isOwner;

    return (
      <div className="campaign-container">
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

        {ads && ads.adsList && !loading ? (
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <h1 className="campaign-container-title">
                <LikeOutlined />
                Advertise
              </h1>

              {!isModerator && (
                <Button
                  className="camp-add-button"
                  type="primary"
                  onClick={this.onCreateAdsClick}
                  size="large"
                >
                  Create ads
                </Button>
              )}
            </Col>

            <Col span={24}>
              <Tabs defaultActiveKey="1">
                {!isModerator && (
                  <TabPane
                    tab={this.renderTabPaneBadge(isModerator, 'Created', ads.createdAdsList)}
                    key="1"
                  >
                    {ads.createdAdsList && ads.createdAdsList.length > 0 && !isModerator ? (
                      <div>
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
                            xxl: 4,
                          }}
                          dataSource={ads.createdAdsList}
                          renderItem={this.renderItem}
                        />
                      </div>
                    ) : (
                      <Empty description="No Created Ads" />
                    )}
                  </TabPane>
                )}

                {!isModerator && (
                  <TabPane
                    tab={this.renderTabPaneBadge(isModerator, 'Rejected', ads.rejectedAdsList)}
                    key="6"
                  >
                    {ads.rejectedAdsList && ads.rejectedAdsList.length > 0 && !isModerator ? (
                      <div>
                        <Divider orientation="left" plain>
                          <h3>Rejected ads</h3>
                        </Divider>
                        <List
                          grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 2,
                            lg: 3,
                            xl: 3,
                            xxl: 4,
                          }}
                          dataSource={ads.rejectedAdsList}
                          renderItem={this.renderItem}
                        />
                      </div>
                    ) : (
                      <Empty description="No Rejected Ads" />
                    )}
                  </TabPane>
                )}

                <TabPane
                  tab={this.renderTabPaneBadge(isModerator, 'Pending', ads.pendingAdsList)}
                  key="2"
                >
                  {ads.pendingAdsList && ads.pendingAdsList.length > 0 ? (
                    <div>
                      <Divider orientation="left" plain>
                        <h3>{isModerator ? 'Requested ads' : 'Pending ads'}</h3>
                      </Divider>
                      <List
                        grid={{
                          gutter: 16,
                          xs: 1,
                          sm: 2,
                          md: 2,
                          lg: 3,
                          xl: 3,
                          xxl: 4,
                        }}
                        dataSource={ads.pendingAdsList}
                        renderItem={this.renderItem}
                      />
                    </div>
                  ) : (
                    <Empty description="No Pending Ads" />
                  )}
                </TabPane>

                <TabPane
                  tab={this.renderTabPaneBadge(isModerator, 'Approved', ads.approvedAdsList)}
                  key="3"
                >
                  {ads.approvedAdsList && ads.approvedAdsList.length > 0 ? (
                    <div>
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
                          xxl: 4,
                        }}
                        dataSource={ads.approvedAdsList}
                        renderItem={this.renderItem}
                      />
                    </div>
                  ) : (
                    <Empty description="No Approved Ads" />
                  )}
                </TabPane>

                {/* <TabPane
                  tab={this.renderTabPaneBadge(
                    isModerator,
                    'Awaiting Purchase',
                    ads.pendingPurchaseAdsList,
                  )}
                  key="4"
                >
                  {ads.pendingPurchaseAdsList && ads.pendingPurchaseAdsList.length > 0 ? (
                    <div>
                      <Divider orientation="left" plain>
                        <h3>Awaiting deposit ads</h3>
                      </Divider>
                      <List
                        grid={{
                          gutter: 16,
                          xs: 1,
                          sm: 2,
                          md: 2,
                          lg: 3,
                          xl: 3,
                          xxl: 4,
                        }}
                        dataSource={ads.pendingPurchaseAdsList}
                        renderItem={this.renderItem}
                      />
                    </div>
                  ) : (
                    <Empty description="No Awaiting Purchased Ads" />
                  )}
                </TabPane> */}

                <TabPane
                  tab={this.renderTabPaneBadge(isModerator, 'Purchased', ads.paidAdsList)}
                  key="5"
                >
                  {ads.paidAdsList && ads.paidAdsList.length > 0 ? (
                    <div>
                      <Divider orientation="left" plain>
                        <h3>Purchased ads</h3>
                      </Divider>
                      <List
                        grid={{
                          gutter: 16,
                          xs: 1,
                          sm: 2,
                          md: 2,
                          lg: 3,
                          xl: 3,
                          xxl: 4,
                        }}
                        dataSource={ads.paidAdsList}
                        renderItem={this.renderItem}
                      />
                    </div>
                  ) : (
                    <Empty description="No Purchased Ads" />
                  )}
                </TabPane>
              </Tabs>
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
