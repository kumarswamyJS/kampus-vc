import React, { useState, useEffect } from 'react';
import { adminApi, proofApi, paymentApi } from '../../services/apiClient';
import {
  ShieldAlert,
  Users,
  Briefcase,
  CreditCard,
  FileCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingProofs, setPendingProofs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'proofs' | 'reconciliation'>('metrics');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reconcileResult, setReconcileResult] = useState<any | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardMetrics();
      setMetrics(data);

      const userList = await adminApi.getUsersList();
      setUsers(userList || []);

      const proofs = await proofApi.getAdminPendingProofs();
      setPendingProofs(proofs || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      setActionLoading(userId);
      await adminApi.updateUserStatus(userId, { status: newStatus, reason: 'Administrative moderation toggle' });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewProof = async (proofId: string, status: 'evidence_verified' | 'rejected') => {
    try {
      setActionLoading(proofId);
      await proofApi.reviewProof(proofId, { status, reviewerNotes: `Reviewed by admin on ${new Date().toLocaleDateString()}` });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to review proof');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunReconciliation = async () => {
    try {
      setActionLoading('reconcile');
      const res = await adminApi.triggerReconciliation();
      setReconcileResult(res);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Reconciliation execution failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading Administrative Control Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Administrative Operations Console</h1>
              <p className="text-xs text-slate-400">Kampus.VC System Governance, Verification Reviews, & Financial Audit</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'metrics' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'users' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              User Accounts ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('proofs')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'proofs' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Proof Reviews ({pendingProofs.length})
            </button>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'reconciliation' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Financial Audit
            </button>
          </div>
        </div>

        {/* METRICS OVERVIEW */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold block mb-1">Total Users</span>
                <p className="text-3xl font-extrabold text-white">{metrics.totalUsers}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">{metrics.totalCreators} Creators • {metrics.totalBrands} Brands</span>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold block mb-1">Active Projects</span>
                <p className="text-3xl font-extrabold text-cyan-400">{metrics.activeProjects}</p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold block mb-1">Open Disputes</span>
                <p className="text-3xl font-extrabold text-rose-400">{metrics.openDisputes}</p>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold block mb-1">Captured Payments</span>
                <p className="text-3xl font-extrabold text-emerald-400">{metrics.totalCapturedPayments}</p>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Recent Operational Audit Log</h3>
              <div className="space-y-2 text-xs">
                {metrics.recentLogs?.map((log: any) => (
                  <div key={log._id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-cyan-400 capitalize">{log.action.replace('_', ' ')}</span>
                      <span className="text-slate-400 block text-[11px]">Target: {log.targetType} ({log.targetId || 'N/A'})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Registered User Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="pb-3">User</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="py-3 font-semibold text-white">{u.displayName}</td>
                      <td className="py-3 capitalize text-cyan-400 font-mono">{u.role}</td>
                      <td className="py-3 text-slate-400">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          disabled={actionLoading === u._id}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                        >
                          {u.status === 'suspended' ? 'Reinstate Account' : 'Suspend Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROOF REVIEWS TAB */}
        {activeTab === 'proofs' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Pending Proof-of-Creativity Review Submissions</h3>
            {pendingProofs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No pending proof submissions awaiting review.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingProofs.map((p) => (
                  <div key={p._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-white block">{p.portfolioItemId?.title || 'Portfolio Work'}</span>
                        <span className="text-[10px] text-slate-400">Submitted by {p.creatorUserId?.displayName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-mono">
                        {p.status}
                      </span>
                    </div>

                    <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">{p.contributionDescription}</p>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleReviewProof(p._id, 'rejected')}
                        disabled={actionLoading === p._id}
                        className="px-3 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-lg font-semibold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleReviewProof(p._id, 'evidence_verified')}
                        disabled={actionLoading === p._id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg"
                      >
                        Verify Evidence
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FINANCIAL RECONCILIATION TAB */}
        {activeTab === 'reconciliation' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Financial Ledger Reconciliation Service</h3>
                <p className="text-xs text-slate-400">Audit captured provider payments against verified immutable ledger events</p>
              </div>
              <button
                onClick={handleRunReconciliation}
                disabled={actionLoading === 'reconcile'}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={actionLoading === 'reconcile' ? 'animate-spin' : ''} /> Execute Audit Run
              </button>
            </div>

            {reconcileResult && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-emerald-400 block text-sm">Reconciliation Audit Summary</span>
                <p className="text-slate-200">{reconcileResult.summary}</p>
                <span className="text-[10px] text-slate-400 block font-mono">Run ID: {reconcileResult.runId}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
