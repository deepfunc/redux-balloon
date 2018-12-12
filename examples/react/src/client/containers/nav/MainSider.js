import { compose } from 'redux-balloon';
import { withRouter } from 'react-router-dom';
import MainSider from '@/components/nav/MainSider';

const enhance = compose(
    withRouter
);

export default enhance(MainSider);
