import { connect } from 'react-redux';
import { compose } from 'redux-balloon';
import biz from '@/biz';
import UserTable from '@/components/userManagement/UserTable';

const mapStateToProps = (state) => ({
  table: biz.selectors.getUserTableView(state)
});

const mapDispatchToProps = {
  reloadTable: biz.actions.reloadUserTable,
  updateUserParams: biz.actions.updateUserTableParams
};

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps)
);

export default enhance(UserTable);
