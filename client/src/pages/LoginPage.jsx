import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const navigate = useNavigate();

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/student-login', { admissionNo, name: studentName });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        // Decode JWT to get role
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        if (payload.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
        <div className="flex justify-center mb-6 gap-4">
          <button
            className={`px-4 py-2 rounded-full font-bold transition ${isStudent ? 'bg-brand-primary text-white' : 'bg-brand-light text-brand-primary'}`}
            onClick={() => setIsStudent(true)}
          >
            Student Login
          </button>
          <button
            className={`px-4 py-2 rounded-full font-bold transition ${!isStudent ? 'bg-brand-primary text-white' : 'bg-brand-light text-brand-primary'}`}
            onClick={() => setIsStudent(false)}
          >
            Admin Login
          </button>
        </div>
        {isStudent ? (
          <form onSubmit={handleStudentLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Admission Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={admissionNo}
                onChange={e => setAdmissionNo(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
            <button
              type="submit"
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-brand-secondary hover:text-brand-primary transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
            <button
              type="submit"
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-brand-secondary hover:text-brand-primary transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
};

export default LoginPage; 