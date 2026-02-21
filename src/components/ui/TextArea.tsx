"use client";

import { useRef, useEffect, useCallback } from "react";

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  name?: string;
}

export default function TextArea({
  label,
  value,
  onChange,
  placeholder,
  minRows = 3,
  name,
}: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <div>
      <label className="input-label" htmlFor={name}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={name}
        name={name}
        className="input-field resize-none overflow-hidden"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
      />
    </div>
  );
}
