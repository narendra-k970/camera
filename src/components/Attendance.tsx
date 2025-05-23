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

const Attendance: React.FC<AttendanceProps> = ({ darkMode }) => {
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

  // Load HLS Stream into Video Element
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const hls = new Hls({
        liveDurationInfinity: true,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource("http://localhost:8888/stream0/index.m3u8");
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

      // Capture Frame from HLS Stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const detection = await faceapi.detectSingleFace(
        canvas,
        new faceapi.TinyFaceDetectorOptions()
      );
      console.log("Detection:", detection);

      if (detection) {
        setIsProcessing(true);
        try {
          console.log("Inside Detection...");
          const imageSrc = canvas.toDataURL("image/jpeg");
          if (!imageSrc) return;

          const blob = await fetch(imageSrc).then((res) => res.blob());
          const formData = new FormData();
          formData.append("file", blob, "face.jpg");
          formData.append("Type", "Entry");

          const response = await axios.post(
            "http://13.233.68.233:8000/entry_match",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          console.log("Response:", response.data);

          if (response.data) {
            const match = response.data;
            console.log(match);
            if (match.status === "entry_exists") {
              toast.warning("Entry already exists. Please exit first.", {
                position: "top-right",
              });
              setTimeout(() => setIsProcessing(false), 1000);
              return;
            }
            if (match.status === "unknown") {
              toast.error("User not registered. Please register first.", {
                position: "top-right",
              });
              setTimeout(() => setIsProcessing(false), 1000);
              return;
            }

            if (match.matches[0]?.status === "Blocked") {
              toast.error(
                `Dear ${match.matches[0].name}, Your access is blocked.`,
                {
                  position: "top-right",
                }
              );
              setTimeout(() => setIsProcessing(false), 1000);
              return;
            }

            if (match.status === "ok") {
              if (match.matches[0].user_type === "Visitor") {
                toast.success(
                  `Welcome ${match.matches[0].name}! Visitor Entry`,
                  {
                    position: "top-right",
                  }
                );
              } if (match.matches[0].user_type === "Employee") {
                toast.success(
                  `Welcome ${match.matches[0].name}! Employee Entry`,
                  {
                    position: "top-right",
                  }
                )
              } else {
               toast.error("Error recognizing face. Please try again.", {
            position: "top-right",
          });
              }
              setTimeout(() => setIsProcessing(false), 1000);
              return;
            }
          } else {
            // No match or unrecognized person
            toast.error("User not registered. Please register first.", {
              position: "top-right",
            });
            setTimeout(() => setIsProcessing(false), 1000);
            return;
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error("Error recognizing face. Please try again.", {
            position: "top-right",
          });
        }
        setIsProcessing(false);
      }
    };

    if (modelsLoaded && recognitionActive) {
      intervalId = window.setInterval(detectFaceAndRecognize, 1000); // Check every 1s
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
        Smart Attendance
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

      {/* Hidden canvas for capturing frames */}
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

export default Attendance;
