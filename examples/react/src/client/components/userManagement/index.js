import React from 'react';
import UserToolbar from '@/containers/userManagement/UserToolbar';
import UserTable from '@/containers/userManagement/UserTable';
import UserEditor from '@/containers/userManagement/UserEditor';

const UserManagement = () => (
  <>
    <UserToolbar/>
    <UserTable/>
    <UserEditor/>
  </>
);

export default UserManagement;
