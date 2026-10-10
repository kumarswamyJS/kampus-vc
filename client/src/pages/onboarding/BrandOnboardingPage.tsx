import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Building, ArrowRight, Check } from 'lucide-react';
import { BrandProfile } from '../../types';

export const BrandOnboardingPage: React.FC = () => {
  const { profile, completionScore, updateProfile } = useAuth();
  const navigate = useNavigate();
  const brand = profile as BrandProfile | null;

  const [companyName, setCompanyName] = useState(brand?.companyName || '');
  const [industry, setIndustry] = useState(brand?.industry || 'Technology & Digital');
  const [website, setWebsite] = useState(brand?.website || '');
  const [description, setDescription] = useState(brand?.description || '');
  const [targetAudience, setTargetAudience] = useState(brand?.targetAudience || '');
  const [typicalCampaignBudget, setTypicalCampaignBudget] = useState(brand?.typicalCampaignBudget || '$5,000 - $25,000');

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        companyName,
        industry,
        website,
        description,
        targetAudience,
        typicalCampaignBudget,
      });
      setLoading(false);
      navigate('/brand/dashboard');
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-16 px-4 bg-radial-gradient">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="text-center space-y-3">
          <Badge variant="blue">
            <Building className="w-3.5 h-3.5 text-electric-blue" />
            Brand Onboarding
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Setup Your Brand Identity</h1>
          <p className="text-slate-400 text-sm">
            Complete brand profile to receive tailored AI creator recommendations. Current completion: <span className="text-electric-blue font-bold">{completionScore}%</span>
          </p>

          <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-electric-blue to-brand-500 h-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </div>

        <Card className="space-y-6 p-8 border border-white/10">
          <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Studios" />
          <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Consumer Tech / Media / Gaming" />
          <Input label="Company Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acmestudios.com" />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Brand Description & Creative Goals</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your brand identity, product offering, and upcoming generative campaign needs..."
              className="w-full bg-dark-900 border border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 min-h-[100px]"
            />
          </div>

          <Input label="Target Audience Persona" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Gen Z & Millennial Tech Enthusiasts" />
          <Input label="Typical Campaign Budget Range" value={typicalCampaignBudget} onChange={(e) => setTypicalCampaignBudget(e.target.value)} placeholder="$5,000 - $25,000" />

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="md"
              isLoading={loading}
              onClick={handleSave}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Brand Profile & Go to Dashboard
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
};
