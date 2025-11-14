
import React, { useState, useEffect, useCallback } from 'react';
import { useFFmpeg } from '../hooks/useFFmpeg';
import { ConversionStatus } from '../types';
import InfoModal from './InfoModal';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CogIcon } from './icons/CogIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { FileVideoIcon } from './icons/FileVideoIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ConversionPanelProps {
  file: File;
  onReset: () => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ConversionPanel: React.FC<ConversionPanelProps> = ({ file, onReset }) => {
  const [targetBitrate, setTargetBitrate] = useState<number>(12000);
  const [status, setStatus] = useState<ConversionStatus>(ConversionStatus.IDLE);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { isLoaded, progress, log, convertToMp4, load } = useFFmpeg();

  useEffect(() => {
    if (!isLoaded) {
      setStatus(ConversionStatus.LOADING_FFMPEG);
    } else {
        if (status === ConversionStatus.LOADING_FFMPEG) {
             setStatus(ConversionStatus.IDLE);
        }
    }
  }, [isLoaded, status]);

  const handleConvert = useCallback(async () => {
    if (!isLoaded || status === ConversionStatus.CONVERTING) return;
    setStatus(ConversionStatus.CONVERTING);
    setDownloadUrl(null);
    const resultUrl = await convertToMp4(file, targetBitrate);
    if (resultUrl) {
      setDownloadUrl(resultUrl);
      setStatus(ConversionStatus.DONE);
    } else {
      setStatus(ConversionStatus.ERROR);
    }
  }, [isLoaded, status, convertToMp4, file, targetBitrate]);

  const renderStatus = () => {
    switch (status) {
      case ConversionStatus.LOADING_FFMPEG:
        return <div className="flex items-center text-yellow-400"><CogIcon className="w-5 h-5 mr-2 animate-spin" /> Initializing FFmpeg Engine...</div>;
      case ConversionStatus.CONVERTING:
        return <div className="flex items-center text-blue-400"><CogIcon className="w-5 h-5 mr-2 animate-spin" /> Converting... {progress}%</div>;
      case ConversionStatus.DONE:
        return <div className="flex items-center text-green-400"><CheckCircleIcon className="w-5 h-5 mr-2" /> Conversion Complete!</div>;
      case ConversionStatus.ERROR:
        return <div className="flex items-center text-red-400"><XCircleIcon className="w-5 h-5 mr-2" /> Conversion Failed.</div>;
      case ConversionStatus.IDLE:
      default:
        return <div className="text-gray-400">Ready to convert.</div>;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center bg-brand-dark/50 p-4 rounded-lg border border-brand-light-gray">
        <FileVideoIcon className="w-10 h-10 text-brand-blue mr-4 flex-shrink-0" />
        <div className="text-center md:text-left">
          <p className="font-semibold text-white truncate">{file.name}</p>
          <p className="text-sm text-gray-400">{formatBytes(file.size)}</p>
        </div>
        <button onClick={onReset} className="mt-2 md:mt-0 md:ml-auto text-sm text-gray-400 hover:text-white transition-colors">
          Change File
        </button>
      </div>

      <div className="mt-6">
        <label htmlFor="bitrate" className="block text-lg font-medium text-gray-300">Target Bitrate</label>
        <div className="flex items-center mt-2 space-x-4">
          <input
            id="bitrate"
            type="range"
            min="5000"
            max="25000"
            step="500"
            value={targetBitrate}
            onChange={(e) => setTargetBitrate(Number(e.target.value))}
            className="w-full h-2 bg-brand-light-gray rounded-lg appearance-none cursor-pointer"
            disabled={status === ConversionStatus.CONVERTING}
          />
          <span className="font-mono text-lg text-cyan-300 w-28 text-center">{targetBitrate} kbps</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Netflix requires a minimum of 10,000 kbps for SDR. 12,000-15,000 is recommended.</p>
        <button onClick={() => setIsModalOpen(true)} className="text-sm text-brand-blue hover:underline mt-2">
            Need help choosing? Ask our Netflix Spec Advisor
        </button>
      </div>

      <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
        <button
          onClick={handleConvert}
          disabled={!isLoaded || status === ConversionStatus.CONVERTING}
          className="w-full md:w-auto px-8 py-3 bg-brand-blue text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 disabled:bg-brand-light-gray disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center text-lg"
        >
          {status === ConversionStatus.CONVERTING ? <CogIcon className="w-6 h-6 animate-spin mr-2" /> : null}
          {status === ConversionStatus.CONVERTING ? 'Processing...' : 'Start Conversion'}
        </button>
        {status === ConversionStatus.DONE && downloadUrl && (
            <a
                href={downloadUrl}
                download={`${file.name.split('.')[0]}_${targetBitrate}kbps.mp4`}
                className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center text-lg"
            >
                <DownloadIcon className="w-6 h-6 mr-2" />
                Download Video
            </a>
        )}
      </div>

      <div className="mt-6 bg-brand-dark/50 p-4 rounded-lg border border-brand-light-gray">
        <h3 className="font-semibold text-gray-300">Status & Logs</h3>
        <div className="mt-2">{renderStatus()}</div>
        {(status === ConversionStatus.CONVERTING || status === ConversionStatus.ERROR) && (
          <div className="mt-2 h-40 bg-black/50 p-2 rounded-md overflow-y-auto font-mono text-xs text-gray-400">
            {log.slice(-100).map((l, i) => <p key={i}>{l}</p>)}
          </div>
        )}
      </div>

      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ConversionPanel;
