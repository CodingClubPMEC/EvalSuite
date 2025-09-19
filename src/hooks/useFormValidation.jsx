import { useState, useCallback } from 'react';

/**
 * Custom hook for form validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} - Form state and validation methods
 */
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Validate individual field
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.required === true ? 'This field is required' : rules.required;
    }

    // Min/Max validation for numbers
    if (rules.min !== undefined && Number(value) < rules.min) {
      return `Value must be at least ${rules.min}`;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      return `Value must be no more than ${rules.max}`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Invalid format';
    }

    // Custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
      return rules.custom(value, values);
    }

    return null;
  }, [validationRules, values]);

  // Validate all fields
  const validateAllFields = useCallback(() => {
    setIsValidating(true);
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsValidating(false);
    return isValid;
  }, [validateField, values, validationRules]);

  // Handle field change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Get field props (for easy integration)
  const getFieldProps = useCallback((name) => ({
    value: values[name] || '',
    onChange: (e) => handleChange(name, e.target.value),
    onBlur: () => handleBlur(name),
    error: touched[name] ? errors[name] : null,
    hasError: touched[name] && !!errors[name]
  }), [values, handleChange, handleBlur, errors, touched]);

  return {
    values,
    errors,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    validateField,
    validateAllFields,
    resetForm,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
    hasAnyError: Object.values(errors).some(error => error !== null)
  };
};

/**
 * Input component with validation feedback
 */
export const ValidatedInput = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  required, 
  className = '',
  fieldProps,
  ...props 
}) => {
  const { value, onChange, onBlur, error, hasError } = fieldProps;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
          ${hasError 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 hover:border-slate-400'
          }
          ${className}
        `}
        aria-invalid={hasError}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      
      {error && (
        <div id={`${name}-error`} className="flex items-center space-x-1 text-red-600 text-sm">
          <span className="text-red-500">⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Number input with validation for scores
 */
export const ScoreInput = ({ 
  teamName, 
  criteriaName, 
  maxValue, 
  value, 
  onChange, 
  className = '' 
}) => {
  const [localError, setLocalError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const numValue = parseInt(inputValue);

    // Clear error when user starts typing
    setLocalError(null);

    // Validate value
    if (inputValue && isNaN(numValue)) {
      setLocalError('Please enter a valid number');
      return;
    }

    if (numValue < 0) {
      setLocalError('Score cannot be negative');
      return;
    }

    if (numValue > maxValue) {
      setLocalError(`Score cannot exceed ${maxValue}`);
      return;
    }

    onChange(e);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Perform final validation on blur
    if (value && (parseInt(value) > maxValue || parseInt(value) < 0)) {
      const clampedValue = Math.max(0, Math.min(parseInt(value) || 0, maxValue));
      onChange({ target: { value: clampedValue.toString() } });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setLocalError(null);
  };

  const hasError = !!localError;

  return (
    <div className="relative">
      <input
        type="number"
        min="0"
        max={maxValue}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={`
          w-16 px-2 py-2 text-center border-2 font-bold text-slate-800 rounded-lg shadow-sm
          focus:outline-none focus:ring-2 transition-all duration-200
          ${hasError 
            ? 'border-red-500 focus:ring-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-slate-400'
          }
          ${className}
        `}
        placeholder="0"
        aria-label={`Score for ${teamName} - ${criteriaName} (max ${maxValue})`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `score-error-${teamName}-${criteriaName}` : undefined}
      />
      
      {hasError && isFocused && (
        <div 
          id={`score-error-${teamName}-${criteriaName}`}
          className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded-md shadow-lg z-10 text-xs text-red-700 whitespace-nowrap"
        >
          <div className="flex items-center space-x-1">
            <span className="text-red-500">⚠</span>
            <span>{localError}</span>
          </div>
        </div>
      )}
    </div>
  );
};