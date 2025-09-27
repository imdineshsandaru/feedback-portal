import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react';
import { FormField, Survey } from '../types';
import { useSurveys } from '../hooks/useFirestore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  type: yup.string().oneOf(['client', 'event']).required('Type is required'),
});

const SurveyBuilder: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const { createSurvey } = useSurveys();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      type: 'client' as 'client' | 'event',
    }
  });

  const surveyType = watch('type');

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === 'select' || type === 'radio' || type === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {})
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => field.id === id ? { ...field, ...updates } : field));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const onSubmit = async (data: any) => {
    try {
      const survey: Omit<Survey, 'id'> = {
        ...data,
        fields,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createSurvey(survey);
      toast.success('Survey created successfully!');
      navigate('/admin/surveys');
    } catch (error) {
      toast.error('Failed to create survey');
    }
  };

  const getDefaultFieldsForType = () => {
    if (surveyType === 'client') {
      return [
        { id: '1', type: 'text' as const, label: 'Project Name', required: true },
        { id: '2', type: 'rating' as const, label: 'Overall Satisfaction', required: true },
        { id: '3', type: 'textarea' as const, label: 'What did you like most?', required: false },
        { id: '4', type: 'textarea' as const, label: 'Areas for improvement', required: false },
        { id: '5', type: 'select' as const, label: 'Would you recommend us?', required: true, options: ['Definitely', 'Probably', 'Maybe', 'Probably not', 'Definitely not'] },
      ];
    } else {
      return [
        { id: '1', type: 'text' as const, label: 'Event Name', required: true },
        { id: '2', type: 'rating' as const, label: 'Event Rating', required: true },
        { id: '3', type: 'textarea' as const, label: 'What was the best part?', required: false },
        { id: '4', type: 'select' as const, label: 'How did you hear about this event?', required: false, options: ['Social Media', 'Email', 'Word of mouth', 'Website', 'Other'] },
        { id: '5', type: 'checkbox' as const, label: 'Topics of Interest', required: false, options: ['Technology', 'Business', 'Marketing', 'Design', 'Other'] },
      ];
    }
  };

  const loadTemplate = () => {
    setFields(getDefaultFieldsForType());
    toast.success(`${surveyType === 'client' ? 'Client' : 'Event'} template loaded!`);
  };

  if (previewMode) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Survey Preview</h2>
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Editor
            </button>
          </div>
          <SurveyPreview fields={fields} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Survey Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Survey Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Title
              </label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter survey title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="client">Client Feedback</option>
                <option value="event">Event Feedback</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what this survey is for"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={loadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load {surveyType === 'client' ? 'Client' : 'Event'} Template
            </button>
          </div>
        </div>

        {/* Form Builder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Form Fields</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {fields.map((field, index) => (
              <FieldEditor
                key={field.id}
                field={field}
                index={index}
                onUpdate={updateField}
                onRemove={removeField}
              />
            ))}
          </div>

          {/* Add Field Buttons */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Field</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'text', label: 'Text' },
                { type: 'textarea', label: 'Textarea' },
                { type: 'select', label: 'Dropdown' },
                { type: 'radio', label: 'Radio' },
                { type: 'checkbox', label: 'Checkbox' },
                { type: 'rating', label: 'Rating' },
                { type: 'date', label: 'Date' },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addField(type as FormField['type'])}
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/surveys')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Create Survey
          </button>
        </div>
      </form>
    </div>
  );
};

interface FieldEditorProps {
  field: FormField;
  index: number;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onRemove: (id: string) => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, index, onUpdate, onRemove }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-2">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                value={field.type}
                onChange={(e) => onUpdate(field.id, { type: e.target.value as FormField['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="select">Dropdown</option>
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
                <option value="rating">Rating</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Field label"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Placeholder text"
              />
            </div>
          </div>

          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={field.options?.join('\n') || ''}
                onChange={(e) => onUpdate(field.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Required</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => onRemove(field.id)}
          className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const SurveyPreview: React.FC<{ fields: FormField[] }> = ({ fields }) => {
  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.type === 'text' && (
            <input
              type="text"
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              placeholder={field.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled
            />
          )}

          {field.type === 'select' && (
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
              <option>Select an option...</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          )}

          {field.type === 'radio' && (
            <div className="space-y-2">
              {field.options?.map((option, idx) => (
                <label key={idx} className="flex items-center">
                  <input type="radio" name={field.id} className="mr-2" disabled />
                  {option}
                </label>
              ))}
            </div>
          )}

          {field.type === 'checkbox' && (
            <div className="space-y-2">
              {field.options?.map((option, idx) => (
                <label key={idx} className="flex items-center">
                  <input type="checkbox" className="mr-2" disabled />
                  {option}
                </label>
              ))}
            </div>
          )}

          {field.type === 'rating' && (
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button key={num} className="w-8 h-8 border border-gray-300 rounded text-sm" disabled>
                  {num}
                </button>
              ))}
            </div>
          )}

          {field.type === 'date' && (
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default SurveyBuilder;