'use client';

import React, { useState, useEffect } from 'react';

const Page = () => {
  const [userImageSrc, setUserImageSrc] = useState<string>('');
  const [webpImageSrc, setWebpImageSrc] = useState<string>('');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [psalmData, setPsalmData] = useState<any>(null);
  const [selectedPsalm, setSelectedPsalm] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);

  function convertImage(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const src = URL.createObjectURL(event.target.files[0]);
      setUserImageSrc(src);
      convertToWebp(src);
    }
  }

  async function convertToWebp(src: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const userImage = new Image();
      userImage.src = src;

      userImage.onload = async () => {
        const maxWidth = 800; // Set maximum width for resizing
        const maxHeight = 600; // Set maximum height for resizing

        let width = userImage.width;
        let height = userImage.height;

        // Resize image if it exceeds maximum dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(userImage, 0, 0, width, height);

        // Convert the resized image to WebP format with compression and quality adjustment
        const webpImage = await canvas.toDataURL('image/webp', 0.8); // Adjust quality (0-1)
        setWebpImageSrc(webpImage);

        // Trigger download
        const downloadLink = document.createElement('a');
        downloadLink.href = webpImage;
        downloadLink.download = 'converted.webp';
        downloadLink.click();
      };
    }
  }

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
  };

  return (
    <div className='min-h-screen'>
      <nav className="bg-blue-500 p-4 fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-white text-2xl font-bold">
            <a href="/">Psalmster</a>
          </div>
          <div className="hidden md:flex space-x-4">
            <a href="/" className="text-white hover:text-gray-200">Home</a>
            <a href="/leaderboard" className="text-white hover:text-gray-200">Leaderboard</a>
            <a href="/about" className="text-white hover:text-gray-200">About</a>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              {isOpen ? (
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
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-2`}>
          <a href="/" className="block py-2 px-4 text-white hover:bg-blue-700">Home</a>
          <a href="/leaderboard" className="block py-2 px-4 text-white hover:bg-blue-700">Leaderboard</a>
          <a href="/about" className="block py-2 px-4 text-white hover:bg-blue-700">About</a>
        </div>
      </nav>

      <div className="pt-16 flex flex-col items-center min-h-[150vh] bg-gray-100 p-4">
        <div className="bg-violet p-6 rounded-lg shadow-md w-full max-w-sm mt-2">
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
          <button
            id="start-button"
            className="w-full py-2 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-600"
          >
            Start
          </button>
        </div>

        {psalmData && (
          <div className="mt-8 w-full max-w-md mx-auto p-4 bg-white border border-gray-300 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {psalmData[selectedPsalm]?.title || 'Select a Psalm'}
            </h2>
            <pre className="whitespace-pre-line text-black">{psalmData[selectedPsalm]?.text || 'No text available'}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
