import React, { useState } from 'react';
import axios from 'axios';
import Camera from './Camera';

interface VisitorFormProps {
  darkMode: boolean;
}

const VisitorForm: React.FC<VisitorFormProps> = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    photo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('YOUR_PYTHON_BACKEND_URL/register/visitor', formData);
      alert('Visitor registered successfully!');
      setFormData({ name: '', purpose: '', photo: '' });
    } catch (error) {
      console.error('Error registering visitor:', error);
      alert('Failed to register visitor');
    }
  };

  const handleCapture = (imageSrc: string) => {
    setFormData(prev => ({ ...prev, photo: imageSrc }));
  };

  return (
    <div className={`max-w-md mx-auto p-6 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100'} rounded-xl shadow-lg transition-colors duration-200`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Visitor Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Visitor Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Purpose</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Photo</label>
          <Camera onCapture={handleCapture} darkMode={darkMode} />
          {formData.photo && (
            <img src={formData.photo} alt="Captured" className="mt-4 w-full rounded-lg" />
          )}
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Register Visitor
        </button>
      </form>
    </div>
  );
};

export default VisitorForm;