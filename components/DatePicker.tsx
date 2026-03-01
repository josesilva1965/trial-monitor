import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, required, min, max }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (inputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          inputRef.current.showPicker();
        } catch (e) {
          inputRef.current.focus();
        }
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div
        className="relative group cursor-pointer"
        onClick={handleClick}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <Calendar className="h-5 w-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </div>
        <input
          ref={inputRef}
          type="date"
          required={required}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 sm:text-sm bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-sans cursor-pointer placeholder-slate-400"
          style={{ colorScheme: 'light' }}
        />
      </div>
    </div>
  );
};

export default DatePicker;