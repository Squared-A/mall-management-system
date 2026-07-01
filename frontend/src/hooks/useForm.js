import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validators';

/**
 * Lightweight form state management hook with validation support.
 * @param {object} initialValues
 * @param {object} validationRules - passed to validateForm
 * @param {Function} onSubmit - async (values) => void
 */
export const useForm = (initialValues = {}, validationRules = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const reset = useCallback((next = initialValues) => {
    setValues(next);
    setErrors({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      const validationErrors = validateForm(values, validationRules);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setSubmitting(true);
      try {
        await onSubmit?.(values);
      } finally {
        setSubmitting(false);
      }
    },
    [values, validationRules, onSubmit]
  );

  return {
    values,
    errors,
    submitting,
    handleChange,
    setFieldValue,
    setValues,
    handleSubmit,
    reset,
  };
};
