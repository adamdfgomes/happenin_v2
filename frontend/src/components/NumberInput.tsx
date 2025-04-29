import React from 'react';

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder = "Enter a number",
  className = "",
  min = 1,
  max = 100
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow integers
    if (newValue === '' || /^\d+$/.test(newValue)) {
      const numValue = newValue === '' ? '' : parseInt(newValue, 10).toString();
      if (newValue === '' || (parseInt(numValue) >= min && parseInt(numValue) <= max)) {
        onChange(numValue);
      }
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="\d*"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${className}`}
    />
  );
};

export default NumberInput; 