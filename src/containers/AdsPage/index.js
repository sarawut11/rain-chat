import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Ads from '../../components/Ads';
import { initAppAction } from '../../redux/actions/initAppAction';
import { setAdsAction, createAdsAction } from './adsAction';

const mapStateToProps = state => ({
  ads: state.adsState,
});

const mapDispatchToProps = dispatch => ({
  initApp(arg) {
    dispatch(initAppAction(arg));
  },
  setAds(arg) {
    dispatch(setAdsAction(arg));
  },
  createAdsAction(arg) {
    dispatch(createAdsAction(arg));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Ads));
