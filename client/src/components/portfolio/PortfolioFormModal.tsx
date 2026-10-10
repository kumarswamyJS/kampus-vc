import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Upload, Check, AlertCircle, Wand2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { PortfolioItem } from '../../types';

export interface PortfolioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemToEdit?: PortfolioItem | null;
}

export const PortfolioFormModal: React.FC<PortfolioFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  itemToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI Filmmaking');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [tagsInput, setTagsInput] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [projectRole, setProjectRole] = useState('AI Director');
  const [aiInvolvement, setAiInvolvement] = useState<'Full Generative' | 'Hybrid AI-VFX' | 'AI Assisted'>('Full Generative');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [commercialLicensing, setCommercialLicensing] = useState<'Commercial Buyout' | 'Personal Non-Commercial' | 'Exclusive Rights'>('Commercial Buyout');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'draft'>('public');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['AI Filmmaking', '3D Animation', 'Generative Visuals', 'VFX & Motion', 'Brand Identity', 'Cyberpunk Art'];

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setDescription(itemToEdit.description || '');
      setCategory(itemToEdit.category || 'AI Filmmaking');
      setMediaUrl(itemToEdit.mediaUrl || '');
      setMediaType(itemToEdit.mediaType || 'image');
      setFilePreview(itemToEdit.mediaUrl || null);
      setTagsInput(itemToEdit.tags ? itemToEdit.tags.join(', ') : '');
      setToolsInput(itemToEdit.toolsUsed ? itemToEdit.toolsUsed.join(', ') : '');
      setProjectRole(itemToEdit.projectRole || 'AI Director');
      setAiInvolvement(itemToEdit.aiInvolvement || 'Full Generative');
      setWorkflowDescription(itemToEdit.workflowDescription || '');
      setCommercialLicensing(itemToEdit.commercialLicensing || 'Commercial Buyout');
      setVisibility(itemToEdit.visibility || 'public');
    } else {
      resetForm();
    }
  }, [itemToEdit, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('AI Filmmaking');
    setMediaUrl('');
    setMediaType('image');
    setSelectedFile(null);
    setFilePreview(null);
    setTagsInput('');
    setToolsInput('Runway Gen-3, Midjourney v6, ComfyUI');
    setProjectRole('AI Director');
    setAiInvolvement('Full Generative');
    setWorkflowDescription('');
    setCommercialLicensing('Commercial Buyout');
    setVisibility('public');
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const isVid = file.type.startsWith('video/');
      setMediaType(isVid ? 'video' : 'image');
      setFilePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a portfolio title.');
      return;
    }

    let finalMediaUrl = mediaUrl;

    setSaving(true);
    setError(null);

    try {
      // 1. Upload file if new file selected
      if (selectedFile) {
        setUploading(true);
        const uploadRes = await apiClient.uploadMediaFile(selectedFile);
        finalMediaUrl = uploadRes.url;
        setMediaType(uploadRes.mediaType);
        setUploading(false);
      }

      if (!finalMediaUrl) {
        setError('Please select an image or video file to upload.');
        setSaving(false);
        return;
      }

      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const tools = toolsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const payload = {
        title,
        description,
        category,
        mediaType,
        mediaUrl: finalMediaUrl,
        tags,
        toolsUsed: tools,
        projectRole,
        aiInvolvement,
        workflowDescription,
        commercialLicensing,
        visibility,
      };

      if (itemToEdit) {
        await apiClient.updatePortfolioItem(itemToEdit._id, payload);
      } else {
        await apiClient.createPortfolioItem(payload);
      }

      setSaving(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setUploading(false);
      setSaving(false);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to save portfolio item.');
      } else {
        setError('Server network error. Please try again.');
      }
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? 'Edit Portfolio Artwork' : 'Add New Portfolio Artwork'}
      description="Upload high-res AI visuals, set tool lineage, and configure licensing."
    >
      <form onSubmit={handleUploadAndSave} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-2">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Media File Selection & Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-200">Media Upload (Image or Video)</label>
          <div className="relative border-2 border-dashed border-white/15 rounded-2xl p-4 text-center hover:border-brand-500/50 transition-colors bg-dark-900/60">
            {filePreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-dark-950 max-h-48 mx-auto">
                {mediaType === 'video' ? (
                  <video src={filePreview} controls className="w-full h-full object-contain" />
                ) : (
                  <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
                )}
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setFilePreview(null); setMediaUrl(''); }}
                  className="absolute top-2 right-2 p-1 bg-dark-950/80 rounded-lg text-slate-300 hover:text-white text-xs"
                >
                  Change
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="text-brand-400 font-semibold">Click to upload</span> image or video
                </div>
                <p className="text-[11px] text-slate-500">Supports JPEG, PNG, WebP, MP4 (Max 50MB)</p>
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Title & Category */}
        <Input label="Artwork Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cyberpunk Anime Character 8K" />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
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

        {/* AI Involvement & Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">AI Involvement Level</label>
            <select
              value={aiInvolvement}
              onChange={(e) => setAiInvolvement(e.target.value as any)}
              className="w-full bg-dark-900 border border-white/10 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="Full Generative">Full Generative</option>
              <option value="Hybrid AI-VFX">Hybrid AI-VFX</option>
              <option value="AI Assisted">AI Assisted</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Licensing Terms</label>
            <select
              value={commercialLicensing}
              onChange={(e) => setCommercialLicensing(e.target.value as any)}
              className="w-full bg-dark-900 border border-white/10 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="Commercial Buyout">Commercial Buyout</option>
              <option value="Personal Non-Commercial">Personal Non-Commercial</option>
              <option value="Exclusive Rights">Exclusive Rights</option>
            </select>
          </div>
        </div>

        <Input label="Tools & Pipelines (comma separated)" value={toolsInput} onChange={(e) => setToolsInput(e.target.value)} placeholder="Runway Gen-3, Midjourney v6, ComfyUI" />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Workflow & Prompt Notes (Optional)</label>
          <textarea
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            placeholder="Share details on prompt parameters, LoRA weights, or render pipeline..."
            className="w-full bg-dark-900 border border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl p-2.5 text-xs focus:outline-none focus:border-brand-500 min-h-[70px]"
          />
        </div>

        {/* Visibility */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Visibility</label>
          <div className="grid grid-cols-3 gap-2">
            {(['public', 'private', 'draft'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={`text-xs py-2 rounded-xl border capitalize font-medium transition-all ${
                  visibility === v
                    ? 'bg-brand-500/20 border-brand-500/60 text-brand-300'
                    : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={saving || uploading}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {itemToEdit ? 'Save Changes' : 'Publish Portfolio Artwork'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
