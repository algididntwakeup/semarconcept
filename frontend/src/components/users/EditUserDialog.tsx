// platform/frontend-mui/src/components/users/EditUserDialog.tsx

import React from 'react';
import UserForm from './UserForm';
import { User, UserFormData } from '../../types/user.types';
import { useUserMutations } from '../../hooks/useUsers';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onClose,
  user,
  onSuccess,
}) => {
  const { updateUser, loading } = useUserMutations();

  const handleSubmit = async (formData: UserFormData) => {
    if (!user) return;

    const updateData = {
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
    };

    await updateUser(user.id, updateData);
    onClose();
    onSuccess?.();
  };

  return (
    <UserForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      user={user}
      loading={loading}
      title="Edit User"
    />
  );
};

export default EditUserDialog;