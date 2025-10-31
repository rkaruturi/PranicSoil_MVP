import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ConfirmEmailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h2>

        <p className="text-gray-600 mb-6">
          We've sent you an email with a confirmation link. Please check your inbox and click the link to verify your email address.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The confirmation link will expire in 24 hours. If you don't see the email, check your spam folder.
          </p>
        </div>

        <p className="text-gray-600 mb-4">
          After confirming your email, you'll be able to sign in and access your dashboard.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
}
