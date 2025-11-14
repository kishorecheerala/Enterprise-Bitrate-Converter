
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ConversionPanel from './components/ConversionPanel';
import Header from './components/Header';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    // Basic validation for video files
    if (file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please select a valid video file.');
    }
  };

  const handleReset = () => {
    setVideoFile(null);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 bg-brand-gray shadow-2xl rounded-2xl p-6 md:p-10 border border-brand-light-gray">
          {videoFile ? (
            <ConversionPanel file={videoFile} onReset={handleReset} />
          ) : (
            <FileUpload onFileSelect={handleFileSelect} />
          )}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Enterprise Solutions Inc. All rights reserved.</p>
          <p className="mt-1">Video processing is done entirely in your browser. No data is uploaded to any server.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
