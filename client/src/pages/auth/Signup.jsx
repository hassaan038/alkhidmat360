import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Alert from '../../components/ui/Alert';
import {
  UserPlus, Heart, HandHeart, Users, Mail, Lock, Phone, CreditCard, User,
  Check, Eye, EyeOff, ShieldCheck, HeartHandshake, Coins,
} from 'lucide-react';
import logo from '../../assets/logo.jpg';
import { cn } from '../../lib/utils';

const userTypes = [
  {
    value: 'DONOR',
    label: 'Donor',
    icon: Heart,
    description: 'Make donations, pay Zakat, sponsor causes',
    tone: 'primary',
  },
  {
    value: 'BENEFICIARY',
    label: 'Beneficiary',
    icon: HandHeart,
    description: 'Apply for loans, rations, and assistance',
    tone: 'success',
  },
  {
    value: 'VOLUNTEER',
    label: 'Volunteer',
    icon: Users,
    description: 'Volunteer for tasks and events',
    tone: 'warning',
  },
];

const toneClasses = {
  primary: { active: 'border-primary-500 bg-primary-50 ring-1 ring-primary-200', chip: 'bg-primary-100 text-primary-700' },
  success: { active: 'border-success bg-success-light ring-1 ring-success/30', chip: 'bg-success-light text-success-dark' },
  warning: { active: 'border-warning bg-warning-light ring-1 ring-warning/30', chip: 'bg-warning-light text-warning-dark' },
};

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    cnic: '',
    userType: '',
  });
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (loading) useAuthStore.setState({ loading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
    setValidationError('');
  };

  const handleUserTypeSelect = (type) => {
    setFormData({ ...formData, userType: type });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (!formData.userType) {
      setValidationError('Please select your account type');
      return;
    }
    try {
      const { confirmPassword: _cp, ...signupData } = formData;
      const user = await signup(signupData);
      navigate(user.userType === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user');
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <aside className="relative hidden lg:flex lg:w-[38%] xl:w-[34%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white px-10 py-10">
        <div className="absolute inset-0 opacity-40 bg-gradient-mesh pointer-events-none" aria-hidden />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden />

        <div className="relative inline-flex items-center gap-3">
          <img src={logo} alt="" className="h-11 w-11 rounded-xl object-cover ring-2 ring-white/50 shadow-lg" />
          <div>
            <p className="text-lg font-bold leading-tight">Alkhidmat 360</p>
            <p className="text-xs text-primary-100/90">Social Welfare Platform</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            Join a community<br />of meaningful giving.
          </h2>
          <p className="mt-4 text-primary-100 leading-relaxed">
            Create an account to donate, apply for support, or volunteer. Every step is tracked, verified, and backed by Alkhidmat Pakistan's infrastructure.
          </p>

          <ul className="mt-8 space-y-3.5">
            {[
              { icon: ShieldCheck, title: 'Verified & transparent' },
              { icon: HeartHandshake, title: 'Direct beneficiary impact' },
              { icon: Coins, title: 'Zakat & Fitrana built-in' },
            ].map((feat) => (
              <li key={feat.title} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                  <feat.icon className="h-4 w-4" />
                </span>
                <span className="font-medium text-white/90">{feat.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs text-primary-100/70">
          © {new Date().getFullYear()} Alkhidmat Pakistan
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-2xl animate-fade-in-up">
          <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
            <img src={logo} alt="Alkhidmat 360" className="h-10 w-10 rounded-xl object-cover shadow-md" />
            <span className="text-xl font-bold text-gray-900">Alkhidmat 360</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-8 ring-primary-50/50 mb-4">
              <UserPlus className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-gray-500">Takes less than a minute — pick a role and fill in your details.</p>
          </div>

          {(error || validationError) && (
            <Alert variant="error" className="mb-5">
              {error || validationError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Role picker */}
            <div>
              <Label required className="mb-3 block">I want to</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  const selected = formData.userType === type.value;
                  const t = toneClasses[type.tone];
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleUserTypeSelect(type.value)}
                      disabled={loading}
                      className={cn(
                        'relative text-left p-4 rounded-xl border transition-colors duration-200 cursor-pointer',
                        selected ? t.active : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0', selected ? t.chip : 'bg-gray-100 text-gray-500')}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{type.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{type.description}</p>
                        </div>
                      </div>
                      {selected && (
                        <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" required>Full name</Label>
                <Input id="fullName" name="fullName" type="text" leftIcon={User} placeholder="Your full name" value={formData.fullName} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" required>Email address</Label>
                <Input id="email" name="email" type="email" leftIcon={Mail} placeholder="you@example.com" value={formData.email} onChange={handleChange} required autoComplete="email" disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" required>Phone number</Label>
                <Input id="phoneNumber" name="phoneNumber" type="tel" leftIcon={Phone} placeholder="+92-300-1234567" value={formData.phoneNumber} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cnic">CNIC <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input id="cnic" name="cnic" type="text" leftIcon={CreditCard} placeholder="12345-1234567-1" value={formData.cnic} onChange={handleChange} disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" required>Password</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} leftIcon={Lock} placeholder="Minimum 6 characters" value={formData.password} onChange={handleChange} required minLength={6} autoComplete="new-password" disabled={loading} className="pr-10" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" required>Confirm password</Label>
                <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} leftIcon={Lock} placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required minLength={6} autoComplete="new-password" disabled={loading} />
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
