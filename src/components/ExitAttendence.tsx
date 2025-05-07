import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PlayCircle, StopCircle } from "lucide-react";
import Hls from "hls.js";

interface AttendanceProps {
  darkMode: boolean;
}

const ExitAttendance: React.FC<AttendanceProps> = ({ darkMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // Load HLS Stream
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const hls = new Hls({
        liveDurationInfinity: true,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource("http://localhost:8888/stream1/index.m3u8");
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });
    }
  }, []);

  useEffect(() => {
    let intervalId: number;

    const detectFaceAndRecognize = async () => {
      if (
        !videoRef.current ||
        !modelsLoaded ||
        isProcessing ||
        !recognitionActive
      )
        return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const detection = await faceapi.detectSingleFace(
        canvas,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detection) {
        setIsProcessing(true);
        try {
          const imageSrc = canvas.toDataURL("image/jpeg");
          const blob = await fetch(imageSrc).then((res) => res.blob());
          const formData = new FormData();
          formData.append("file", blob, "face.jpg");
          formData.append("Type", "Exit");

          const response = await axios.post(
            "http://13.233.68.233:8000/exit_match",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          const match = response.data;

          if (match.status === "entry_not_found") {
            toast.warning("No active entry found. Please enter first.", {
              position: "top-right",
            });
          } else if (match.status === "unknown") {
            toast.error("User not recognized. Please register first.", {
              position: "top-right",
            });
          } else if (match.matches[0]?.status === "Blocked") {
            toast.error(`Dear ${match.matches[0].name}, your access is blocked.`, {
              position: "top-right",
            });
          } else if (match.status === "ok") {
            if (match.matches[0].user_type === "Visitor") {
              toast.success(`Goodbye ${match.matches[0].name}! Visitor exit recorded.`, {
                position: "top-right",
              });
            } else {
              toast.success(`Goodbye ${match.matches[0].name}! Exit recorded.`, {
                position: "top-right",
              });
            }
          } else {
            toast.error("Face detected, but no valid match found.", {
              position: "top-right",
            });
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error("Error recognizing face. Please try again.", {
            position: "top-right",
          });
        }
        setTimeout(() => setIsProcessing(false), 1000);
      }
    };

    if (modelsLoaded && recognitionActive) {
      intervalId = window.setInterval(detectFaceAndRecognize, 1000);
    }

    return () => clearInterval(intervalId);
  }, [modelsLoaded, isProcessing, recognitionActive]);

  return (
    <div
      className={`max-w-md mx-auto my-5 p-6 ${
        darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100"
      } rounded-xl shadow-lg`}
    >
      <h2
        className={`text-2xl font-bold mb-6 ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        Smart Exit
      </h2>
      <div className="relative">
        <video
          ref={videoRef}
          className={`w-full rounded-lg shadow-lg ${
            !recognitionActive ? "grayscale opacity-50" : ""
          }`}
          muted
          autoPlay
          controls
        />
        {!modelsLoaded && (
          <p
            className={`mt-4 text-center ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Loading face detection models...
          </p>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={() => setRecognitionActive(true)}
          className={`p-2 rounded-full shadow-md transition-all ${
            recognitionActive
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          disabled={recognitionActive}
        >
          <PlayCircle size={32} />
        </button>
        <button
          onClick={() => setRecognitionActive(false)}
          className={`p-2 rounded-full shadow-md transition-all ${
            !recognitionActive
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
          disabled={!recognitionActive}
        >
          <StopCircle size={32} />
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ExitAttendance;
