"use client";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  name,
}: TextInputProps) {
  return (
    <div>
      <label className="input-label" htmlFor={name}>
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
