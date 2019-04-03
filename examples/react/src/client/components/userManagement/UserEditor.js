import React from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';

const { Option } = Select;

class UserEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { form, editor, onClose } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title="New User"
        visible={editor.showing}
        maskClosable={false}
        onOk={this.handleSubmit}
        onCancel={onClose}
        okText="Save"
        confirmLoading={editor.submitting}
      >
        <Form layout="vertical">
          <Form.Item label="Username">
            {getFieldDecorator('userName', {
              rules: [
                { required: true, message: 'Please input Username!' }
              ]
            })(
              <Input/>
            )}
          </Form.Item>
          <Form.Item label="Age">
            {getFieldDecorator('age', {
              rules: [
                { required: true, message: 'Please input Age!' }
              ]
            })(
              <InputNumber min={1} style={{ width: '100%' }}/>
            )}
          </Form.Item>
          <Form.Item label="Sex">
            {getFieldDecorator('sex')(
              <Select>
                <Option value="male">male</Option>
                <Option value="female">female</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Address">
            {getFieldDecorator('address')(
              <Input/>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onSubmit(values).then(() => {
          message.success('save successfully');
        });
      }
    });
  }
}

const UserEditorForm = Form.create({
  mapPropsToFields(props) {
    const data = props.editor.data;
    const createFormField = Form.createFormField;

    return {
      userName: createFormField(data.userName),
      age: createFormField(data.age),
      sex: createFormField(data.sex),
      address: createFormField(data.address)
    };
  },

  onFieldsChange(props, fields) {
    props.onSaveFields(fields);
  }
})(UserEditor);

export default UserEditorForm;
