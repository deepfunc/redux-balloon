import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import MainSider from '@/components/nav/MainSider';

const enhance = compose(
  withRouter
);

export default enhance(MainSider);
