/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col } from 'antd';
import { setStaticAdsAction } from '../../redux/actions/staticAdsAction';
import './style.scss';

const mapStateToProps = state => ({
  staticAds: state.staticAdsState,
});

const mapDispatchToProps = dispatch => ({
  setStaticAds(arg) {
    dispatch(setStaticAdsAction(arg));
  },
});

const StaticAdsPanel = props => {
  const { ads } = props.staticAds;

  return (
    <div className="static-campaign-container">
      {ads && (
        <Row gutter={[0, 10]}>
          <Col span={24}>
            <Row justify="center">{ads.assetLink && <img src={ads.assetLink} alt="N/A" />}</Row>
          </Col>

          <Col span={24}>
            <Row justify="center">
              {ads.link && (
                <Button type="primary" href={ads.link} target="_blank">
                  {ads.buttonLabel}
                </Button>
              )}
            </Row>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(StaticAdsPanel);
