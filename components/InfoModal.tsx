
import React, { useState, useEffect } from 'react';
import { getNetflixSpecAdvice } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// A simple markdown to HTML converter for bold and lists
const renderMarkdown = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(\d+\.\s.*)/g, '<p>$1</p>')
      .replace(/\n/g, '<br />');
    return { __html: html };
};

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError('');
      setAdvice('');
      getNetflixSpecAdvice(3640) // Using the example bitrate from user's error
        .then(res => setAdvice(res))
        .catch(err => {
            console.error(err);
            setError('Failed to load advice. Please check your API key and network connection.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-brand-gray rounded-2xl shadow-xl w-full max-w-2xl border border-brand-light-gray overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <SparklesIcon className="w-8 h-8 text-brand-blue mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-white">Netflix Spec Advisor</h2>
                <p className="text-gray-400">Expert advice powered by Gemini</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <XMarkIcon className="w-7 h-7" />
            </button>
          </div>
        </div>
        <div className="p-6 border-t border-brand-light-gray bg-brand-dark/30 max-h-[60vh] overflow-y-auto">
          {isLoading && <div className="text-center text-gray-400">Loading expert advice...</div>}
          {error && <div className="text-center text-red-400">{error}</div>}
          {advice && <div className="prose prose-invert text-gray-300" dangerouslySetInnerHTML={renderMarkdown(advice)} />}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
