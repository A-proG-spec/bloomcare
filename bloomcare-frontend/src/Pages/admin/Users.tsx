import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '../../api/endpoints/admin';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { 
  FaUsers, 
  FaUserCog, 
  FaTrash, 
  FaEnvelope, 
  FaCheck, 
  FaTimes as FaTimesIcon 
} from 'react-icons/fa';

// ✅ ADDED: Proper types
interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user' | 'pharmacy_owner';
  isEmailVerified: boolean;
  image?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'user' | 'pharmacy_owner'>('user');

  // ✅ FIXED: Use ref to prevent double execution
  const hasLoaded = useRef(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        page,
        limit: 10,
      });
      setUsers(result.users || []);
      setTotalPages(result.pagination?.pages || 1);
      setTotalUsers(result.pagination?.total || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, page]);

  // ✅ FIXED: Only call once on mount
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadUsers();
    }
  }, [loadUsers]);

  // ✅ FIXED: Removed 'any' type - use proper type
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await adminApi.updateUserRole(selectedUser._id, newRole);
      toast.success('User role updated successfully');
      setIsRoleModalOpen(false);
      loadUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2 font-outfit">
          <FaUsers className="w-6 h-6 text-[#22c55e]" />
          User Management
        </h1>
        <span className="text-sm text-gray-500 font-outfit">Total: {totalUsers} users</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all duration-200 font-outfit"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E")`,
              backgroundPosition: '12px center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent bg-white transition-all duration-200 font-outfit"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="pharmacy_owner">Pharmacy Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-outfit">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.image || 'https://via.placeholder.com/40'}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <span className="font-medium text-black font-outfit">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1 font-outfit">
                      <FaEnvelope className="w-3 h-3 text-gray-400" />
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize text-sm px-2 py-0.5 rounded-xl font-medium font-outfit ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'pharmacy_owner' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isEmailVerified ? (
                        <FaCheck className="w-5 h-5 text-green-500" />
                      ) : (
                        <FaTimesIcon className="w-5 h-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setIsRoleModalOpen(true);
                          }}
                          icon={<FaUserCog className="w-3 h-3" />}
                        >
                          Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user._id)}
                          icon={<FaTrash className="w-3 h-3" />}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500 font-outfit">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        title="Change User Role"
        onClose={() => setIsRoleModalOpen(false)}
        onConfirm={handleRoleChange}
        confirmText="Update Role"
        confirmVariant="accent"
      >
        <div className="space-y-4">
          <p className="text-gray-600 font-outfit">
            Change role for <strong className="text-black">{selectedUser?.fullName}</strong>
          </p>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as 'admin' | 'user' | 'pharmacy_owner')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all duration-200 font-outfit"
          >
            <option value="user">User</option>
            <option value="pharmacy_owner">Pharmacy Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};