'use client';

import React, { useState, useEffect, useRef } from 'react';

const Page = () => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [psalmData, setPsalmData] = useState<any>(null);
  const [selectedPsalm, setSelectedPsalm] = useState<number>(1);
  const [psalmText, setPsalmText] = useState<string>('');
  const [processedText, setProcessedText] = useState<JSX.Element[]>([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);

  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  useEffect(() => {
    // Populate dropdown options
    const options = Array.from({ length: 50 }, (_, i) => i + 1);
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
        console.log(data)
        
      } catch (error) {
        console.error('Failed to fetch psalm data:', error);
      }
    };

    fetchPsalmsData();
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPsalm(Number(event.target.value));

    // Reset states when a new Psalm is selected
    inputRefs.current.clear(); // Clear the ref map
    setPsalmText(psalmData[Number(event.target.value)]?.text || '');
    setProcessedText([]);
    setShowQuestionnaire(false);
    setShowResults(false);
    setScore(0);
  };

  const handleStartClick = () => {
    if (!psalmData || !psalmData[selectedPsalm]) {
      console.error('Psalm data is not available.');
      return;
    }

    const text = psalmData[selectedPsalm]?.text || '';
    setPsalmText(text);

    // Split the text into lines and words
    const lines = text.split('\n');
    const words = text.split(' ');

    // Filter out numbers from words
    const filteredWords = words.filter((word: any) => isNaN(Number(word)));

    // Determine the number of lines and selected indices
    const numberOfLines = lines.length;
    const selectedIndices = new Set<number>();
    const numSelections = Math.min(numberOfLines, filteredWords.length); // Ensure we don't select more indices than available words

    while (selectedIndices.size < numSelections) {
      const randomIndex = Math.floor(Math.random() * filteredWords.length);
      selectedIndices.add(randomIndex);
    }

    // Replace selected words with input fields
    const inputslistindeces = [];
    const processed = words.map((word: string, index: number) => {
      const key = `input-${index}`;
      if (selectedIndices.has(filteredWords.indexOf(word))) {
        inputslistindeces.push(index);
        return (
          <span key={index} className="inline-flex items-center">
            <input
              ref={(el) => {
                if (el) {
                  inputRefs.current.set(key, el); // Use unique key
                }
              }}
              type="text"
              onFocus={() => handleFocus(key)} // Handle focus event
              onKeyDown={(e) => handleKeyDown(key, e)} // Pass the unique key
              className="border border-gray-300 rounded-lg p-1 mr-1 text-center"
              style={{ width: `${word.length * 15}px` }} // Adjust width based on word length
              placeholder={`${index}`} // Set placeholder as the current index
            />
            {index < words.length - 1 ? ' ' : ''}
          </span>
        );
      }
      return (
        <span key={index} className="inline">
          {word} {index < words.length - 1 ? ' ' : ''}
        </span>
      );
    });

    setProcessedText(processed);
    setShowQuestionnaire(true);
    setStartTime(Date.now()); // Record start time

    // Focus the first input field
    if (inputRefs.current.size > 0) {
      const firstKey = `input-0`;
      const firstInput = inputRefs.current.get(firstKey);
      if (firstInput) {
        firstInput.focus();
      }
    }
  };

  const handleKeyDown = (key: any, event: React.KeyboardEvent<HTMLInputElement>) => {
    const ctrlPressed = event.ctrlKey;
    const shiftPressed = event.shiftKey;
  
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default behavior
  
      if (ctrlPressed) {
        // Clear the input field
        const currentInput = inputRefs.current.get(key);
        if (currentInput) {
          currentInput.value = ''; // Clear the value
        }
      } else {
        // Move focus to the next input
        const keys = Array.from(inputRefs.current.keys());
        const index = keys.indexOf(key);
        const nextKey = keys[index + 1];
        const nextInput = nextKey ? inputRefs.current.get(nextKey) : null;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (event.key === ' ') {
      event.preventDefault(); // Prevent default behavior
  
      if (ctrlPressed && shiftPressed) {
        // Trigger the submit button if Ctrl + Shift + Spacebar is pressed
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
          (submitButton as HTMLButtonElement).click();
        }
      } else {
        const keys = Array.from(inputRefs.current.keys());
        const index = keys.indexOf(key);
  
        if (ctrlPressed) {
          // Move focus to the previous input if Ctrl is pressed
          const prevKey = keys[index - 1];
          const prevInput = prevKey ? inputRefs.current.get(prevKey) : null;
          if (prevInput) {
            prevInput.focus();
          }
        } else {
          if (index === keys.length - 1) {
            // If the space bar is pressed on the last input, trigger the submit button
            const submitButton = document.getElementById('submit-button');
            if (submitButton) {
              (submitButton as HTMLButtonElement).click();
            }
          } else {
            // Move focus to the next input if Ctrl is not pressed
            const nextKey = keys[index + 1];
            const nextInput = nextKey ? inputRefs.current.get(nextKey) : null;
            if (nextInput) {
              nextInput.focus();
            }
          }
        }
      }
    }
  };
  

  const handleFocus = (key: string) => {
    const input = inputRefs.current.get(key);
    if (input) {
      const inputRect = input.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollOffset = inputRect.bottom - 0.8 * viewportHeight;

      if (scrollOffset > 0) {
        window.scrollTo({
          top: window.scrollY + scrollOffset,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleSubmit = () => {
    if (!psalmData || !psalmText) return;

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // Time in seconds

    // Calculate the score
    let score = 0;
    const words = psalmText.split(' ');
    inputRefs.current.forEach((input, key) => {
      const index = parseInt(key.split('-')[1], 10);
      if (input && input.value.trim() === words[index]) {
        score++;
      }
    });

    setScore(score);
    setShowResults(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };
  return (
    <div className="min-h-screen flex">
      <nav className="bg-blue-500 p-4 fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-white text-2xl font-bold">
            <a href="/">Psalmster</a> <span className='text-xs'>ver. 1.0</span>
          </div>
          {/* <div className="hidden md:flex space-x-4">
            <a href="/" className="text-white hover:text-gray-200">Home</a>
            <a href="/leaderboard" className="text-white hover:text-gray-200">Leaderboard</a>
            <a href="/about" className="text-white hover:text-gray-200">About</a>
          </div> */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)} // Toggling the menu
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
          <button
            id="start-button"
            onClick={handleStartClick}
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
          >
            Start
          </button>

          

          {psalmData && !showQuestionnaire && (
            <div className='mt-8 text-black'><h4>{psalmText}</h4></div>
          ) }

          {psalmData && showQuestionnaire && (
            <div className="mt-8">
              {/* <h2 className="text-2xl font-bold mb-4 text-center">
                {psalmData[selectedPsalm]?.title || 'Select a Psalm'}
              </h2> */}
              <div className="text-black">{processedText}</div>
              <button
                id="submit-button"
                onClick={handleSubmit}
                className="mt-4 w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
              >
                Submit
              </button>
            </div>
          ) }

          
        </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'black' }}>Results</h2>
            <p className="mb-4" style={{ color: 'black' }}>Score: {score}/{processedText.filter((_, index) => inputRefs.current.has(`input-${index}`)).length}</p>
            <p className="mb-4" style={{ color: 'black' }}>Time Taken: {Math.floor((Date.now() - startTime) / 1000)} seconds</p>
            <button
              onClick={handleCloseResults}
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default Page;
