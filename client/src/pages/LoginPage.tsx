import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, Lock, LogIn, AlertCircle, Info } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [role, setRole] = useState<'creator' | 'brand'>('creator');
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await login(data);
      if (returnTo) {
        navigate(returnTo);
      } else if (res.redirectTo) {
        navigate(res.redirectTo);
      } else {
        navigate(res.user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard');
      }
    } catch (err: unknown) {
      setLoading(false);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setServerError(axiosErr.response?.data?.error?.message || 'Invalid email or password.');
      } else {
        setServerError('Unable to connect to Kampus.VC API. Please check your connection.');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-radial-gradient">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-electric-blue flex items-center justify-center shadow-glow-cyan">
              <Sparkles className="w-5 h-5 text-dark-950" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to access your Kampus.VC account</p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 p-1 bg-dark-900 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('creator')}
            className={`py-2 rounded-lg transition-all ${
              role === 'creator'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Creator
          </button>
          <button
            type="button"
            onClick={() => setRole('brand')}
            className={`py-2 rounded-lg transition-all ${
              role === 'brand'
                ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Brand / Agency
          </button>
        </div>

        {/* Error Alert */}
        {serverError && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            isLoading={loading}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In as {role === 'creator' ? 'Creator' : 'Brand'}
          </Button>
        </form>

        {/* Google OAuth Option */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-dark-950 text-[11px] uppercase tracking-wider text-slate-500">
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center"
            onClick={() => setShowOAuthModal(true)}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.761,0,9.664-4.053,9.664-9.842c0-0.658-0.065-1.298-0.179-1.919H12.545z"
              />
            </svg>
            Sign In with Google
          </Button>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          Don't have an account?{' '}
          <Link to={`/signup?type=${role}`} className="text-brand-400 font-semibold hover:underline">
            Create an account
          </Link>
        </div>

      </div>

      {/* Google OAuth Modal */}
      <Dialog
        isOpen={showOAuthModal}
        onClose={() => setShowOAuthModal(false)}
        title="Google OAuth Integration Boundary"
      >
        <div className="space-y-4 text-left text-xs text-slate-300">
          <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-start gap-2 text-brand-300">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <span>
              Google OAuth integration boundary is prepared. Configure <code className="text-white">GOOGLE_CLIENT_ID</code> and <code className="text-white">GOOGLE_CLIENT_SECRET</code> in <code className="text-white">server/.env</code> to activate.
            </span>
          </div>
          <p>Email/Password authentication is fully operational against MongoDB.</p>
          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowOAuthModal(false)}>
              Got It
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
