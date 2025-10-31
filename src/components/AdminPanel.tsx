import { useState, useEffect } from 'react';
import { Trash2, UserX, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

export function AdminPanel() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user: ${email}?\n\nThis will:\n- Delete their profile from the database\n- Delete their auth account\n- This action cannot be undone!`)) {
      return;
    }

    setDeleting(userId);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('Deleting user:', userId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );

      console.log('Delete response status:', response.status);

      const data = await response.json();
      console.log('Delete response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess(`User ${email} deleted successfully`);

      setTimeout(() => {
        fetchUsers();
      }, 500);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600 mt-1">Manage all users in the system</p>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <UserX className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{user.full_name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : user.role === 'farmer'
                        ? 'bg-blue-100 text-blue-700'
                        : user.role === 'gardener'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      disabled={deleting === user.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === user.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
