import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Ads from '../../components/Ads';
import { initAppAction } from '../../redux/actions/initAppAction';
import { setGlobalAdssAction } from './adsAction';

const mapStateToProps = state => ({
  globalAdss: state.globalAdssState,
});

const mapDispatchToProps = dispatch => ({
  initApp(arg) {
    dispatch(initAppAction(arg));
  },
  setGlobalAdss(arg) {
    dispatch(setGlobalAdssAction(arg));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Ads));
