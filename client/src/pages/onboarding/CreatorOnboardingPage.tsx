import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Sparkles, ArrowRight, Check, Wand2 } from 'lucide-react';
import { CreatorProfile } from '../../types';

export const CreatorOnboardingPage: React.FC = () => {
  const { profile, completionScore, updateProfile } = useAuth();
  const navigate = useNavigate();
  const creator = profile as CreatorProfile | null;

  const [name, setName] = useState(creator?.name || '');
  const [handle, setHandle] = useState(creator?.handle || '');
  const [bio, setBio] = useState(creator?.bio || '');
  const [specialtyCategory, setSpecialtyCategory] = useState(creator?.specialtyCategory || 'AI Filmmaking');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Master'>(creator?.experienceLevel || 'Intermediate');
  const [aiToolsInput, setAiToolsInput] = useState(creator?.aiTools ? creator.aiTools.join(', ') : 'Runway Gen-3, Midjourney v6, ComfyUI');
  const [portfolioIntro, setPortfolioIntro] = useState(creator?.portfolioIntro || '');
  const [hourlyRate, setHourlyRate] = useState(creator?.hourlyRate || '$100/hr');

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const categories = ['AI Filmmaking', '3D Animation', 'Generative Visuals', 'VFX & Motion', 'Brand Identity', 'Cyberpunk Art'];
  const expLevels: Array<'Beginner' | 'Intermediate' | 'Advanced' | 'Master'> = ['Beginner', 'Intermediate', 'Advanced', 'Master'];

  const handleSave = async () => {
    setLoading(true);
    try {
      const toolsArray = aiToolsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await updateProfile({
        name,
        handle,
        bio,
        specialtyCategory,
        experienceLevel,
        aiTools: toolsArray,
        portfolioIntro,
        hourlyRate,
      });
      setLoading(false);
      navigate('/creator/dashboard');
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-16 px-4 bg-radial-gradient">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <Badge variant="neon">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Creator Profile Onboarding
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Setup Your Creative DNA Passport</h1>
          <p className="text-slate-400 text-sm">
            Complete your profile to get matched with high-paying brand campaigns. Current completion: <span className="text-brand-400 font-bold">{completionScore}%</span>
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-brand-500 to-electric-blue h-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="space-y-6 p-8 border border-white/10">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs">1</span>
                Identity & Bio
              </h3>

              <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aria Vance" />
              <Input label="Public Slug / Handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="aria_synapse" />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Biography</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your creative style, visual aesthetic, and directorial vision..."
                  className="w-full bg-dark-900 border border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 min-h-[100px]"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Next: Specialization
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs">2</span>
                Specialization & AI Tools
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">Primary Specialization Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSpecialtyCategory(cat)}
                      className={`text-xs p-3 rounded-xl border text-left font-medium transition-all ${
                        specialtyCategory === cat
                          ? 'bg-brand-500/20 border-brand-500/60 text-brand-300'
                          : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">Experience Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {expLevels.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`text-xs py-2 px-1 rounded-xl border text-center font-medium transition-all ${
                        experienceLevel === lvl
                          ? 'bg-electric-blue/20 border-electric-blue/60 text-electric-blue'
                          : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="AI Tools & Models (comma separated)"
                value={aiToolsInput}
                onChange={(e) => setAiToolsInput(e.target.value)}
                placeholder="Runway Gen-3, Midjourney v6, ComfyUI, Sora, ElevenLabs"
              />

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Next: Rates & Portfolio
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs">3</span>
                Portfolio & Rates
              </h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Portfolio Introduction & Vision</label>
                <textarea
                  value={portfolioIntro}
                  onChange={(e) => setPortfolioIntro(e.target.value)}
                  placeholder="Share a short summary of your featured projects, client work, or prompt engineering process..."
                  className="w-full bg-dark-900 border border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 min-h-[100px]"
                />
              </div>

              <Input label="Target Rate / Pricing" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="$120/hr or $2,500/project" />

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  onClick={handleSave}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Save Profile & Launch Dashboard
                </Button>
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};
