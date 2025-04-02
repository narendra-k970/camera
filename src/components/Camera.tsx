import React, { useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";

interface CameraProps {
  onCapture: (blob: Blob) => void;
  darkMode: boolean;
}

const Camera: React.FC<CameraProps> = ({ onCapture, darkMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const hls = new Hls();
      hls.loadSource("http://localhost:8888/stream0/index.m3u8"); 
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      console.error("Stream not loaded!");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Canvas context not available!");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
      } else {
        console.error("Failed to capture photo!");
      }
    }, "image/jpeg");
  }, [onCapture]);

  return (
    <div className="relative p-4">
      <h2 className="text-xl font-semibold mb-2 text-center">
        Live Camera Stream
      </h2>

      <video
        ref={videoRef}
        className="w-full max-w-md h-64 rounded-lg shadow-lg border border-gray-300"
        autoPlay
        muted
        controls
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-center mt-4">
        <button
          onClick={capturePhoto}
          className={`px-4 py-2 rounded-lg transition-colors ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-black"
          }`}
          type="button"
        >
          📸 Capture Photo
        </button>
      </div>
    </div>
  );
};

export default Camera;
