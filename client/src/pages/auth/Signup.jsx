import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserPlus, Heart, HandHeart, Users } from 'lucide-react';
import BackgroundBlobs from '../../components/decorative/BackgroundBlobs';
import DotPattern from '../../components/decorative/DotPattern';
import FadeIn from '../../components/animations/FadeIn';
import heroImage from '../../assets/alkhidmat_hero_image.png';

const userTypes = [
  {
    value: 'DONOR',
    label: 'Donor',
    icon: Heart,
    description: 'Make donations and support causes',
    color: 'border-primary-500 bg-primary-50',
  },
  {
    value: 'BENEFICIARY',
    label: 'Beneficiary',
    icon: HandHeart,
    description: 'Apply for support and assistance',
    color: 'border-success bg-success-light',
  },
  {
    value: 'VOLUNTEER',
    label: 'Volunteer',
    icon: Users,
    description: 'Volunteer for tasks and events',
    color: 'border-warning bg-warning-light',
  },
];

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

  // Clear initial loading state when on signup page
  useEffect(() => {
    if (loading) {
      useAuthStore.setState({ loading: false });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    clearError();
    setValidationError('');
  };

  const handleUserTypeSelect = (type) => {
    setFormData({
      ...formData,
      userType: type,
    });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate user type selected
    if (!formData.userType) {
      setValidationError('Please select your user type');
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = formData;

      const user = await signup(signupData);

      // Redirect based on user type
      if (user.userType === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/user');
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
      {/* Background decorations */}
      <BackgroundBlobs variant="vibrant" />
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

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 max-w-2xl">
          {/* Logo/Header */}
          <FadeIn direction="down" delay={150}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-large">
                <UserPlus className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Create Your Account</h1>
              <p className="text-blue-100">Join Alkhidmat 360 to make a difference</p>
            </div>
          </FadeIn>

          {/* Signup Form */}
          <FadeIn direction="up" delay={300}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-large border border-white/20 p-8 lg:p-10">
          {(error || validationError) && (
            <Alert variant="error" className="mb-6">
              {error || validationError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <Label required className="mb-3 block">
                I want to:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.userType === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleUserTypeSelect(type.value)}
                      className={`
                        relative p-5 rounded-xl border-2 transition-all duration-300 text-left
                        hover:scale-105 hover:shadow-lg
                        ${
                          isSelected
                            ? `${type.color} border-2 shadow-glow-blue`
                            : 'border-gray-200 bg-white hover:border-blue-200'
                        }
                      `}
                      disabled={loading}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <Icon
                          className={`w-8 h-8 ${
                            isSelected ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{type.label}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {type.description}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" required>
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="mt-1.5 focus:scale-[1.01] transition-all duration-200"
                  disabled={loading}
                />
              </div>

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
                  className="mt-1.5 focus:scale-[1.01] transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" required>
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+92-300-1234567"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="mt-1.5 focus:scale-[1.01] transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="cnic">CNIC (Optional)</Label>
                <Input
                  id="cnic"
                  name="cnic"
                  type="text"
                  placeholder="12345-1234567-1"
                  value={formData.cnic}
                  onChange={handleChange}
                  className="mt-1.5 focus:scale-[1.01] transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password" required>
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="mt-1.5 focus:scale-[1.01] transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" required>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="mt-1.5 focus:scale-[1.01] transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base hover:scale-105 hover:shadow-md transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" className="border-white" />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link to="/login">
              <Button variant="outline" className="w-full hover:scale-105 transition-all duration-200">
                Sign In Instead
              </Button>
            </Link>
          </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
