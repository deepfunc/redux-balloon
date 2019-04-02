import { connect } from 'react-redux';
import { compose } from 'redux';
import biz from '@/biz';
import UserEditor from '@/components/userManagement/UserEditor';

const mapStateToProps = (state) => ({
  editor: biz.selectors.getUserEditor(state)
});

const mapDispatchToProps = {
  onClose: biz.actions.closeUserEditor,
  onSaveFields: biz.actions.saveUserEditorFields,
  onSubmit: biz.actions.submitUserData
};

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps)
);

export default enhance(UserEditor);
