// platform/frontend-mui/src/components/users/CreateUserDialog.tsx

import React from 'react';
import UserForm from './UserForm';
import { UserFormData } from '../../types/user.types';
import { useUserMutations } from '../../hooks/useUsers';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { createUser, loading } = useUserMutations();

  const handleSubmit = async (formData: UserFormData) => {
    const createData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      employee_id: formData.employee_id,
      role: formData.role,
      department: formData.department,
      location: formData.location,
      manager_id: formData.manager_id || undefined,
      two_factor_enabled: formData.two_factor_enabled,
      send_welcome_email: formData.send_welcome_email,
    };

    await createUser(createData);
    onClose();
    onSuccess?.();
  };

  return (
    <UserForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      title="Create New User"
    />
  );
};

export default CreateUserDialog;