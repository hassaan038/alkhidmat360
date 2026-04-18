import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LogIn } from 'lucide-react';
import BackgroundBlobs from '../../components/decorative/BackgroundBlobs';
import DotPattern from '../../components/decorative/DotPattern';
import FadeIn from '../../components/animations/FadeIn';
import heroImage from '../../assets/alkhidmat_hero_image.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Clear initial loading state when on login page
  useEffect(() => {
    if (loading) {
      useAuthStore.setState({ loading: false });
    }
    // Intentionally mount-only — we just want to clear a stale loading
    // flag once on first render of the public page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await login(formData.email, formData.password);

      // Redirect based on user type
      if (user.userType === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/user');
      }
    } catch (err) {
      // Error is handled by the store
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400">
      {/* Background decorations */}
      <BackgroundBlobs variant="default" />
      <DotPattern className="text-white" />

      <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-12 lg:px-12 gap-8 lg:gap-16 relative z-10">
        {/* Left Side - Hero Image */}
        <FadeIn direction="left" delay={0} className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="relative">
            <img
              src={heroImage}
              alt="Alkhidmat 360 - Making a Difference"
              className="w-full max-w-lg rounded-2xl shadow-large animate-float"
            />
          </div>
        </FadeIn>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 max-w-md">
          {/* Logo/Header */}
          <FadeIn direction="down" delay={150}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-large">
                <LogIn className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Welcome Back</h1>
              <p className="text-blue-100">Sign in to Alkhidmat 360</p>
            </div>
          </FadeIn>

          {/* Login Form - Enhanced Card */}
          <FadeIn direction="up" delay={300}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large border border-white/20 ring-1 ring-blue-50 p-8 lg:p-10">
              {error && (
                <Alert variant="error" className="mb-6">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" required>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1.5 transition-all duration-200"
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password" required>
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1.5 transition-all duration-200"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 text-base hover:shadow-md transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" className="border-white" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link to="/signup">
                  <Button variant="outline" className="w-full transition-all duration-200">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Test Credentials Info */}
          <FadeIn delay={450}>
            <div className="mt-6 p-4 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg shadow-medium">
              <p className="text-xs text-gray-700 font-medium mb-2">Test Credentials:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>Admin: admin@alkhidmat360.com / admin123</li>
                <li>Donor: donor@test.com / donor123</li>
                <li>Beneficiary: beneficiary@test.com / beneficiary123</li>
                <li>Volunteer: volunteer@test.com / volunteer123</li>
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
