import React, { Component } from 'react';
import { Modal, Form, Input, notification, Row, Col } from 'antd';
import Request from '../../utils/request';
import AdsUpload from './AdsUpload';

const { Item } = Form;
const { TextArea } = Input;
const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
const initialState = {
  asset: null,
  link: '',
  button_name: '',
  title: '',
  description: '',
  confirmLoading: false,
  fileList: [],
};
export default class CreateAds extends Component {
  state = {
    ...initialState,
  };

  handleOk = async () => {
    const { asset, link, button_name, title, description, confirmLoading } = this.state;
    const user_info = JSON.parse(localStorage.getItem('userInfo'));
    const { username } = user_info;

    this.setState({ confirmLoading: true });

    try {
      const data = new FormData();
      data.append('asset', asset);
      data.append('link', link);
      data.append('button_name', button_name);
      data.append('title', title);
      data.append('description', description);
      data.append('confirmLoading', confirmLoading);
      const res = await Request.axios('post', `/api/v1/ads/${username}/create`, data);

      if (res && res.success) {
        this.props.createAdsAction({ ...res.ads, adsState: this.props.ads });
        notification.success({
          message: res.message,
        });
        this.hideModal();
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Profile update failed.',
      });
    }

    this.setState({ confirmLoading: false });
  };

  handleCancel = e => {
    console.log(e);
    this.hideModal();
  };

  _onChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  onAdsFileChange = file => {
    this.setState({ asset: file });
  };

  hideModal = () => {
    this.setState({ ...initialState });
    this.props.hideModal();
  };

  setFileList = fileList => {
    this.setState({ fileList });
  };

  render() {
    const { visible } = this.props;
    const { asset, link, button_name, title, description, confirmLoading, fileList } = this.state;

    return (
      <div>
        <Modal
          title="Create a new advertisement"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={confirmLoading}
        >
          <Row gutter={[0, 20]}>
            <Col span={24}>
              <AdsUpload
                onChange={this.onAdsFileChange}
                asset={asset}
                fileList={fileList}
                setFileList={this.setFileList}
              />
            </Col>

            <Col span={24}>
              <Form {...layout}>
                <Item label="Title">
                  <Input name="title" value={title} onChange={this._onChange} />
                </Item>
                <Item label="Description">
                  <TextArea name="description" value={description} onChange={this._onChange} />
                </Item>
                <Item label="Link">
                  <Input name="link" value={link} onChange={this._onChange} />
                </Item>
                <Item label="Button Label">
                  <Input name="button_name" value={button_name} onChange={this._onChange} />
                </Item>
              </Form>
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}
