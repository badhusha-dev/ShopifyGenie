
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import AnimatedCard from '../components/ui/AnimatedCard';
import { useAppSelector } from '../store/hooks';
import { designTokens } from '../design/tokens';

// Form Schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set new password",
  path: ["currentPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

const EditProfile = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: userProfile } = useQuery<User>({
    queryKey: ['/api/users/profile'],
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { avatarFile?: File }) => {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      
      if (data.currentPassword) {
        formData.append('currentPassword', data.currentPassword);
      }
      if (data.newPassword) {
        formData.append('newPassword', data.newPassword);
      }
      if (data.avatarFile) {
        formData.append('avatar', data.avatarFile);
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      // Show success message
      alert('Profile updated successfully!');
      reset();
      setAvatarFile(null);
      setAvatarPreview('');
    },
    onError: (error: Error) => {
      alert('Error updating profile: ' + error.message);
    },
  });

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
    },
  });

  // Update form when user data loads
  React.useEffect(() => {
    if (userProfile) {
      reset({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
      });
    }
  }, [userProfile, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate({ ...data, avatarFile: avatarFile || undefined });
  };

  if (!userProfile) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1 text-dark fw-bold" style={{ color: designTokens.colors.shopify.green }}>
            <FaUser className="me-2" />
            Edit Profile
          </h2>
          <p className="text-muted mb-0">Update your personal information and account settings</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <AnimatedCard className="border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Avatar Section */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <img
                      src={avatarPreview || userProfile.avatarUrl || '/default-avatar.png'}
                      alt="Profile"
                      className="rounded-circle border"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <label 
                      className="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle p-2"
                      style={{ cursor: 'pointer' }}
                    >
                      <FaCamera />
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <p className="small text-muted mt-2">Click the camera icon to upload a new profile picture</p>
                </div>

                {/* Basic Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">First Name *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaUser />
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        placeholder="Enter first name"
                        {...register('firstName')}
                      />
                    </div>
                    {errors.firstName && (
                      <div className="invalid-feedback d-block">{errors.firstName.message}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Last Name *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaUser />
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        placeholder="Enter last name"
                        {...register('lastName')}
                      />
                    </div>
                    {errors.lastName && (
                      <div className="invalid-feedback d-block">{errors.lastName.message}</div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Email Address *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter email address"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <div className="invalid-feedback d-block">{errors.email.message}</div>
                  )}
                </div>

                {/* Password Section */}
                <div className="border-top pt-4">
                  <h5 className="mb-3 text-primary">Change Password</h5>
                  <p className="text-muted small mb-3">Leave blank if you don't want to change your password</p>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Current Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                          placeholder="Enter current password"
                          {...register('currentPassword')}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <div className="invalid-feedback d-block">{errors.currentPassword.message}</div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">New Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                          placeholder="Enter new password"
                          {...register('newPassword')}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <div className="invalid-feedback d-block">{errors.newPassword.message}</div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Confirm New Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          placeholder="Confirm new password"
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback d-block">{errors.confirmPassword.message}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="border-top pt-4">
                  <h5 className="mb-3 text-primary">Account Information</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Role:</strong> <span className="badge bg-primary">{userProfile.role}</span></p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Member Since:</strong> {new Date(userProfile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg px-4"
                    disabled={updateProfileMutation.isPending}
                  >
                    <FaSave className="me-2" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
