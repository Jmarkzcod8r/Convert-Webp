'use client';

import React, { useRef } from 'react';

const FocusInputPage = () => {
  const secondInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default behavior
      secondInputRef.current?.focus(); // Focus the second input
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white border border-gray-300 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="first-input" className="block text-lg font-semibold mb-2 text-black">
            First Input
          </label>
          <input
            id="first-input"
            type="text"
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 rounded-lg text-black"
            placeholder="Type here and press Enter"
          />
        </div>
        <div>
          <label htmlFor="second-input" className="block text-lg font-semibold mb-2 text-black">
            Second Input
          </label>
          <input
            id="second-input"
            type="text"
            ref={secondInputRef}
            className="w-full p-2 border border-gray-300 rounded-lg text-black"
            placeholder="Focus will move here"
          />
        </div>
      </div>
    </div>
  );
};

export default FocusInputPage;
