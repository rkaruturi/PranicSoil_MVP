import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Mail } from 'lucide-react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Not Confirmed</h2>
          <p className="text-gray-600 mb-6">
            Please check your email and click the confirmation link to access your account.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Setting up your profile...</p>
      </div>
    );
  }

  return <>{children}</>;
}
