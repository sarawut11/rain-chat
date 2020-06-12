import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Admin from '../../components/Admin';
import { initAppAction } from '../../redux/actions/initAppAction';
import { setAdminAction } from './adminAction';

const mapStateToProps = state => ({
  admin: state.adminState,
});

const mapDispatchToProps = dispatch => ({
  initApp(arg) {
    dispatch(initAppAction(arg));
  },
  setAdmin(arg) {
    dispatch(setAdminAction(arg));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Admin));
