import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createVolunteerTask } from '../../services/volunteerService';
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';

// Validation schema matching backend
const volunteerTaskSchema = z.object({
  volunteerName: z.string().min(2, 'Name must be at least 2 characters'),
  volunteerPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  volunteerEmail: z.string().email('Invalid email address'),
  volunteerAddress: z.string().min(10, 'Please provide a complete address'),
  taskCategory: z.enum([
    'DISTRIBUTION',
    'FUNDRAISING',
    'AWARENESS',
    'ADMINISTRATIVE',
    'FIELD_WORK',
    'EVENT_SUPPORT',
  ]),
  availability: z.array(z.string()).min(1, 'Select at least one day'),
  skills: z.string().optional(),
  experience: z.string().optional(),
  preferredLocation: z.string().optional(),
  emergencyContact: z
    .string()
    .min(11, 'Emergency contact must be at least 11 digits')
    .max(15, 'Emergency contact must not exceed 15 digits'),
});

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const TASK_CATEGORIES = [
  { value: 'DISTRIBUTION', label: 'Distribution', description: 'Food/aid distribution to beneficiaries' },
  { value: 'FUNDRAISING', label: 'Fundraising', description: 'Organizing fundraising campaigns' },
  { value: 'AWARENESS', label: 'Awareness', description: 'Community awareness programs' },
  { value: 'ADMINISTRATIVE', label: 'Administrative', description: 'Office and documentation work' },
  { value: 'FIELD_WORK', label: 'Field Work', description: 'On-ground assistance and surveys' },
  { value: 'EVENT_SUPPORT', label: 'Event Support', description: 'Helping organize events' },
];

export default function VolunteerTaskRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(volunteerTaskSchema),
    defaultValues: {
      availability: [],
    },
  });

  const handleDayToggle = (day) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    setSelectedDays(newSelectedDays);
    setValue('availability', newSelectedDays);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert availability array to JSON string for backend
      const submitData = {
        ...data,
        availability: JSON.stringify(data.availability),
      };

      await createVolunteerTask(submitData);
      toast.success('Registration Submitted Successfully!', {
        description: 'Your volunteer registration will be reviewed shortly.',
      });
      reset();
      setSelectedDays([]);
    } catch (error) {
      toast.error('Submission Failed', {
        description: error.response?.data?.message || 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <FadeIn direction="down" delay={0}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Volunteer Task Registration</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Register to volunteer for various community service tasks
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Form Card */}
        <FadeIn direction="up" delay={150}>
          <Card className="shadow-medium hover:shadow-large transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('volunteerName')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                    {errors.volunteerName && (
                      <p className="mt-1 text-sm text-error">{errors.volunteerName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register('volunteerPhone')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="03001234567"
                      />
                      {errors.volunteerPhone && (
                        <p className="mt-1 text-sm text-error">{errors.volunteerPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        {...register('volunteerEmail')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="your.email@example.com"
                      />
                      {errors.volunteerEmail && (
                        <p className="mt-1 text-sm text-error">{errors.volunteerEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-error">*</span>
                    </label>
                    <textarea
                      {...register('volunteerAddress')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter your complete address"
                    />
                    {errors.volunteerAddress && (
                      <p className="mt-1 text-sm text-error">{errors.volunteerAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('emergencyContact')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="03001234567"
                    />
                    {errors.emergencyContact && (
                      <p className="mt-1 text-sm text-error">{errors.emergencyContact.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Category */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Task Category & Availability
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Task Category <span className="text-error">*</span>
                    </label>
                    <select
                      {...register('taskCategory')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                    >
                      <option value="">Select a category</option>
                      {TASK_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label} - {category.description}
                        </option>
                      ))}
                    </select>
                    {errors.taskCategory && (
                      <p className="mt-1 text-sm text-error">{errors.taskCategory.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability (Days) <span className="text-error">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <label
                          key={day.value}
                          className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                            selectedDays.includes(day.value)
                              ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-md'
                              : 'bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day.value)}
                            onChange={() => handleDayToggle(day.value)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium">{day.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.availability && (
                      <p className="mt-1 text-sm text-error">{errors.availability.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Location (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('preferredLocation')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., Karachi, Lahore, Islamabad"
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Skills & Experience
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills (Optional)
                    </label>
                    <textarea
                      {...register('skills')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="List any relevant skills (e.g., first aid, public speaking, event management)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Volunteer Experience (Optional)
                    </label>
                    <textarea
                      {...register('experience')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Describe any previous volunteer work or community service experience"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 hover:shadow-md transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedDays([]);
                  }}
                  disabled={isSubmitting}
                  className="hover:scale-105 transition-all duration-200"
                >
                  Reset
                </Button>
              </div>
            </form>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Info Card */}
        <FadeIn delay={300}>
          <Card className="mt-6 bg-primary-50 border-primary-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">ℹ️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">Volunteer Information</h4>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• All registrations are reviewed within 2-3 business days</li>
                    <li>• You will be contacted via phone if your registration is approved</li>
                    <li>• Training sessions will be provided for specific task categories</li>
                    <li>• Volunteer opportunities are available year-round</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
