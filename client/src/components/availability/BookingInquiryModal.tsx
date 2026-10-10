import React, { useState } from 'react';
import { availabilityApi } from '../../services/apiClient';
import { X, Calendar, Clock, DollarSign, Loader2 } from 'lucide-react';

interface BookingInquiryModalProps {
  creatorUserId: string;
  creatorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingInquiryModal: React.FC<BookingInquiryModalProps> = ({
  creatorUserId,
  creatorName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [offeredBudget, setOfferedBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!projectTitle.trim() || !startDate || !endDate) {
      setError('Project title, start date, and end date are required.');
      return;
    }

    try {
      setLoading(true);
      await availabilityApi.sendBookingInquiry({
        creatorUserId,
        projectTitle: projectTitle.trim(),
        startDate,
        endDate,
        offeredBudget: offeredBudget ? Number(offeredBudget) : undefined,
        notes: notes.trim(),
      });
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to send booking inquiry');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <Calendar size={22} />
            <h2 className="text-lg font-bold text-white">Send Booking Inquiry</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mt-2">
          Inquire about availability with <strong className="text-white">{creatorName}</strong> for an upcoming campaign window.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Campaign Title *</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="E.g., Autumn 3D Visual Commercial"
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Target Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Target End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Estimated Budget (INR)</label>
            <input
              type="number"
              value={offeredBudget}
              onChange={(e) => setOfferedBudget(e.target.value)}
              placeholder="E.g., 150000"
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Inquiry Details & Scope</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Describe campaign deliverables, media format, and production requirements..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-neutral-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Send Booking Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
