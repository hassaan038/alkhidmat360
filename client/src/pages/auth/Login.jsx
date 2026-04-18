import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Alert from '../../components/ui/Alert';
import { Mail, Lock, LogIn, ShieldCheck, HeartHandshake, Coins, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import heroImage from '../../assets/alkhidmat_hero_image.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (loading) useAuthStore.setState({ loading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password);
      navigate(user.userType === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900">
      {/* Branded side panel — hidden on mobile */}
      <aside className="relative hidden lg:flex lg:w-[44%] xl:w-[40%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white px-12 py-10">
        <div className="absolute inset-0 opacity-40 bg-gradient-mesh pointer-events-none" aria-hidden />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden />

        <div className="relative">
          <div className="inline-flex items-center gap-3">
            <img src={logo} alt="" className="h-11 w-11 rounded-xl object-cover ring-2 ring-white/50 shadow-lg" />
            <div>
              <p className="text-lg font-bold leading-tight">Alkhidmat 360</p>
              <p className="text-xs text-primary-100/90">Social Welfare Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="relative mb-7 w-full max-w-sm">
            {/* Soft glow around the hero */}
            <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-2xl" aria-hidden />
            <div className="relative rounded-[2rem] bg-white/10 ring-1 ring-white/20 backdrop-blur-sm p-3 shadow-2xl">
              <img
                src={heroImage}
                alt="Alkhidmat Foundation — serving communities in need"
                className="w-full rounded-[1.5rem] animate-float"
              />
            </div>
          </div>

          <h2 className="text-2xl xl:text-3xl font-bold leading-tight tracking-tight">
            Give with intention.<br />Track every impact.
          </h2>
          <p className="mt-3 text-primary-100 text-sm leading-relaxed">
            A unified platform for Qurbani, Zakat, Fitrana, disaster relief, and sponsorship — managed end-to-end by Alkhidmat Pakistan.
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-2.5 w-full text-left">
            {[
              { icon: ShieldCheck, title: 'Bank-grade payment verification' },
              { icon: HeartHandshake, title: 'Direct beneficiary impact' },
              { icon: Coins, title: 'Zakat & Fitrana calculators built-in' },
            ].map((feat) => (
              <li key={feat.title} className="flex items-center gap-3 rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm px-3 py-2">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <feat.icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-medium text-white/95">{feat.title}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs text-primary-100/70">
          © {new Date().getFullYear()} Alkhidmat Pakistan · All rights reserved
        </div>
      </aside>

      {/* Form side */}
      <main className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
            <img src={logo} alt="Alkhidmat 360" className="h-10 w-10 rounded-xl object-cover shadow-md" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-50">Alkhidmat 360</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-8 ring-primary-50/50 mb-4">
              <LogIn className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>
          </div>

          {error && (
            <Alert variant="error" className="mb-5">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" required>Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                leftIcon={Mail}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>Password</Label>
                <span className="text-xs text-gray-400 dark:text-gray-500">Use a strong, unique password</span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={Lock}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 dark:text-gray-500">New to Alkhidmat 360?</span>
            </div>
          </div>

          <Link to="/signup" className="block">
            <Button variant="outline" size="lg" className="w-full">
              Create new account
            </Button>
          </Link>

          <details className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs">
            <summary className="cursor-pointer px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 select-none hover:text-gray-900">
              Test credentials
            </summary>
            <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 space-y-1 text-gray-600 dark:text-gray-400 font-mono text-[11px]">
              <p>admin@alkhidmat360.com / admin123</p>
              <p>donor@test.com / donor123</p>
              <p>beneficiary@test.com / beneficiary123</p>
              <p>volunteer@test.com / volunteer123</p>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}
