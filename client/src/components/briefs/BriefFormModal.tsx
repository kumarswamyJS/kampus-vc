import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TimeMachineModal } from './TimeMachineModal';
import { Wand2, Compass, Upload, Check, AlertCircle, Sparkles, ArrowRight, Trash2, FileText } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { CampaignBrief, CreativeDirection, ReferenceAsset } from '../../types';

export interface BriefFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  briefToEdit?: CampaignBrief | null;
}

export const BriefFormModal: React.FC<BriefFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  briefToEdit,
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [category, setCategory] = useState('Tech & Digital');
  
  // Creative Direction
  const [visualStyle, setVisualStyle] = useState('');
  const [mood, setMood] = useState('');
  const [colorInput, setColorInput] = useState('#00F2FE, #3B82F6, #0B0F17');
  const [selectedDirection, setSelectedDirection] = useState<CreativeDirection | null>(null);
  const [referenceAssets, setReferenceAssets] = useState<ReferenceAsset[]>([]);

  // Deliverables
  const [delivDesc, setDelivDesc] = useState('Primary Hero Cinematic Video');
  const [delivType, setDelivType] = useState<'image' | 'video'>('video');
  const [delivQty, setDelivQty] = useState(1);
  const [delivAspect, setDelivAspect] = useState('16:9');
  const [delivRes, setDelivRes] = useState('4K');
  const [delivDuration, setDelivDuration] = useState(15);

  // Budget & Timeline
  const [budgetAmount, setBudgetAmount] = useState(15000);
  const [currency, setCurrency] = useState('INR');
  const [flexibility, setFlexibility] = useState<'Fixed' | 'Negotiable' | 'Range'>('Negotiable');
  const [deadline, setDeadline] = useState('');
  const [revisionLimit, setRevisionLimit] = useState(3);
  const [licensingPreferences, setLicensingPreferences] = useState('Commercial Buyout');

  // UI state
  const [aiConceptInput, setAiConceptInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Tech & Digital', 'Fashion & Beauty', 'Gaming', 'Automotive', 'Entertainment', 'Cyberpunk Art'];

  useEffect(() => {
    if (briefToEdit) {
      setTitle(briefToEdit.title || '');
      setSummary(briefToEdit.summary || '');
      setObjective(briefToEdit.objective || '');
      setTargetAudience(briefToEdit.targetAudience || '');
      setCategory(briefToEdit.category || 'Tech & Digital');
      setVisualStyle(briefToEdit.visualStyle || '');
      setMood(briefToEdit.mood || '');
      setColorInput(briefToEdit.colorPreferences ? briefToEdit.colorPreferences.join(', ') : '#00F2FE, #3B82F6');
      setSelectedDirection(briefToEdit.selectedDirection || null);
      setReferenceAssets(briefToEdit.referenceAssets || []);
      if (briefToEdit.deliverables && briefToEdit.deliverables[0]) {
        const d = briefToEdit.deliverables[0];
        setDelivDesc(d.description);
        setDelivType(d.mediaType);
        setDelivQty(d.quantity);
        setDelivAspect(d.aspectRatio);
        setDelivRes(d.resolution);
        setDelivDuration(d.duration || 15);
      }
      if (briefToEdit.budget) {
        setBudgetAmount(briefToEdit.budget.amount || 15000);
        setCurrency(briefToEdit.budget.currency || 'INR');
        setFlexibility(briefToEdit.budget.flexibility || 'Negotiable');
      }
      setDeadline(briefToEdit.deadline ? new Date(briefToEdit.deadline).toISOString().split('T')[0] : '');
      setRevisionLimit(briefToEdit.revisionLimit || 3);
      setLicensingPreferences(briefToEdit.licensingPreferences || 'Commercial Buyout');
    } else {
      resetForm();
    }
  }, [briefToEdit, isOpen]);

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setObjective('');
    setTargetAudience('Gen Z & Tech Enthusiasts');
    setCategory('Tech & Digital');
    setVisualStyle('Cinematic Cyberpunk Hyper-Realism');
    setMood('Visionary, High-Energy');
    setColorInput('#00F2FE, #3B82F6, #0B0F17');
    setSelectedDirection(null);
    setReferenceAssets([]);
    setDelivDesc('Primary Hero Cinematic Video');
    setDelivType('video');
    setDelivQty(1);
    setDelivAspect('16:9');
    setDelivRes('4K');
    setDelivDuration(15);
    setBudgetAmount(15000);
    setCurrency('INR');
    setFlexibility('Negotiable');
    setDeadline('');
    setRevisionLimit(3);
    setLicensingPreferences('Commercial Buyout');
    setError(null);
    setStep(1);
  };

  const handleAIGenerate = async () => {
    if (!aiConceptInput.trim()) return;
    setAiGenerating(true);
    setError(null);
    try {
      const data = await apiClient.generateAIBrief({
        conceptIdea: aiConceptInput,
        category,
        budgetAmount,
      });
      if (data) {
        setTitle(data.suggestedTitle || title);
        setSummary(data.summary || summary);
        setObjective(data.objective || objective);
        setTargetAudience(data.targetAudience || targetAudience);
        setVisualStyle(data.proposedStyle || visualStyle);
        setMood(data.mood || mood);
        if (data.colorPalette) setColorInput(data.colorPalette.join(', '));
      }
    } catch (err) {
      setError('AI brief generation failed. You can continue editing manually.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleReferenceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingRef(true);
      try {
        const uploaded = await apiClient.uploadReferenceAsset(file);
        setReferenceAssets((prev) => [...prev, uploaded]);
      } catch (err) {
        setError('Failed to upload reference asset image.');
      } finally {
        setUploadingRef(false);
      }
    }
  };

  const handleSaveBrief = async (publishImmediate = false) => {
    if (!title.trim()) {
      setError('Please specify a campaign title.');
      setStep(1);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const colors = colorInput.split(',').map((c) => c.trim()).filter(Boolean);

      const payload = {
        title,
        summary,
        objective,
        description: summary,
        targetAudience,
        category,
        visualStyle,
        mood,
        colorPreferences: colors,
        selectedDirection: selectedDirection || undefined,
        referenceAssets,
        deliverables: [
          {
            description: delivDesc,
            mediaType: delivType,
            quantity: delivQty,
            aspectRatio: delivAspect,
            resolution: delivRes,
            duration: delivDuration,
            fileFormats: [delivType === 'video' ? 'MP4' : 'PNG'],
            sourceFilesRequired: true,
          },
        ],
        budget: {
          amount: Number(budgetAmount),
          currency,
          flexibility,
        },
        deadline: deadline || undefined,
        revisionLimit: Number(revisionLimit),
        licensingPreferences,
      };

      let savedBrief: CampaignBrief;
      if (briefToEdit) {
        savedBrief = await apiClient.updateBrief(briefToEdit._id, payload);
      } else {
        savedBrief = await apiClient.createBrief(payload);
      }

      if (publishImmediate && savedBrief && savedBrief._id) {
        await apiClient.publishBrief(savedBrief._id);
      }

      setSaving(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to save brief.');
      } else {
        setError('Server network error. Please try again.');
      }
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={briefToEdit ? 'Edit Campaign Brief' : 'Create AI Campaign Brief'}
      description="Define campaign requirements, upload visual references, and generate AI creative direction."
    >
      <div className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-2">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Prompt Generator Banner */}
        <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" /> AI Brief Assistant
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="py-1 text-[11px]"
              onClick={() => setIsTimeMachineOpen(true)}
              leftIcon={<Compass className="w-3.5 h-3.5 text-electric-blue" />}
            >
              Creative Time Machine
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Describe your campaign idea in 1 line..."
              value={aiConceptInput}
              onChange={(e) => setAiConceptInput(e.target.value)}
              className="flex-1 bg-dark-900 border border-white/10 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={aiGenerating}
              onClick={handleAIGenerate}
            >
              Auto-Fill Draft
            </Button>
          </div>
        </div>

        {/* Step Navigation Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Direction' },
            { num: 3, label: 'Deliverables' },
            { num: 4, label: 'Budget & Timeline' },
            { num: 5, label: 'Review' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`px-3 py-1.5 rounded-xl border whitespace-nowrap font-medium transition-all ${
                step === s.num
                  ? 'bg-brand-500/20 border-brand-500/60 text-brand-300'
                  : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {s.num}. {s.label}
            </button>
          ))}
        </div>

        {/* Step 1: Campaign Basics */}
        {step === 1 && (
          <div className="space-y-3 pt-2">
            <Input label="Campaign Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Next-Gen Sound Campaign" />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Category / Industry</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                      category === cat
                        ? 'bg-brand-500/20 border-brand-500/60 text-brand-300 font-semibold'
                        : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Campaign Objective & Description</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Explain what this campaign aims to achieve and key messaging..."
                className="w-full bg-dark-900 border border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-500 min-h-[80px]"
              />
            </div>

            <Input label="Target Audience Persona" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Gen Z & Millennial Tech Enthusiasts" />

            <div className="pt-2 flex justify-end">
              <Button type="button" variant="primary" size="sm" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Creative Direction
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Creative Direction & Reference Images */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <Input label="Visual Style & Aesthetic" value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} placeholder="Cinematic Cyberpunk Hyper-Realism" />
            <Input label="Mood & Desired Tone" value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Visionary, High-Energy, Prestigious" />
            <Input label="Color Preferences (Hex or names)" value={colorInput} onChange={(e) => setColorInput(e.target.value)} placeholder="#00F2FE, #3B82F6, #0B0F17" />

            {/* Selected Creative Time Machine Direction Badge */}
            {selectedDirection && (
              <div className="p-3 bg-electric-blue/10 border border-electric-blue/30 rounded-xl space-y-1">
                <span className="text-xs font-bold text-electric-blue flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Time Machine Direction: {selectedDirection.directionName}
                </span>
                <p className="text-[11px] text-slate-300">{selectedDirection.concept}</p>
              </div>
            )}

            {/* Reference Images Upload Section */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">Attach Creative Reference Images</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" isLoading={uploadingRef} leftIcon={<Upload className="w-4 h-4" />}>
                    Upload Reference Image
                  </Button>
                  <input type="file" accept="image/*" onChange={handleReferenceFileUpload} className="hidden" />
                </label>
                <span className="text-[11px] text-slate-400">JPEG, PNG, WebP (Max 10MB)</span>
              </div>

              {referenceAssets.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {referenceAssets.map((ref, idx) => (
                    <div key={ref.publicId || idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-dark-900 group">
                      <img src={ref.url} alt="Ref" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReferenceAssets((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-dark-950/80 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
              <Button type="button" variant="primary" size="sm" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Deliverables
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Deliverables & Specs */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <Input label="Deliverable Description" value={delivDesc} onChange={(e) => setDelivDesc(e.target.value)} placeholder="Primary Hero Cinematic Video" />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Media Type</label>
                <select
                  value={delivType}
                  onChange={(e) => setDelivType(e.target.value as any)}
                  className="w-full bg-dark-900 border border-white/10 text-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="video">Video</option>
                  <option value="image">Still Image</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={delivQty}
                  onChange={(e) => setDelivQty(Number(e.target.value))}
                  className="w-full bg-dark-900 border border-white/10 text-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input label="Aspect Ratio" value={delivAspect} onChange={(e) => setDelivAspect(e.target.value)} placeholder="16:9 or 9:16" />
              <Input label="Resolution" value={delivRes} onChange={(e) => setDelivRes(e.target.value)} placeholder="4K" />
              {delivType === 'video' && (
                <Input label="Duration (s)" type="number" value={delivDuration} onChange={(e) => setDelivDuration(Number(e.target.value))} />
              )}
            </div>

            <div className="pt-2 flex justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep(2)}>Back</Button>
              <Button type="button" variant="primary" size="sm" onClick={() => setStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Budget & Timeline
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Budget & Timeline */}
        {step === 4 && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input label="Campaign Budget Amount *" type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 text-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Deadline Date" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              <Input label="Allowed Revisions" type="number" value={revisionLimit} onChange={(e) => setRevisionLimit(Number(e.target.value))} />
            </div>

            <Input label="Licensing & Rights Terms" value={licensingPreferences} onChange={(e) => setLicensingPreferences(e.target.value)} placeholder="Commercial Buyout" />

            <div className="pt-2 flex justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep(3)}>Back</Button>
              <Button type="button" variant="primary" size="sm" onClick={() => setStep(5)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next: Review & Save
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Save */}
        {step === 5 && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-dark-900 rounded-2xl border border-white/10 space-y-2 text-xs">
              <h4 className="text-sm font-bold text-white">{title || 'Untitled Campaign'}</h4>
              <p className="text-slate-300">{summary || 'No description provided.'}</p>
              <div className="flex flex-wrap gap-3 pt-2 text-slate-400">
                <span>Category: <strong className="text-white">{category}</strong></span>
                <span>Budget: <strong className="text-emerald-400">{currency} {budgetAmount}</strong></span>
                <span>Deliverable: <strong className="text-white">{delivQty}x {delivDesc} ({delivAspect})</strong></span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep(4)}>Back</Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={saving}
                  onClick={() => handleSaveBrief(false)}
                >
                  Save as Draft
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  onClick={() => handleSaveBrief(true)}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Publish Campaign Brief
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Time Machine Sub-Modal */}
      <TimeMachineModal
        isOpen={isTimeMachineOpen}
        onClose={() => setIsTimeMachineOpen(false)}
        initialConcept={aiConceptInput || title}
        category={category}
        onSelectDirection={(dir) => {
          setSelectedDirection(dir);
          setVisualStyle(dir.visualTreatment || visualStyle);
          setMood(dir.mood || mood);
          if (dir.palette) setColorInput(dir.palette.join(', '));
        }}
      />
    </Dialog>
  );
};

export default BriefFormModal;
