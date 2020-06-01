/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint-disable func-names */
import React from 'react';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import './AvatarUpload.scss';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
}

class Avatar extends React.Component {
  state = {
    loading: false,
    image: {},
  };

  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, () =>
        this.setState({
          loading: false,
        }),
      );
      this.props.onChange(info.file);
    }
  };

  handleUploadImageAction = file => {
    console.log('handleUploadImageAction');
    const fr = new FileReader();
    const scope = this;

    fr.onload = function() {
      const src = fr.result;

      scope.setState({
        image: {
          file,
          src,
        },
      });
      const myFile = new File([file], 'my-avatar.png');
      console.log('myFile', myFile);
      scope.props.onChange(myFile);
    };

    fr.readAsDataURL(file);
  };

  render() {
    const uploadButton = (
      <div>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { image } = this.state;
    const { originalAvatar } = this.props;
    return (
      <ImgCrop rotate shape="round">
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          action={this.handleUploadImageAction}
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={this.handleChange}
        >
          {image.src ? (
            <img src={image.src} alt="avatar" style={{ width: '100%' }} />
          ) : originalAvatar ? (
            <img src={originalAvatar} alt="avatar" style={{ width: '100%' }} />
          ) : (
            uploadButton
          )}
        </Upload>
      </ImgCrop>
    );
  }
}

export default Avatar;
