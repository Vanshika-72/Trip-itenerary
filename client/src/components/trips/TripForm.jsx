import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import { Calendar, Wallet, MapPin, Upload, Image as ImageIcon } from 'lucide-react';

const COMMON_CURRENCIES = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'JPY', label: 'JPY (¥)' },
  { code: 'INR', label: 'INR (₹)' },
  { code: 'CHF', label: 'CHF (Fr)' },
  { code: 'CAD', label: 'CAD ($)' },
  { code: 'AUD', label: 'AUD ($)' },
];

export const TripForm = ({
  initialValues = {},
  onSubmit,
  loading = false,
  submitLabel = 'Create Trip',
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialValues.coverUrl || '');

  // Format initial dates to YYYY-MM-DD
  const formatIsoDate = (d) => {
    if (!d) return '';
    const dateObj = new Date(d);
    return dateObj.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialValues.title || '',
      destination: initialValues.destination || '',
      startDate: formatIsoDate(initialValues.startDate),
      endDate: formatIsoDate(initialValues.endDate),
      currency: initialValues.currency || 'USD',
      budget: initialValues.budget !== undefined ? initialValues.budget : '',
      coverUrl: initialValues.coverUrl || '',
    },
  });

  const startDateVal = watch('startDate');
  const currencyVal = watch('currency') || 'USD';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = (data) => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('destination', data.destination);
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('currency', data.currency);
      if (data.budget !== '') formData.append('budget', data.budget);
      formData.append('coverImage', selectedFile);
      onSubmit(formData);
    } else {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Trip Title"
          placeholder="e.g. Kyoto Autumn Tour"
          required
          {...register('title', {
            required: 'Trip title is required',
            maxLength: { value: 120, message: 'Max 120 characters' },
          })}
          error={errors.title?.message}
        />

        <Input
          label="Destination"
          placeholder="City, Country"
          icon={MapPin}
          required
          {...register('destination', {
            required: 'Destination is required',
          })}
          error={errors.destination?.message}
        />
      </div>

      {/* Travel Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          icon={Calendar}
          required
          {...register('startDate', {
            required: 'Start date is required',
          })}
          error={errors.startDate?.message}
        />

        <Input
          label="End Date"
          type="date"
          icon={Calendar}
          required
          {...register('endDate', {
            required: 'End date is required',
            validate: (value) =>
              !startDateVal || value >= startDateVal || 'End date cannot be earlier than start date',
          })}
          error={errors.endDate?.message}
        />
      </div>

      {/* Currency & Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
            Currency
          </label>
          <select
            {...register('currency')}
            className="block w-full rounded-lg border border-sand-300 bg-white py-2.5 px-3 text-sm text-charcoal-900 focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
          >
            {COMMON_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label={`Estimated Budget (${currencyVal})`}
          type="number"
          placeholder="0"
          step="any"
          icon={Wallet}
          {...register('budget', {
            min: { value: 0, message: 'Budget must be 0 or greater' },
          })}
          error={errors.budget?.message}
        />
      </div>

      {/* Cover Image Upload / URL */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
          Trip Cover Image
        </label>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-sand-300 rounded-xl bg-sand-50/50">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Cover Preview"
              className="w-28 h-20 object-cover rounded-lg border border-sand-300 shrink-0"
            />
          ) : (
            <div className="w-28 h-20 rounded-lg bg-sand-200 text-charcoal-400 flex items-center justify-center shrink-0">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="text-xs text-charcoal-600">
              Upload a custom cover image (PNG, JPG, WebP up to 5MB), or enter an image link below.
            </div>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-sand-300 bg-white text-xs font-semibold text-charcoal-800 hover:bg-sand-100 cursor-pointer shadow-sm transition">
              <Upload className="w-3.5 h-3.5" /> Choose Image File
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {!selectedFile && (
          <Input
            placeholder="Or paste an image URL (optional)"
            {...register('coverUrl')}
            error={errors.coverUrl?.message}
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-sand-200 flex justify-end">
        <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
