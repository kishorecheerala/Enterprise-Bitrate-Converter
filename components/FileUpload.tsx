
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${isDragging ? 'border-brand-blue bg-blue-900/20 scale-105' : 'border-brand-light-gray bg-brand-dark/50'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept="video/*"
      />
      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <UploadIcon className="w-16 h-16 text-gray-500" />
        <p className="text-xl font-semibold text-gray-300">
          Drag & drop your video file here
        </p>
        <p className="text-gray-400">or</p>
        <label
          htmlFor="file-upload"
          className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Browse File
        </label>
      </div>
    </div>
  );
};

export default FileUpload;
