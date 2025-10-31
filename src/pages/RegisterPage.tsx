import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/database';
import { Loader2 } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();

  const [role, setRole] = useState<UserRole>((searchParams.get('role') as UserRole) || 'gardener');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
  });

  const [roleData, setRoleData] = useState<Record<string, string>>({});

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['gardener', 'farmer', 'rancher'].includes(roleParam)) {
      setRole(roleParam as UserRole);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        role,
        full_name: formData.full_name,
        phone: formData.phone,
        ...roleData,
      });

      navigate('/confirm-email');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleFields = () => {
    switch (role) {
      case 'gardener':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Size
              </label>
              <input
                type="text"
                placeholder="e.g., 1/4 acre"
                value={roleData.property_size || ''}
                onChange={(e) => setRoleData({ ...roleData, property_size: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garden Type
              </label>
              <input
                type="text"
                placeholder="e.g., Vegetable, Flower, Mixed"
                value={roleData.garden_type || ''}
                onChange={(e) => setRoleData({ ...roleData, garden_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Growing Zone
              </label>
              <input
                type="text"
                placeholder="e.g., Zone 5b"
                value={roleData.growing_zone || ''}
                onChange={(e) => setRoleData({ ...roleData, growing_zone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </>
        );
      case 'farmer':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Size
              </label>
              <input
                type="text"
                placeholder="e.g., 100 acres"
                value={roleData.farm_size || ''}
                onChange={(e) => setRoleData({ ...roleData, farm_size: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Crops
              </label>
              <input
                type="text"
                placeholder="e.g., Corn, Soybeans"
                value={roleData.crop_types || ''}
                onChange={(e) => setRoleData({ ...roleData, crop_types: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farming Practices
              </label>
              <input
                type="text"
                placeholder="e.g., Organic, Conventional, Regenerative"
                value={roleData.farming_practices || ''}
                onChange={(e) => setRoleData({ ...roleData, farming_practices: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </>
        );
      case 'rancher':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ranch Size
              </label>
              <input
                type="text"
                placeholder="e.g., 500 acres"
                value={roleData.ranch_size || ''}
                onChange={(e) => setRoleData({ ...roleData, ranch_size: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Livestock Types
              </label>
              <input
                type="text"
                placeholder="e.g., Cattle, Sheep, Goats"
                value={roleData.livestock_types || ''}
                onChange={(e) => setRoleData({ ...roleData, livestock_types: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grazing Management
              </label>
              <input
                type="text"
                placeholder="e.g., Rotational, Continuous"
                value={roleData.grazing_management || ''}
                onChange={(e) => setRoleData({ ...roleData, grazing_management: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <img src="/PRANIC SOIL Logo.png" alt="Pranic Soil" className="h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
          <p className="text-gray-600 mt-2">Join Pranic Soil as a {role}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {renderRoleFields()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
