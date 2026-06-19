export const isRequired = (value) =>
  value !== undefined && value !== null && String(value).trim() !== '';

export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));

export const isValidPhone = (value) =>
  /^[+]?[\d\s-()]{7,15}$/.test(String(value || ''));

export const minLength = (value, len) => String(value || '').length >= len;

export const isValidPassword = (value) =>
  String(value || '').length >= 8;

export const passwordsMatch = (password, confirmPassword) =>
  password === confirmPassword;

export const isPositiveNumber = (value) => Number(value) > 0;

/**
 * Generic form validator runner.
 * @param {object} values - form values
 * @param {object} rules - { fieldName: [(value, values) => errorMessage|null] }
 * @returns {object} errors keyed by field name
 */
export const validateForm = (values, rules) => {
  const errors = {};
  Object.entries(rules).forEach(([field, validators]) => {
    for (const validator of validators) {
      const error = validator(values[field], values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  return errors;
};
