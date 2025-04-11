import React, { useState } from "react";
import axios from "axios";
import Camera from "./Camera";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RegistrationProps {
  darkMode: boolean;
}

type UserType = "Employee" | "Visitor";

const Registration: React.FC<RegistrationProps> = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState<UserType>("Employee");
  const [formData, setFormData] = useState({
    name: "",
    val2: "", // Department for Employee, Purpose for Visitor
    photo: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photo) {
      // alert('Please capture a photo');
      toast.error("Please capture a photo", { position: "top-right" });
      return;
    }

    const params = {
      user_type: activeTab,
      name: formData.name,
      val2: formData.val2,
    };
    const data = new FormData();
    data.append("file", formData.photo);

    try {
      const response = await axios.post(
        "http://52.66.236.1:8000/register_user",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: params, // Pass the params here
          // Add timeout and validate SSL certificate
          timeout: 10000,
          validateStatus: (status) => status >= 200 && status < 300,
        }
      );
      console.log("Response:", response.data);
      if (response.data) {
        // alert(`${activeTab} registered successfully!`);
        toast.success(`${activeTab} registered successfully!`, {
          position: "top-right",
        });
        setFormData({ name: "", val2: "", photo: null });
      }
    } catch (error) {
      console.error("Error registering:", error);
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          // alert('Connection timed out. Please try again.');
          toast.error("Connection timed out. Please try again.", {
            position: "top-right",
          });
        } else if (!error.response) {
          // alert('Network error. Please check your connection and try again.');
          toast.error(
            "Network error. Please check your connection and try again.",
            { position: "top-right" }
          );
        } else {
          // alert(`Registration failed: ${error.response.data?.message || 'Unknown error'}`);
          toast.error(
            `Registration failed: ${
              error.response.data?.message || "Unknown error"
            }`,
            { position: "top-right" }
          );
        }
      } else {
        // alert('An unexpected error occurred. Please try again.');
        toast.error("An unexpected error occurred. Please try again.", {
          position: "top-right",
        });
      }
    }
  };

  const handleCapture = (blob: Blob) => {
    const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  return (
    <div
      className={`max-w-md mx-auto p-6 ${
        darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100"
      } rounded-xl shadow-lg transition-colors duration-200`}
    >
      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab("Employee")}
          className={`flex-1 py-2 px-4 text-center transition-colors ${
            activeTab === "Employee"
              ? darkMode
                ? "bg-green-600 text-white"
                : "bg-green-600 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-200 text-gray-700"
          } ${activeTab === "Employee" ? "rounded-l-lg" : "rounded-l-lg"}`}
        >
          Employee
        </button>
        <button
          onClick={() => setActiveTab("Visitor")}
          className={`flex-1 py-2 px-4 text-center transition-colors ${
            activeTab === "Visitor"
              ? darkMode
                ? "bg-green-600 text-white"
                : "bg-green-600 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-200 text-gray-700"
          } ${activeTab === "Visitor" ? "rounded-r-lg" : "rounded-r-lg"}`}
        >
          Visitor
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className={`block text-sm font-medium ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {activeTab} Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-sm font-medium ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {activeTab === "Employee" ? "Department" : "Purpose"}
          </label>
          <input
            type="text"
            value={formData.val2}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, val2: e.target.value }))
            }
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Photo
          </label>
          <div className="flex items-center space-x-4">
            <Camera onCapture={handleCapture} darkMode={darkMode} />
            {formData.photo && (
              <img
                src={URL.createObjectURL(formData.photo)}
                alt="Captured"
                className="w-32 h-32 rounded-lg object-cover"
              />
            )}
          </div>
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Register {activeTab}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Registration;
