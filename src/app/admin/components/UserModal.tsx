'use client';
import { User } from '../type';

interface UserModalProps {
  selectedUser: User | null;
  userFormData: Partial<User>;
  setUserFormData: React.Dispatch<React.SetStateAction<Partial<User>>>;
  setShowUserModal: (show: boolean) => void;
  saveUserChanges: () => void;
}

export default function UserModal({
  selectedUser,
  userFormData,
  setUserFormData,
  setShowUserModal,
  saveUserChanges
}: UserModalProps) {
  // Define editable fields explicitly
  type FormFields = Pick<User, 'name' | 'email' | 'role' | 'subscription'>;

  const handleChange = <K extends keyof FormFields>(
    field: K,
    value: FormFields[K]
  ) => {
    setUserFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: '#f0eeee' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#3d312e' }}>
          {selectedUser ? "Edit User" : "Add New User"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#3d312e' }}>Name</label>
            <input
              type="text"
              value={userFormData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 rounded-lg transition-all duration-200 focus:shadow-md focus:outline-none"
              style={{ border: '1px solid #bba2a2', backgroundColor: '#f0eeee' }}
            />
          </div>

          {/* You can repeat this pattern for other fields (email, role, subscription) */}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowUserModal(false)}
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-90"
            style={{ border: '1px solid #948585', color: '#3d312e' }}
          >
            Cancel
          </button>
          <button
            onClick={saveUserChanges}
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-90"
            style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
