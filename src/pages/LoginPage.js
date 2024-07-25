import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';

function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const doLogin = async (email, password) => {
    console.log('Logging in with:', email, password); 
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('Content-Type');
      
      if (response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Login response:', data);
          if (data.userId) {
            navigate('/join');
          } else {
            setMessage(data.message || 'Login failed. Please check your email and password.');
          }
        } else {
          setMessage('Unexpected response format');
        }
      } else {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setMessage(`Login failed: ${data.message || 'Unknown error'}`);
        } else {
          const errorText = await response.text();
          setMessage(`Unexpected response format: ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Login failed. Please try again later.');
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (loginEmail && loginPassword) {
      doLogin(loginEmail, loginPassword);
    } else {
      setMessage('Both email and password are required.');
    }
  };

  return (
    <div className="container">
      <div id="loginDiv">
        <form onSubmit={handleLogin}>
          <span id="inner-title">PLEASE LOGIN</span>
          <br />
          <input
            type="email"
            id="loginEmail"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
          <br />
          <input
            type="password"
            id="loginPassword"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          <br />
          <input
            type="submit"
            id="loginButton"
            className="buttons"
            value="Submit"
          />
        </form>
        {message && <span id="loginResult">{message}</span>}
        <div>
          <span>
            If you don't have an account,{' '}
            <a href="/register" id="signupLink">
              Register
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
