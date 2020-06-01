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
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          loading: false,
        }),
      );
      console.log('info file', info.file);
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
      scope.props.onChange(file);
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
    const { imageUrl, image } = this.state;
    return (
      <ImgCrop rotate shape="round">
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          action={this.handleUploadImageAction}
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={this.handleChange}
        >
          {image.src ? (
            <img src={image.src} alt="avatar" style={{ width: '100%' }} />
          ) : (
            uploadButton
          )}
        </Upload>
      </ImgCrop>
    );
  }
}

export default Avatar;
