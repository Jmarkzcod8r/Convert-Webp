'use client';

import React, { useState, useRef, useEffect } from 'react';

// Define TooltipProps type
interface TooltipProps {
  inputRef: React.RefObject<HTMLInputElement>;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ inputRef, text }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  
  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      const handleMouseEnter = () => {
        const rect = inputElement.getBoundingClientRect();
        setPosition({
          left: rect.left + window.scrollX + rect.width / 2,
          top: rect.top + window.scrollY - 50 // 50px above the input
        });
        setShow(true);
      };

      const handleMouseLeave = () => {
        setShow(false);
      };

      inputElement.addEventListener('mouseenter', handleMouseEnter);
      inputElement.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        inputElement.removeEventListener('mouseenter', handleMouseEnter);
        inputElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [inputRef]);

  return (
    <>
      {show && (
        <div
          className="absolute bg-black text-white text-sm rounded-lg p-2 shadow-lg z-10"
          style={{ left: `${position.left}px`, top: `${position.top}px`, transform: 'translateX(-50%)' }}
        >
          {text}
        </div>
      )}
    </>
  );
};

const Example = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="text"
        className="border border-gray-300 rounded-lg p-2"
        placeholder="Hover me"
      />
      <Tooltip inputRef={inputRef} text="This is the tooltip text" />
    </div>
  );
};

export default Example;
