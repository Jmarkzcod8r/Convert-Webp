'use client';

import React, { useState, useEffect, useRef } from 'react';
import Loader from './components/sam';

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
  const [correctAnswers, setCorrectAnswers] = useState<Map<number, boolean>>(new Map());

  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  // Tooltip Component


  

  // const [tooltip, setTooltip] = useState<{ text: string; show: boolean; left: number; top: number }>({
  //   text: '',
  //   show: false,
  //   left: 0,
  //   top: 0
  // });

  
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

        // Set the default Psalm 1 text
        if (data && data[1]) {
          setPsalmText(data[1].text || '');
          setProcessedText([]);
        }
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
    setCorrectAnswers(new Map()); // Reset correct answers
  };

  const handleStartClick = () => {
    setScore(0);
    // inputRefs.current.clear();
    console.log('inputRefs:', inputRefs)
    setCorrectAnswers(new Map<number, boolean>(
      Array.from(correctAnswers.keys()).map((key) => [key, false])
    ));
  
    // Clear previous input values and reset colors
    inputRefs.current.forEach((input, key) => {
      if (input) {
        // input.key=key
        input.value = ''; // Clear the input value
        // input.className='bg-blue-400'
        input.style.backgroundColor = 'white'; // Reset the background color to white
        // input.classList.add('bg-gray-400');
      }
    });
    inputRefs.current.clear();
    
  
    if (!psalmData || !psalmData[selectedPsalm]) {
      console.error('Psalm data is not available.');
      return;
    }
  
    const text = psalmData[selectedPsalm]?.text || '';
    setPsalmText(text.replace(/\n/g, ' '));
  
    // Split the text into lines and words
    const lines = text.split('\n');
    const words = text.replace(/\n/g, ' ').split(' ');
    
    // const words = text.split(' ');
  
    // Filter out numbers from words
    const filteredWords = words.filter((word: any) => isNaN(Number(word)));
    console.log('filtered words: ', filteredWords)
    // Determine the number of lines and selected indices
    const numberOfLines = lines.length;
    const selectedIndices = new Set<number>();
    const numSelections = Math.min(numberOfLines, filteredWords.length); // Ensure we don't select more indices than available words
  
    while (selectedIndices.size < numSelections) {
      const randomIndex = Math.floor(Math.random() * filteredWords.length);
      selectedIndices.add(randomIndex);
    }
  
    // Replace selected words with input fields
    const processed = words.map((word: string, index: number) => {
      const key = `input-${index}`;
      if (selectedIndices.has(filteredWords.indexOf(word))) {
        return (
          <span key={index} className="inline-flex items-center">
          <div className=''>
            <input
              ref={(el) => {
                if (el) {
                  inputRefs.current.set(key,  el); // Use unique key
                }
              }}
              type="text"
              onFocus={() => handleFocus(key)} // Handle focus event
              onKeyDown={(e) => handleKeyDown(key, e)} // Pass the unique key
              className="border border-gray-300 rounded-lg p-1 mr-1 text-center"
              style={{ width: `${word.length * 18}px`, backgroundColor: 'white' }} // Set initial background color to white
              placeholder={` `} // Set placeholder as the current index
            />
            {index < words.length - 1 ? ' ' : ''}
            </div>
          </span>
        );
      }
      return (
        <span key={index} className="inline">
          {word} {index < words.length - 1 ? ' ' : ''}
        </span>
      );
    });
    
    // Function to validate if all inputs are cleared and have white background
    const validateInputs = () => {
      let allCleared = true;
    
      inputRefs.current.forEach((input) => {
        if (input && (input.value !== '' || input.style.backgroundColor !== 'white')) {
          allCleared = false;
        }
      });
    
      return allCleared;
    };
    
    // Function to reset inputs if validation fails
    const resetInputsIfNecessary = () => {
      if (!validateInputs()) {
        inputRefs.current.forEach((input) => {
          if (input) {
            input.value = ' asd'; // Clear the input value
            input.style.backgroundColor = 'white'; // Reset background color to white
          }
        });
      }
    };
    
    // Run the reset check
    resetInputsIfNecessary();
  
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

    let score = 0;
    const words = psalmText.replace(/\n/g, ' ').split(' ');
    const newCorrectAnswers = new Map<number, boolean>();

    inputRefs.current.forEach((input, key) => {
      const index = parseInt(key.split('-')[1], 10);
      if (input) {
        const isCorrect = input.value.trim() === words[index];
        newCorrectAnswers.set(index, isCorrect);
        if (isCorrect) {
          input.style.backgroundColor = 'green'; // Turn correct inputs green
          score++;
        } else {
          
          if (input.parentNode) {
            // Start of tooltip creation
            const parent = input.parentNode;
  
            // Ensure the parent container is positioned relatively
            // parent.style.position = 'relative';
  
            // Create and style the new div element
            const newDiv = document.createElement('div');
            newDiv.textContent =words[index]; // Set the text content of the div
            newDiv.className = ' hidden absolute text-white bg-violet-500 transform  -translate-y-[45px] translate-x-[0px] p-1 rounded-md '; // Add class for styling
  
            // Optional: Add styles to position the div above the input
            // newDiv.style.position = 'absolute';
            // newDiv.style.top = '-30px'; // Adjust this value to position above the input
            // newDiv.style.left = '0';
            // newDiv.style.width = '100%'; // Optional: to match the width of the input
            // newDiv.style.backgroundColor = 'lightgray'; // Optional: background color
            // newDiv.style.padding = '5px'; // Optional: padding
            // newDiv.style.textAlign = 'center'; // Optional: center text
            // newDiv.style.border = '1px solid #ccc'; // Optional: bordwer
            // newDiv.style.visibility = 'hidden'; // Initially hide the tooltip
            // newDiv.style.opacity = '0'; // Initially hide the tooltip
            // newDiv.style.transition = 'opacity 0.3s'; // Smooth transition for tooltip
  
            // Append the new div to the parent node
            parent.insertBefore(newDiv, input);
            // End of tooltip creation
  
            // Start of hover effect handling
            input.addEventListener('mouseenter', () => {
              newDiv.classList.remove('hidden')
            });
  
            input.addEventListener('mouseleave', () => {
              newDiv.classList.add('hidden')
            });
            // End of hover effect handling
          }
  
          input.style.backgroundColor = 'red'; // Turn wrong inputs red
          input.classList.add('hover:scale-110'); // Add class for scale effect
        
      
         console.log(input.parentNode)
      } }
    });

    setCorrectAnswers(newCorrectAnswers);
    setScore(score);
    setShowResults(true);
  };


  const handleCloseResults = () => {
    setShowResults(false);
  
    // Convert all entries in the Map to `false`
    setCorrectAnswers(new Map<number, boolean>(
      Array.from(correctAnswers.keys()).map((key) => [key, false])
    ));
    // Clear previous input values and reset colors
    // inputRefs.current.forEach((input, key) => {
    //   if (input) {
    //     input.value = ''; // Clear the input value
    //     input.style.backgroundColor = 'white'; // Reset the background color to white
    //   }
    // });
    
    // inputRefs.current.clear();
    console.log('inputrefs:', inputRefs)
  };
  
  

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Loader/> */}
      <nav className="bg-blue-500 p-4 fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-white text-2xl font-bold flex flex-row items-center gap-2">
            <a href="/">Psalmster</a> <span className='text-xs'>ver. 1.0.1</span>
            <span className='h-auto '><Loader/></span>
          </div>
          <div className="hidden md:flex space-x-4">
            <a href="/about" className="text-white hover:text-gray-200">About</a>
          </div>
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
          )}

          {psalmData && showQuestionnaire && (
            <div className="mt-8">
              <div className="text-black">{processedText}</div>
              <button
                id="submit-button"
                onClick={handleSubmit}
                className="mt-4 w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
              >
                Submit
              </button>
            </div>
          )}
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
