"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const floatingIcons = [
  { emoji: "🧠", top: "10%", left: "20%", delay: "0s" },
  { emoji: "🔍", top: "25%", left: "75%", delay: "1s" },
  { emoji: "🖼️", top: "60%", left: "15%", delay: "2s" },
  { emoji: "📄", top: "75%", left: "60%", delay: "3s" },
  { emoji: "💬", top: "40%", left: "45%", delay: "4s" },
  { emoji: "📊", top: "15%", left: "50%", delay: "5s" },
  { emoji: "👁️", top: "30%", left: "10%", delay: "3s" },
  { emoji: "📷", top: "80%", left: "80%", delay: "3s" },
  { emoji: "🍽️", top: "10%", left: "90%", delay: "3s" },
  { emoji: "🛍️", top: "30%", left: "25%", delay: "3s" },
  { emoji: "🤖", top: "80%", left: "15%", delay: "3s" },
   { emoji: "🖼️", top: "90%", left: "35%", delay: "2s" },
   { emoji: "👁️", top: "50%", left: "90%", delay: "3s" },
];

export default function Login() {
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome', 'login', 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        }),
      });

      if (response.ok) {
        // Switch to login tab after successful signup
        setActiveTab('login');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setError('Account created successfully! Please login.');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        window.location.href = '/home/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

// ...existing code...

  const renderWelcomeScreen = () => (
    <>
      <div className="flex justify-center mb-4">
        <Image
          src="/logo.png"
          alt="SnapInsight Logo"
          width={72}
          height={72}
          className="rounded-lg"
        />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-2 mt-2"
          style={{ color: 'var(--color-primary)' }}>
          <strong className="font-bold">SnapInsight</strong>
        </h2>
        <p className="mt-0.5 text-base sm:text-lg"
          style={{ color: 'var(--color-primary-hover)' }}>
          Visual intelligence at your fingertips.
        </p>
      </div>

      <div className="space-y-6">
        {/* Login and Sign Up buttons side by side */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setActiveTab('login')}
            className="flex-1 max-w-[140px] bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            Login
          </button>
          
          <button
            onClick={() => setActiveTab('signup')}
            className="flex-1 max-w-[140px] border border-blue-600 text-blue-600 py-3 px-4 rounded-md hover:bg-blue-50 transition duration-200 font-medium"
          >
            Sign Up
          </button>
        </div>
        
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        
        <Link
          href="/home/dashboard"
          className="block text-center text-gray-600 font-medium hover:underline transition duration-150"
        >
          Continue as Guest
        </Link>
      </div>
    </>
  );

// ...existing code...

  const renderLoginForm = () => (
    <>
      <div className="flex items-center mb-8">
        <button
          onClick={() => setActiveTab('welcome')}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 -ml-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-3xl font-bold mx-auto bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-6 shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200"
            placeholder="Enter your email"
            style={{ color: '#111111' }}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200"
            placeholder="Enter your password"
            style={{ color: '#111111' }}
          />
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className="max-w-[200px] w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => setActiveTab('signup')}
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
          >
            Create one here
          </button>
        </p>
      </div>
    </>
  );

  const renderSignupForm = () => (
    <>
      <div className="flex items-center mb-8">
        <button
          onClick={() => setActiveTab('welcome')}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 -ml-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-3xl font-bold mx-auto bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create Account
        </h2>
      </div>

      {error && (
        <div className={`border-l-4 px-4 py-3 rounded-r-lg mb-6 shadow-sm ${
          error.includes('successfully') 
            ? 'bg-green-50 border-green-500 text-green-700'
            : 'bg-red-50 border-red-500 text-red-700'
        }`}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              {error.includes('successfully') ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200"
            placeholder="Enter your full name"
            style={{ color: '#111111' }}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200"
            placeholder="Enter your email"
            style={{ color: '#111111' }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200"
              placeholder="Create password"
              style={{ color: '#111111' }}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200"
              placeholder="Confirm password"
              style={{ color: '#111111' }}
            />
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className="max-w-[200px] w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => setActiveTab('login')}
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
          >
            Sign in here
          </button>
        </p>
      </div>
    </>
  );

// ...existing code...
  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-50 to-cyan-50 px-4 overflow-hidden">
      {floatingIcons.map((icon, index) => (
        <span
          key={index}
          className="absolute text-3xl sm:text-4xl opacity-50 animate-float"
          style={{
            top: icon.top,
            left: icon.left,
            animationDelay: icon.delay,
          }}
        >
          {icon.emoji}
        </span>
      ))}

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-10 z-10 relative gap-6 animate-float">
        {activeTab === 'welcome' && renderWelcomeScreen()}
        {activeTab === 'login' && renderLoginForm()}
        {activeTab === 'signup' && renderSignupForm()}

        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>

      
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
