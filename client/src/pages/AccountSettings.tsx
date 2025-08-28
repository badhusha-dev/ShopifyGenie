
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaCog, FaPalette, FaPercent, FaSave, FaGlobe, FaDollarSign, FaClock } from 'react-icons/fa';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';

// Form Schemas
const generalSettingsSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  timezone: z.string().min(1, "Timezone is required"),
  currency: z.string().min(1, "Currency is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  language: z.string().min(1, "Language is required"),
});

const brandingSettingsSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  fontFamily: z.string().min(1, "Font family is required"),
});

const taxSettingsSchema = z.object({
  defaultTaxRate: z.coerce.number().min(0).max(1, "Tax rate must be between 0 and 1"),
  taxInclusive: z.boolean(),
  autoCalculateTax: z.boolean(),
});

type GeneralSettingsData = z.infer<typeof generalSettingsSchema>;
type BrandingSettingsData = z.infer<typeof brandingSettingsSchema>;
type TaxSettingsData = z.infer<typeof taxSettingsSchema>;

interface Settings {
  organizationName: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  language: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  defaultTaxRate: number;
  taxInclusive: boolean;
  autoCalculateTax: boolean;
}

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'taxes'>('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  // Update settings mutations
  const updateGeneralSettingsMutation = useMutation({
    mutationFn: async (data: GeneralSettingsData) => {
      const response = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update general settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      alert('General settings updated successfully!');
    },
  });

  const updateBrandingSettingsMutation = useMutation({
    mutationFn: async (data: BrandingSettingsData & { logoFile?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'logoFile' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (data.logoFile) {
        formData.append('logo', data.logoFile);
      }

      const response = await fetch('/api/settings/branding', {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update branding settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      alert('Branding settings updated successfully!');
      setLogoFile(null);
      setLogoPreview('');
    },
  });

  const updateTaxSettingsMutation = useMutation({
    mutationFn: async (data: TaxSettingsData) => {
      const response = await fetch('/api/settings/taxes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update tax settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      alert('Tax settings updated successfully!');
    },
  });

  // Form handlers
  const generalForm = useForm<GeneralSettingsData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings ? {
      organizationName: settings.organizationName,
      timezone: settings.timezone,
      currency: settings.currency,
      dateFormat: settings.dateFormat,
      language: settings.language,
    } : undefined,
  });

  const brandingForm = useForm<BrandingSettingsData>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: settings ? {
      logoUrl: settings.logoUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      fontFamily: settings.fontFamily,
    } : undefined,
  });

  const taxForm = useForm<TaxSettingsData>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: settings ? {
      defaultTaxRate: settings.defaultTaxRate,
      taxInclusive: settings.taxInclusive,
      autoCalculateTax: settings.autoCalculateTax,
    } : undefined,
  });

  // Update forms when settings load
  React.useEffect(() => {
    if (settings) {
      generalForm.reset({
        organizationName: settings.organizationName,
        timezone: settings.timezone,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        language: settings.language,
      });
      brandingForm.reset({
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        fontFamily: settings.fontFamily,
      });
      taxForm.reset({
        defaultTaxRate: settings.defaultTaxRate,
        taxInclusive: settings.taxInclusive,
        autoCalculateTax: settings.autoCalculateTax,
      });
    }
  }, [settings, generalForm, brandingForm, taxForm]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onGeneralSubmit = (data: GeneralSettingsData) => {
    updateGeneralSettingsMutation.mutate(data);
  };

  const onBrandingSubmit = (data: BrandingSettingsData) => {
    updateBrandingSettingsMutation.mutate({ ...data, logoFile: logoFile || undefined });
  };

  const onTaxSubmit = (data: TaxSettingsData) => {
    updateTaxSettingsMutation.mutate(data);
  };

  if (isLoading) {
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
            <FaCog className="me-2" />
            Account Settings
          </h2>
          <p className="text-muted mb-0">Configure your organization settings and preferences</p>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
                type="button"
              >
                <FaGlobe className="me-2" />
                General
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'branding' ? 'active' : ''}`}
                onClick={() => setActiveTab('branding')}
                type="button"
              >
                <FaPalette className="me-2" />
                Branding
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'taxes' ? 'active' : ''}`}
                onClick={() => setActiveTab('taxes')}
                type="button"
              >
                <FaPercent className="me-2" />
                Taxes
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <AnimatedCard className="border-0 shadow-sm">
                <div className="card-body p-4">
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Organization Name *</label>
                        <input
                          type="text"
                          className={`form-control ${generalForm.formState.errors.organizationName ? 'is-invalid' : ''}`}
                          placeholder="Enter organization name"
                          {...generalForm.register('organizationName')}
                        />
                        {generalForm.formState.errors.organizationName && (
                          <div className="invalid-feedback">{generalForm.formState.errors.organizationName.message}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          <FaClock className="me-2" />
                          Timezone *
                        </label>
                        <select
                          className={`form-select ${generalForm.formState.errors.timezone ? 'is-invalid' : ''}`}
                          {...generalForm.register('timezone')}
                        >
                          <option value="">Select timezone</option>
                          <option value="UTC">UTC (UTC+0)</option>
                          <option value="America/New_York">Eastern Time (UTC-5)</option>
                          <option value="America/Chicago">Central Time (UTC-6)</option>
                          <option value="America/Denver">Mountain Time (UTC-7)</option>
                          <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                          <option value="Europe/London">London (UTC+0)</option>
                          <option value="Europe/Paris">Paris (UTC+1)</option>
                          <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                          <option value="Asia/Shanghai">Shanghai (UTC+8)</option>
                        </select>
                        {generalForm.formState.errors.timezone && (
                          <div className="invalid-feedback">{generalForm.formState.errors.timezone.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          <FaDollarSign className="me-2" />
                          Currency *
                        </label>
                        <select
                          className={`form-select ${generalForm.formState.errors.currency ? 'is-invalid' : ''}`}
                          {...generalForm.register('currency')}
                        >
                          <option value="">Select currency</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                          <option value="CNY">CNY - Chinese Yuan</option>
                        </select>
                        {generalForm.formState.errors.currency && (
                          <div className="invalid-feedback">{generalForm.formState.errors.currency.message}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Date Format *</label>
                        <select
                          className={`form-select ${generalForm.formState.errors.dateFormat ? 'is-invalid' : ''}`}
                          {...generalForm.register('dateFormat')}
                        >
                          <option value="">Select date format</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (International)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                        </select>
                        {generalForm.formState.errors.dateFormat && (
                          <div className="invalid-feedback">{generalForm.formState.errors.dateFormat.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Language *</label>
                        <select
                          className={`form-select ${generalForm.formState.errors.language ? 'is-invalid' : ''}`}
                          {...generalForm.register('language')}
                        >
                          <option value="">Select language</option>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                          <option value="pt">Portuguese</option>
                          <option value="zh">Chinese</option>
                          <option value="ja">Japanese</option>
                        </select>
                        {generalForm.formState.errors.language && (
                          <div className="invalid-feedback">{generalForm.formState.errors.language.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={updateGeneralSettingsMutation.isPending}
                      >
                        <FaSave className="me-2" />
                        {updateGeneralSettingsMutation.isPending ? 'Saving...' : 'Save General Settings'}
                      </button>
                    </div>
                  </form>
                </div>
              </AnimatedCard>
            )}

            {/* Branding Settings Tab */}
            {activeTab === 'branding' && (
              <AnimatedCard className="border-0 shadow-sm">
                <div className="card-body p-4">
                  <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)}>
                    {/* Logo Upload */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Logo</label>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={logoPreview || settings?.logoUrl || '/default-logo.png'}
                          alt="Logo"
                          className="border rounded"
                          style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                        />
                        <div>
                          <input
                            type="file"
                            className="form-control mb-2"
                            accept="image/*"
                            onChange={handleLogoChange}
                          />
                          <small className="text-muted">Upload a PNG, JPG, or SVG. Max size: 2MB</small>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Primary Color *</label>
                        <div className="input-group">
                          <input
                            type="color"
                            className="form-control form-control-color"
                            style={{ width: '60px' }}
                            {...brandingForm.register('primaryColor')}
                          />
                          <input
                            type="text"
                            className={`form-control ${brandingForm.formState.errors.primaryColor ? 'is-invalid' : ''}`}
                            placeholder="#00B140"
                            {...brandingForm.register('primaryColor')}
                          />
                        </div>
                        {brandingForm.formState.errors.primaryColor && (
                          <div className="invalid-feedback">{brandingForm.formState.errors.primaryColor.message}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Secondary Color *</label>
                        <div className="input-group">
                          <input
                            type="color"
                            className="form-control form-control-color"
                            style={{ width: '60px' }}
                            {...brandingForm.register('secondaryColor')}
                          />
                          <input
                            type="text"
                            className={`form-control ${brandingForm.formState.errors.secondaryColor ? 'is-invalid' : ''}`}
                            placeholder="#0969DA"
                            {...brandingForm.register('secondaryColor')}
                          />
                        </div>
                        {brandingForm.formState.errors.secondaryColor && (
                          <div className="invalid-feedback">{brandingForm.formState.errors.secondaryColor.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Font Family *</label>
                        <select
                          className={`form-select ${brandingForm.formState.errors.fontFamily ? 'is-invalid' : ''}`}
                          {...brandingForm.register('fontFamily')}
                        >
                          <option value="">Select font</option>
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Poppins">Poppins</option>
                        </select>
                        {brandingForm.formState.errors.fontFamily && (
                          <div className="invalid-feedback">{brandingForm.formState.errors.fontFamily.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={updateBrandingSettingsMutation.isPending}
                      >
                        <FaSave className="me-2" />
                        {updateBrandingSettingsMutation.isPending ? 'Saving...' : 'Save Branding Settings'}
                      </button>
                    </div>
                  </form>
                </div>
              </AnimatedCard>
            )}

            {/* Tax Settings Tab */}
            {activeTab === 'taxes' && (
              <AnimatedCard className="border-0 shadow-sm">
                <div className="card-body p-4">
                  <form onSubmit={taxForm.handleSubmit(onTaxSubmit)}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Default Tax Rate *</label>
                        <div className="input-group">
                          <input
                            type="number"
                            step="0.0001"
                            min="0"
                            max="1"
                            className={`form-control ${taxForm.formState.errors.defaultTaxRate ? 'is-invalid' : ''}`}
                            placeholder="0.0825"
                            {...taxForm.register('defaultTaxRate')}
                          />
                          <span className="input-group-text">%</span>
                        </div>
                        <small className="text-muted">Enter as decimal (0.0825 = 8.25%)</small>
                        {taxForm.formState.errors.defaultTaxRate && (
                          <div className="invalid-feedback">{taxForm.formState.errors.defaultTaxRate.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...taxForm.register('taxInclusive')}
                          />
                          <label className="form-check-label fw-semibold">
                            Tax Inclusive Pricing
                          </label>
                          <div className="form-text">Prices include tax by default</div>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...taxForm.register('autoCalculateTax')}
                          />
                          <label className="form-check-label fw-semibold">
                            Auto Calculate Tax
                          </label>
                          <div className="form-text">Automatically calculate tax on transactions</div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={updateTaxSettingsMutation.isPending}
                      >
                        <FaSave className="me-2" />
                        {updateTaxSettingsMutation.isPending ? 'Saving...' : 'Save Tax Settings'}
                      </button>
                    </div>
                  </form>
                </div>
              </AnimatedCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
