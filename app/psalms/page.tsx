'use client';

import React, { useState, useEffect } from 'react';

const PsalmViewer = () => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [psalmData, setPsalmData] = useState<any>(null);
  const [selectedPsalm, setSelectedPsalm] = useState<number>(1);
  const [psalmText, setPsalmText] = useState<string>('');

  useEffect(() => {
    // Populate dropdown options
    const options = Array.from({ length: 150 }, (_, i) => i + 1);
    setNumbers(options);

    // Fetch psalms data
    const fetchPsalmsData = async () => {
      try {
        const response = await fetch('/api/psalms');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPsalmData(data);
      } catch (error) {
        console.error('Failed to fetch psalm data:', error);
      }
    };

    fetchPsalmsData();
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPsalm(Number(event.target.value));
    const text = psalmData ? psalmData[Number(event.target.value)]?.text || '' : '';
    setPsalmText(text);
  };

  function setIsOpen(arg0: boolean): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen flex">
      <nav className="bg-blue-500 p-4 fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-white text-2xl font-bold">
            <a href="/">Psalms Viewer</a>
          </div>
          <div className="hidden md:flex space-x-4">
            <a href="/" className="text-white hover:text-gray-200">Home</a>
            <a href="/leaderboard" className="text-white hover:text-gray-200">Leaderboard</a>
            <a href="/about" className="text-white hover:text-gray-200">About</a>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!open)} // Toggling the menu
              className="text-white focus:outline-none"
            >
              {open() ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className={`md:hidden ${open() ? 'block' : 'hidden'} mt-2`}>
          <a href="/" className="block py-2 px-4 text-white hover:bg-blue-700">Home</a>
          <a href="/leaderboard" className="block py-2 px-4 text-white hover:bg-blue-700">Leaderboard</a>
          <a href="/about" className="block py-2 px-4 text-white hover:bg-blue-700">About</a>
        </div>
      </nav>

      <div className="pt-16 flex flex-grow bg-gray-100 p-4">
        <div className="w-full max-w-md mx-auto p-4 bg-white border border-gray-300 rounded-lg shadow-md">
          <label htmlFor="psalm-number" className="block text-lg font-semibold mb-2 text-black text-center">
            Psalm
          </label>
          <select
            id="psalm-number"
            name="psalm-number"
            value={selectedPsalm}
            onChange={handleSelectChange}
            className="block w-full p-2 border border-gray-300 rounded-lg mb-4 text-black"
          >
            {numbers.map(number => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>

          {psalmData && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                {psalmData[selectedPsalm]?.title || 'Select a Psalm'}
              </h2>
              <div className="text-black whitespace-pre-line">
                {psalmText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsalmViewer;
