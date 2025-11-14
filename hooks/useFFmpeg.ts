import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const FFMPEG_CORE_VERSION = "0.12.6";

const toBlobURL = async (url: string, mimeType: string): Promise<string> => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return URL.createObjectURL(new Blob([buffer], { type: mimeType }));
};

export const useFFmpeg = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const ffmpegRef = useRef<FFmpeg | null>(new FFmpeg());

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) return;

    if (ffmpeg.loaded) {
        setIsLoaded(true);
        return;
    }

    const baseURL = `https://aistudiocdn.com/@ffmpeg/core-mt@${FFMPEG_CORE_VERSION}/dist/esm`;
    
    ffmpeg.on('log', ({ message }) => {
        setLog((prev) => [...prev, message]);
    });
    
    ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
    });

    try {
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        });
        setIsLoaded(true);
    } catch (error) {
        console.error("Failed to load ffmpeg.wasm", error);
        setIsLoaded(false);
    }
  };
  
  // Eslint disable is needed here as we only want to run this once.
  // We are managing the ffmpeg instance in a ref, so we don't need to re-run this effect.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const convertToMp4 = async (file: File, targetBitrate: number): Promise<string | null> => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg || !isLoaded) {
      alert("FFmpeg is not loaded.");
      return null;
    }
    
    setProgress(0);
    setLog([]);

    const inputFileName = 'input.mov'; // Use a generic name
    const outputFileName = `output_${Date.now()}.mp4`;

    try {
      await ffmpeg.writeFile(inputFileName, new Uint8Array(await file.arrayBuffer()));
      
      const command = [
        '-i', inputFileName,
        '-c:v', 'libx264',
        '-profile:v', 'high',
        '-level', '4.2',
        '-b:v', `${targetBitrate}k`,
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        outputFileName
      ];

      await ffmpeg.exec(command);
      
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error during ffmpeg conversion:", error);
      setLog(prev => [...prev, 'Error during conversion. Check console for details.']);
      return null;
    }
  };

  return { isLoaded, progress, log, convertToMp4, load };
};