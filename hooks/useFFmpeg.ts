import { useState, useRef, useEffect } from 'react';

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
  const ffmpegRef = useRef<any | null>(null);

  const load = async () => {
    // This function should only be called after confirming window.FFmpeg exists
    if (!ffmpegRef.current) {
        const { FFmpeg } = (window as any).FFmpeg;
        ffmpegRef.current = new FFmpeg();
    }
    const ffmpeg = ffmpegRef.current;
    
    if (ffmpeg.loaded) {
        setIsLoaded(true);
        return;
    }

    const baseURL = `https://aistudiocdn.com/@ffmpeg/core-mt@${FFMPEG_CORE_VERSION}/dist/esm`;
    
    ffmpeg.on('log', ({ message }: { message: string }) => {
        setLog((prev) => [...prev, message]);
    });
    
    ffmpeg.on('progress', ({ progress }: { progress: number }) => {
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
  
  useEffect(() => {
    // This effect ensures we wait for the FFmpeg script to be loaded on the window object
    // before we attempt to initialize it, preventing a race condition.
    const checkForFFmpeg = () => {
      if ((window as any).FFmpeg) {
        load();
      } else {
        setTimeout(checkForFFmpeg, 100);
      }
    };
    checkForFFmpeg();
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