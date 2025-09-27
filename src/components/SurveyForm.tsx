import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useResponses } from '../hooks/useFirestore';
import { Survey, FormField } from '../types';
import { Star, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SurveyForm: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const { submitResponse } = useResponses();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) return;

      try {
        const surveyDoc = await getDoc(doc(db, 'surveys', surveyId));
        if (surveyDoc.exists()) {
          const surveyData = {
            id: surveyDoc.id,
            ...surveyDoc.data(),
            createdAt: surveyDoc.data().createdAt?.toDate(),
            updatedAt: surveyDoc.data().updatedAt?.toDate(),
          } as Survey;

          if (!surveyData.isActive) {
            toast.error('This survey is no longer active');
            return;
          }

          setSurvey(surveyData);
        } else {
          toast.error('Survey not found');
        }
      } catch (error) {
        toast.error('Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const onSubmit = async (data: any) => {
    if (!survey) return;

    try {
      await submitResponse({
        surveyId: survey.id,
        surveyTitle: survey.title,
        surveyType: survey.type,
        responses: data,
        submittedAt: new Date(),
        respondentEmail: data.email,
      });

      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Not Found</h1>
          <p className="text-gray-600">The survey you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate your time and input.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
            <p className="text-blue-100">{survey.description}</p>
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                survey.type === 'client' 
                  ? 'bg-blue-500 bg-opacity-20 text-blue-100' 
                  : 'bg-green-500 bg-opacity-20 text-green-100'
              }`}>
                {survey.type === 'client' ? 'Client Feedback' : 'Event Feedback'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Dynamic Fields */}
            {survey.fields.map((field) => (
              <FormFieldRenderer
                key={field.id}
                field={field}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            ))}

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Feedback
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by <span className="font-semibold text-blue-600">Insighture</span>
        </div>
      </div>
    </div>
  );
};

interface FormFieldRendererProps {
  field: FormField;
  register: any;
  setValue: any;
  watch: any;
  errors: any;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ 
  field, 
  register, 
  setValue, 
  watch, 
  errors 
}) => {
  const [ratingValue, setRatingValue] = useState<number>(0);
  
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            {...register(field.id, { required: field.required ? `${field.label} is required` : false })}
            type="text"
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            {...register(field.id, { required: field.required ? `${field.label} is required` : false })}
            rows={4}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'select':
        return (
          <select
            {...register(field.id, { required: field.required ? `${field.label} is required` : false })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option...</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  {...register(field.id, { required: field.required ? `${field.label} is required` : false })}
                  type="radio"
                  value={option}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  {...register(`${field.id}.${idx}`)}
                  type="checkbox"
                  value={option}
                  className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRatingValue(star);
                  setValue(field.id, star);
                }}
                className={`p-1 transition-colors ${
                  star <= ratingValue ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
            <span className="ml-4 text-sm text-gray-600">
              {ratingValue > 0 ? `${ratingValue}/5` : 'Click to rate'}
            </span>
            <input
              {...register(field.id, { required: field.required ? `${field.label} is required` : false })}
              type="hidden"
              value={ratingValue}
            />
          </div>
        );

      case 'date':
        return (
          <input
            {...register(field.id, { required: field.required ? `${field.label} is required` : false })}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {errors[field.id] && (
        <p className="text-red-500 text-sm mt-1">{errors[field.id].message}</p>
      )}
    </div>
  );
};

export default SurveyForm;