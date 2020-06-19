import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col } from 'antd';
import { setStaticAdsAction } from '../../redux/actions/staticAdsAction';
import request from '../../utils/request';
import './style.scss';

const mapStateToProps = state => ({
  staticAds: state.staticAdsState,
});

const mapDispatchToProps = dispatch => ({
  setStaticAds(arg) {
    dispatch(setStaticAdsAction(arg));
  },
});

class StaticAdsPanel extends Component {
  componentDidMount() {
    this.getStaticAds();
  }

  getStaticAds = async () => {
    try {
      const res = await request.axios('get', `/api/v1/campaign/static`);

      if (res && res.success) {
        this.props.setStaticAds(res.ads);
      } else {
        console.log(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { ads } = this.props.staticAds;
    console.log('static ads panel render', this);
    return (
      <div className="static-campaign-container">
        <Row gutter={[0, 10]}>
          <Col span={24}>
            <Row justify="center">
              <img src={ads.assetLink} alt="N/A" />
            </Row>
          </Col>

          <Col span={24}>
            <Row justify="center">
              <Button type="primary" href={ads.link}>
                {ads.buttonLabel}
              </Button>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StaticAdsPanel);