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
  id: null,
  asset: null,
  link: '',
  button_name: '',
  title: '',
  description: '',
  confirmLoading: false,
  fileList: [],
  errorList: {},
};
export default class CreateAds extends Component {
  state = {
    ...initialState,
  };

  componentDidMount() {
    // console.log('create ads component did mount', this.props);
    const { editingAds, editMode } = this.props;
    if (editMode) {
      this.setState({ ...editingAds });
    }
  }

  handleOk = async () => {
    const { editMode } = this.props;
    const { id, asset, link, button_name, title, description } = this.state;

    const newErrorList = {};
    let isError = false;
    if (!title) {
      newErrorList.title = true;
      isError = true;
    }
    if (!description) {
      newErrorList.description = true;
      isError = true;
    }

    this.setState({ errorList: { ...newErrorList } });
    if (isError) {
      notification.error({
        message: 'Validation error',
      });
      return;
    }

    this.setState({ confirmLoading: true });

    try {
      const data = new FormData();
      data.append('asset', asset);
      data.append('link', link);
      data.append('button_name', button_name);
      data.append('title', title);
      data.append('description', description);

      let res;
      if (editMode) {
        res = await Request.axios('put', `/api/v1/campaign/pub/${id}`, data);
        // res.ads = { id, asset_link, link, button_name, title, description };
      } else {
        res = await Request.axios('post', `/api/v1/campaign/pub/create`, data);
      }

      if (res && res.success) {
        if (editMode) {
          this.props.editAdsAction({ ads: res.ads, adsState: this.props.ads });
        } else {
          this.props.createAdsAction({ ads: res.ads, adsState: this.props.ads });
        }
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
        message: 'Failed.',
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
    const { visible, editMode } = this.props;
    const {
      asset,
      link,
      button_name,
      title,
      description,
      confirmLoading,
      fileList,
      errorList,
    } = this.state;

    const uploadText = editMode
      ? 'Click or drag new ads file to this area to update'
      : 'Click or drag file to this area to upload';

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
                uploadText={uploadText}
              />
            </Col>

            <Col span={24}>
              <Form {...layout}>
                <Item
                  label="Title"
                  help={errorList.title ? 'Title is required' : null}
                  validateStatus={errorList.title ? 'error' : 'success'}
                  rules={[{ required: true }]}
                >
                  <Input name="title" value={title} onChange={this._onChange} />
                </Item>
                <Item
                  label="Description"
                  help={errorList.description ? 'Description is required' : null}
                  validateStatus={errorList.description ? 'error' : 'success'}
                >
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
