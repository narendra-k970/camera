import React, { useState } from "react";
import axios from "axios";
import Camera from "./Camera";

interface EmployeeFormProps {
  darkMode: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    photo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://13.233.68.233:8000/register_user", formData);
      alert("Employee registered successfully!");
      setFormData({ name: "", department: "", photo: "" });
    } catch (error) {
      console.error("Error registering employee:", error);
      alert("Failed to register employee");
    }
  };

  const handleCapture = (imageSrc: string) => {
    setFormData((prev) => ({ ...prev, photo: imageSrc }));
  };

  return (
    <div
      className={`max-w-md mx-auto p-6 ${
        darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100"
      } rounded-xl shadow-lg transition-colors duration-200`}
    >
      <h2
        className={`text-2xl font-bold mb-6 ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        Employee Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className={`block text-sm font-medium ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Employee Name
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
            Department
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, department: e.target.value }))
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
          <Camera onCapture={handleCapture} darkMode={darkMode} />
          {formData.photo && (
            <img
              src={formData.photo}
              alt="Captured"
              className="mt-4 w-full rounded-lg"
            />
          )}
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Register Employee
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;
