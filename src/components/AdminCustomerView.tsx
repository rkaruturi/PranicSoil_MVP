import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';
import { ProfileSection } from './ProfileSection';
import { ServiceAgreements } from './ServiceAgreements';
import { TodoList } from './TodoList';
import { DocumentsList } from './DocumentsList';
import { ChatInterface } from './ChatInterface';

interface AdminCustomerViewProps {
  customerId: string;
  onBack: () => void;
}

export function AdminCustomerView({ customerId, onBack }: AdminCustomerViewProps) {
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const fetchCustomer = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Customer not found');

      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error || 'Customer not found'}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'agreements', label: 'Service Agreements' },
    { id: 'todos', label: 'To-Do List' },
    { id: 'documents', label: 'Documents' },
    { id: 'chat', label: 'Chat History' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </button>

        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.full_name}</h1>
              <p className="text-gray-600 mt-1">{customer.email}</p>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              customer.role === 'farmer'
                ? 'bg-blue-100 text-blue-700'
                : customer.role === 'gardener'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {customer.role}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'profile' && <ProfileSection profileId={customerId} isAdminView />}
      {activeTab === 'agreements' && <ServiceAgreements profileId={customerId} isAdminView />}
      {activeTab === 'todos' && <TodoList profileId={customerId} isAdminView />}
      {activeTab === 'documents' && <DocumentsList profileId={customerId} isAdminView />}
      {activeTab === 'chat' && <ChatInterface profileId={customerId} isAdminView />}
    </div>
  );
}
