import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserCheck, Moon, Sun } from 'lucide-react';
import Registration from './components/Registration';
import Attendance from './components/Attendance';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
        <nav className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
              <Link
                  to="/"
                  className={`flex items-center px-3 py-2 ${darkMode ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  <UserCheck className="w-5 h-5 mr-2" />
                  Attendance
                </Link>
                <Link
                  to="/register"
                  className={`flex items-center px-3 py-2 ${darkMode ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}
                >
                  Registration
                </Link>  
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'text-yellow-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/register" element={<Registration darkMode={darkMode} />} />
            <Route path="/" element={<Attendance darkMode={darkMode} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;