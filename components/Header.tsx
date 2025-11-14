
import React from 'react';
import { FilmIcon } from './icons/FilmIcon';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-center text-center flex-col">
       <div className="bg-brand-blue/10 p-4 rounded-full">
         <FilmIcon className="w-12 h-12 text-brand-blue" />
       </div>
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mt-4">
        Enterprise Bitrate Converter
      </h1>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl">
        Offline video transcoding to meet Netflix ad specifications. Secure, fast, and entirely in your browser.
      </p>
    </header>
  );
};

export default Header;
