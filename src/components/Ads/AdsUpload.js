/* eslint-disable react/no-unused-state */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint-disable func-names */
import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './styles.scss';

const { Dragger } = Upload;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

class AdsUpload extends React.Component {
  state = {
    loading: false,
    image: {},
  };

  beforeUpload = file => {
    // const isLt2M = file.size / 1024 / 1024 < 2;
    // this.props.setFileList([]);
    // return isLt2M;
    return true;
  };

  handleChange = info => {
    // const isLt2M = info.file.size / 1024 / 1024 < 2;
    // if (!isLt2M) {
    //   message.error('File must smaller than 2MB!');
    //   this.props.setFileList([]);
    //   return;
    // }

    const fileList = [...info.fileList];
    if (fileList && fileList.length > 0) {
      fileList[fileList.length - 1].status = 'success';
      // this.setState({ fileList: [fileList[fileList.length - 1]] });
      this.props.setFileList([fileList[fileList.length - 1]]);
    } else {
      this.props.setFileList([]);
    }

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
    }
  };

  handleUploadImageAction = file => {
    const fr = new FileReader();
    const scope = this;
    this.props.setFileList([]);
    // const isLt2M = file.size / 1024 / 1024 < 2;
    // if (!isLt2M) {
    //   return false;
    // }

    fr.onload = function() {
      const src = fr.result;

      scope.setState({
        image: {
          file,
          src,
        },
      });
      const myFile = new File([file], 'image');
      scope.props.onChange(myFile);
    };

    fr.readAsDataURL(file);

    return true;
  };

  render() {
    const { uploadText } = this.props;
    const { fileList } = this.props;
    return (
      <Dragger
        name="file"
        action={this.handleUploadImageAction}
        beforeUpload={this.beforeUpload}
        onChange={this.handleChange}
        multiple={false}
        fileList={fileList}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{uploadText}</p>
      </Dragger>
    );
  }
}

export default AdsUpload;
