import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-100 mx-auto p-8 grid place-items-center">
        <div className='w-[600px] h-auto text-black bg-blue-300 p-4 rounded-md'>
      <h1 className="text-3xl font-bold mb-4">About This Site</h1>
      <span className="mb-6">
        This website is designed to highlight the beauty and depth of the Psalms, making them accessible for everyone to appreciate more deeply. Whether you&rsquo;re reading for inspiration, comfort, or reflection, our goal is to provide an easy-to-use platform that allows you to explore the Psalms with ease.
      </span>

      <h2 className="text-2xl font-bold mb-4">Keyboard Navigation Rules</h2>
      <ul className="list-disc ml-8 mb-6">
        <li><strong>Enter:</strong> Moves the focus to the next input field.</li>
        <li><strong>Spacebar:</strong> Moves the focus to the next input field.</li>
        <li><strong>Ctrl + Spacebar:</strong> Moves the focus to the previous input field.</li>
        <li><strong>Ctrl + Enter:</strong> Clears the current input field.</li>
        <li><strong>Spacebar + last input focus</strong> Submits the form.</li>
        <li><strong>Ctrl + Shift + Spacebar:</strong> Submits the form.</li>
      </ul>

      <p>
        We hope that this site will help you connect more deeply with the Psalms and find the inspiration and comfort they offer.
      </p>
      </div>
    </div>
  );
};

export default About;
