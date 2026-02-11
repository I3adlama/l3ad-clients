"use client";

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  name?: string;
}

export default function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  name,
}: TextAreaProps) {
  return (
    <div>
      <label className="input-label" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        className="input-field resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}
