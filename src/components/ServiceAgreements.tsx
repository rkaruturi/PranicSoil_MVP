import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ServiceAgreement, Invoice } from '../types/database';
import { FileText, DollarSign, Calendar, Loader2 } from 'lucide-react';

export function ServiceAgreements() {
  const { profile } = useAuth();
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    const [agreementsResponse, invoicesResponse] = await Promise.all([
      supabase
        .from('service_agreements')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('invoices')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false }),
    ]);

    if (!agreementsResponse.error && agreementsResponse.data) {
      setAgreements(agreementsResponse.data);
    }

    if (!invoicesResponse.error && invoicesResponse.data) {
      setInvoices(invoicesResponse.data);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Service Agreements & Invoices</h1>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Agreements</h2>
        <div className="space-y-4">
          {agreements.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No service agreements yet.</p>
            </div>
          ) : (
            agreements.map((agreement) => (
              <div key={agreement.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {agreement.agreement_type}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          agreement.status
                        )}`}
                      >
                        {agreement.status}
                      </span>
                    </div>
                    {agreement.notes && (
                      <p className="text-gray-600 mb-3">{agreement.notes}</p>
                    )}
                    <div className="flex gap-6 text-sm text-gray-500">
                      {agreement.start_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Start: {new Date(agreement.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {agreement.end_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          End: {new Date(agreement.end_date).toLocaleDateString()}
                        </div>
                      )}
                      {agreement.total_amount && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          ${Number(agreement.total_amount).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Invoices</h2>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No invoices yet.</p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Invoice #{invoice.invoice_number}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    {invoice.description && (
                      <p className="text-gray-600 mb-3">{invoice.description}</p>
                    )}
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <DollarSign className="w-5 h-5" />
                        ${Number(invoice.amount).toFixed(2)}
                      </div>
                      {invoice.due_date && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {invoice.payment_date && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Calendar className="w-4 h-4" />
                          Paid: {new Date(invoice.payment_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={invoice.status === 'paid'}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {invoice.status === 'paid' ? 'Paid' : 'Pay Now'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {invoices.some((inv) => inv.status !== 'paid') && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Payment processing will be available soon. For now, please
            contact support to arrange payment.
          </p>
        </div>
      )}
    </div>
  );
}
