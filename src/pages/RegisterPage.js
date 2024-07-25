import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Register.css';

function RegisterPage() {
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault(); 

    try {
      const response = await fetch('https://lighthearted-moxie-82edfd.netlify.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword
        })
      });

      // Log the response status and headers for debugging
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);

      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON, but got:', text);
        setMessage('Unexpected response format. Please try again.');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        // Registration successful
        console.log('Registration successful:', data);
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000); // Redirect after a short delay
      } else {
        console.error('Registration error:', data.error);
        setMessage(data.error || 'Registration failed. Please try again.'); // Display error message
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage('An unexpected error occurred. Please try again later.'); // Display generic error message
    }
  };

  return (
    <div className="container">
      <div id="registerDiv">
        <h2 id="inner-title">REGISTER</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            id="registerUsername"
            placeholder="Username"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            required
          /><br />
          <input
            type="email"
            id="registerEmail"
            placeholder="Email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            required
          /><br />
          <input
            type="password"
            id="registerPassword"
            placeholder="Password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
          /><br />
          <button
            type="submit"
            id="registerButton"
            className="buttons"
          >
            Register
          </button>
        </form>
        {message && <span id="registerResult">{message}</span>}
        <div>
          <span>If you already have an account, <a href="/login">Login</a></span>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
