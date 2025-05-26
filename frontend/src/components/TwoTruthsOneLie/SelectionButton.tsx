import React from 'react';
import { Textfit } from 'react-textfit';

/**
 * **SelectableButton** – stateless / controlled version.
 *
 * It relies on the parent to keep track of which button is selected, so that
 * clicking one button can automatically deselect the others.
 */
interface SelectableButtonProps {
  /** Text shown inside the button */
  label: string;
  /** Whether this particular button is selected */
  selected: boolean;
  /** Required click handler – parent should toggle the selected item */
  onClick: () => void;
}

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
} as const;

const SelectableButton: React.FC<SelectableButtonProps> = ({
  label,
  selected,
  onClick,
}) => {
  // Red "lie" scheme when selected, blue "truth" scheme otherwise.
  const { base, hover, ring } = selected ? bgMap.lie : bgMap.truth;

  const classes = `w-full h-32 text-2xl text-white text-center py-2 px-4 rounded ${ring} whitespace-pre-wrap break-words overflow-hidden flex items-center justify-center focus:outline-none`;

  return (
    <button onClick={onClick} className={`${base} ${hover} ${classes}`}>
      <Textfit
        mode="multi"
        forceSingleModeWidth={false}
        max={32}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {label}
      </Textfit>
    </button>
  );
};

export default SelectableButton;

