import React from 'react';
import { Modal, notification, Row, Col, Button } from 'antd';
import './ads.scss';
import store from '../redux/store';
import { enableShowAds, disableShowAds } from '../redux/actions/bShowAdsAction';

export function showAds(ads, duration, staticPost = false) {
  console.log('showAds', ads, staticPost);
  const { bShowAds } = store.getState();
  const { title, description, link, assetLink, buttonLabel } = ads;
  const content = (
    <div>
      <img src={assetLink} alt="ads" />
      {staticPost && <p className="upgrade-warning">Upgrade membership to avoid this ads.</p>}
    </div>
  );

  if (!window.location.pathname.includes('vitae-rain-group') && !staticPost) {
    return;
  }

  if (!bShowAds) {
    return;
  }

  if (!staticPost) {
    try {
      const user_info = JSON.parse(localStorage.getItem('userInfo'));
      const { token } = user_info;

      window.socket.emit('subscribeAdsReward', { token });
    } catch (e) {
      console.log(e);
      return;
    }
  }

  console.log('here');

  store.dispatch(disableShowAds());

  const modal = Modal.success({
    // title: 'This is a notification message',
    content,
    icon: null,
    title: (
      <div>
        <h2>{title}</h2>
        <Row gutter={10} align="middle">
          <Col span={18}>
            <p>{description}</p>
          </Col>
          <Col span={6}>
            <Button
              type="primary"
              href={link}
              target="_blank"
              size="large"
              style={{ width: '100%' }}
            >
              {buttonLabel || 'Buy Now'}
            </Button>
          </Col>
        </Row>
      </div>
    ),
    className: 'campaign-view-modal',
    okText: buttonLabel,
  });
  // const timer = setInterval(() => {
  //   secondsToGo -= 1;
  //   modal.update({
  //     content: `This modal will be destroyed after ${secondsToGo} second.`,
  //   });
  // }, 1000);
  setTimeout(() => {
    // clearInterval(timer);
    modal.destroy();
    store.dispatch(enableShowAds());
  }, duration);
}

const openNotificationWithIcon = (type, props) => {
  notification[type]({ ...props });
};

export function notifyRainComing(after) {
  openNotificationWithIcon('info', {
    message: 'Rain is coming soon',
    description: `Rain is coming in ${after / 1000} seconds. Please get ready for the rain`,
  });
}

export function notifyRainReward(reward) {
  const notifyRainRewardContent = (
    <div>
      <Row justify="center">
        <img src="../../assets/vitae-token-green-logo.png" alt="vitae-logo" />
      </Row>
      <Row justify="center">{reward} Vitae</Row>
    </div>
  );
  const audio = new Audio('../assets/Win_Coins_MP3.mp3');
  audio.play();
  notification.info({
    icon: null,
    description: notifyRainRewardContent,
    message: null,
    className: 'rain-reward-notify-container',
    style: { width: '200px' },
  });
}
