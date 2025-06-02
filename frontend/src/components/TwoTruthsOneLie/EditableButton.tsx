// src/components/TwoTruthsOneLie/EditableButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import FitText from './FitText';

interface EditableButtonProps {
  initialLabel: string;
  variant: 'truth' | 'lie';
  onLabelChange?: (value: string) => void;
}

const MAX = 32;

const bgMap = {
  truth: {
    base: 'bg-blue-400',
    hover: 'hover:bg-blue-500',
    ring: 'focus:ring-2 focus:ring-blue-300',
  },
  lie: {
    base: 'bg-red-400',
    hover: 'hover:bg-red-500',
    ring: 'focus:ring-2 focus:ring-red-300',
  },
};

const EditableButton: React.FC<EditableButtonProps> = ({
  initialLabel,
  variant,
  onLabelChange,
}) => {
  const [label, setLabel] = useState(initialLabel);
  const [editing, setEditing] = useState(false);
  const [hasCleared, setHasCleared] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const resetToInitial = () => {
    if (!label.trim()) {
      setLabel(initialLabel);
    }
  };

  const notifyParent = (value: string) => {
    if (onLabelChange) {
      onLabelChange(value.trim() === '' ? initialLabel : value);
    }
  };

  const { base, hover, ring } = bgMap[variant];
  const commonClasses = `
    w-full h-32
    text-2xl text-white text-center
    py-2 px-4 rounded ${ring}
    whitespace-pre-wrap break-words overflow-hidden
  `
    .trim()
    .replace(/\s+/g, ' ');

  if (editing) {
    return (
      <div className="w-full">
        <div
          className={`
            ${base} ${ring}
            w-full h-32
            relative rounded
            flex items-center justify-center
          `}
        >
          <FitText
            minFontSize={12}
            maxFontSize={MAX}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 1rem',
            }}
          >
            {label}
          </FitText>
          <textarea
            ref={inputRef}
            value={label}
            maxLength={MAX}
            onChange={(e) => {
              const v = e.target.value;
              const newVal = v.length <= MAX ? v : v.slice(0, MAX);
              setLabel(newVal);
            }}
            onFocus={() => {
              if (!hasCleared && label === initialLabel) {
                setLabel('');
                setHasCleared(true);
              }
            }}
            onBlur={() => {
              resetToInitial();
              notifyParent(label);
              setEditing(false);
              setHasCleared(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                resetToInitial();
                notifyParent(label);
                setEditing(false);
                setHasCleared(false);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-text"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
            }}
          />
          <div className="absolute bottom-1 right-2 text-sm text-gray-200">
            {label.length} / {MAX}
          </div>
        </div>
      </div>
    );
  }

  const isPlaceholder = label === initialLabel;

  return (
    <button
      onClick={() => setEditing(true)}
      className={`
        ${base} ${hover}
        ${commonClasses}
        focus:outline-none
        flex items-center justify-center
        relative
        ${isPlaceholder ? 'opacity-60' : 'opacity-100'}
      `}
    >
      <FitText
        minFontSize={12}
        maxFontSize={MAX}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {label}
      </FitText>
    </button>
  );
};

export default EditableButton;
