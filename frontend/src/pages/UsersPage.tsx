import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Edit2,
  Trash2,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  KeyRound
} from 'lucide-react';

interface UsersPageProps {
  currentUser?: User | null;
  onRefreshCounts?: () => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ currentUser, onRefreshCounts }) => {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'content_manager',
    password: '',
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [search, selectedRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(search.trim() || undefined, selectedRole !== 'all' ? selectedRole : undefined);
      setUsers(data);
      onRefreshCounts?.();
    } catch (err: any) {
      toast.error('Failed to load administrator accounts', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      full_name: '',
      role: 'content_manager',
      password: '',
      is_active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      password: '', // Blank unless changing
      is_active: user.is_active,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.full_name.trim()) {
      setFormError('Please fill in all required account fields.');
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      setFormError('New administrator password must be at least 6 characters.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          username: formData.username.trim(),
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          role: formData.role as any,
          is_active: formData.is_active,
          ...(formData.password ? { password: formData.password } : {}),
        });
        toast.success('Account Updated', `Administrator ${formData.username} updated.`);
      } else {
        await api.createUser({
          username: formData.username.trim(),
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          role: formData.role,
          password: formData.password,
          is_active: formData.is_active,
        });
        toast.success('Account Created', `New administrator ${formData.username} registered.`);
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteUser(userToDelete.id);
      toast.success('Account Deleted', `Administrator '${userToDelete.username}' removed.`);
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      toast.error('Deletion Failed', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#431322] text-[#F6E7A8] border border-[#F6E7A8]/40">Super Admin</span>;
      case 'content_manager':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF1F7] text-[#557A9C] border border-[#C8DCF0]">Content Manager</span>;
      case 'order_manager':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3ED] text-[#477A58] border border-[#C5E3D0]">Order Manager</span>;
      case 'viewer':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Auditor (Viewer)</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">Administrator</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#292326] tracking-tight">
            Administrator Accounts & Access Control
          </h2>
          <p className="text-xs text-[#82777A]">
            Manage staff credentials, assigned operational roles, and system permissions
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Add Administrator
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#EAE3DE] shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by username, full name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-56 shrink-0">
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'super-admin', label: 'Super Admin' },
              { value: 'content_manager', label: 'Content Manager' },
              { value: 'order_manager', label: 'Order Manager' },
              { value: 'viewer', label: 'Auditor (Viewer)' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EAE3DE] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-[#EAE3DE] text-[#82777A] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3DE]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#82777A]">
                    Loading administrator accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#82777A]">
                    No administrators found matching your query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#651C32] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {u.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#292326] block">
                                {u.full_name}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFF6D9] text-[#651C32] font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#82777A] block">
                              @{u.username} • {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>
                      <td className="py-3.5 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#477A58]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                            <XCircle className="w-3.5 h-3.5" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#82777A]">
                        {u.last_login
                          ? new Date(u.last_login).toLocaleDateString([], {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#82777A]">
                        {new Date(u.created_at).toLocaleDateString([], {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-[#82777A] hover:text-[#651C32] hover:bg-[#FFF6D9] transition-colors"
                            title="Edit Administrator"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 rounded-lg text-[#82777A] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Administrator"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit Account: ${editingUser.username}` : 'Add New Administrator'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#292326] mb-1">Full Name *</label>
            <Input
              required
              placeholder="e.g. Dr. Arthur Pendelton"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292326] mb-1">Username *</label>
              <Input
                required
                placeholder="arthur_p"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#292326] mb-1">Email Address *</label>
              <Input
                type="email"
                required
                placeholder="arthur@dotcompublications.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#292326] mb-1">
                {editingUser ? 'Password (Leave blank to keep current)' : 'Password *'}
              </label>
              <Input
                type="password"
                required={!editingUser}
                placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292326] mb-1">Role & Permissions *</label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: 'super-admin', label: 'Super Admin (Full Access)' },
                  { value: 'content_manager', label: 'Content Manager (Books, CMS, Media)' },
                  { value: 'order_manager', label: 'Order Manager (Orders & Invoices)' },
                  { value: 'viewer', label: 'Auditor (Viewer - Read Only)' },
                ]}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-[#EAE3DE] text-[#651C32] focus:ring-[#651C32]"
              />
              <span className="text-xs font-semibold text-[#292326]">
                Account is active and authorized to sign in
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#EAE3DE] flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete Administrator Account"
        message={`Are you sure you want to permanently delete administrator '${userToDelete?.username}' (${userToDelete?.full_name})? This action will revoke all access immediately.`}
        confirmText="Permanently Delete"
        cancelText="Keep Account"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};
