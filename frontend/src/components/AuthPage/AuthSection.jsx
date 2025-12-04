import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// A simple SVG logo component as a placeholder. Replace with your actual logo.
const Logo = () => (
  <svg
    className="h-8 w-auto text-black"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {" "}
    <path
      d="M13.5 31.5L24 18L34.5 31.5"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {" "}
    <path
      d="M13.5 18L24 31.5L34.5 18"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {" "}
  </svg>
);

// Note: The 'onLogin' prop is now unused for redirection but is kept for compatibility.
export default function AuthSection({ onLogin }) {
  // 2. INITIALIZE NAVIGATE HOOK
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false); // State for form inputs
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for UI feedback

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE_URL = "http://localhost:8000/api"; // Make sure this URL matches your Django backend server

  const toggleForm = () => {
    setIsSignUp(!isSignUp); // Reset form states on toggle
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        if (!email.endsWith("@gmail.com")) {
          setError("Only Gmail accounts are allowed for registration.");
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords don't match.");
          setIsLoading(false);
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
          username: username,
          email: email,
          password: password,
        });
        setSuccess("Registration successful! Redirecting you to sign in...");
        setTimeout(() => {
          toggleForm();
        }, 500);
        console.log("User registered:", response.data);
      } else {
        const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
          username: username,
          password: password,
        }); // Handle successful login

        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("user_id", response.data.userId);
        localStorage.setItem("is_admin", response.data.isAdmin);
        // 👇 CRITICAL ADDITION: Store username for the Navbar
        localStorage.setItem("username", response.data.username);
        setSuccess("Login successful! Redirecting...");
        // 3. IMPLEMENT CONDITIONAL REDIRECTION USING useNavigate
        setTimeout(() => {
          // Optional: call the prop function in case the parent needs a notification
          if (onLogin) onLogin(response.data.isAdmin);

          if (response.data.isAdmin) {
            navigate("/admin"); // Redirects to /admin for admin users
          } else {
            navigate("/"); // Redirects to / for regular users
          }
        }, 500);

        console.log("User logged in:", response.data);
      }
    } catch (err) {
      // CRITICAL FIX: Clear success state if an error occurs
      setSuccess(""); // Handle different types of errors from the backend

      if (err.response && err.response.data) {
        // Concatenate all error messages from the backend
        const errorMessages = Object.values(err.response.data).flat().join(" ");
        setError(errorMessages);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of the component JSX)
  return (
    <div className="bg-white font-sans text-gray-900 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* ... rest of the JSX remains the same */}
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-start">
            <Logo />
          </div>
          <h2 className="mt-6 text-2xl md:text-3xl font-bold text-gray-900">
            {isSignUp ? "BECOME A MEMBER" : "YOUR ACCOUNT FOR NEXUS"}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {isSignUp && (
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder={isSignUp ? "Gmail address" : "Username or Email"}
              value={isSignUp ? email : username}
              onChange={(e) =>
                isSignUp
                  ? setEmail(e.target.value)
                  : setUsername(e.target.value)
              }
              autoComplete={isSignUp ? "email" : "username"}
              required
              className="w-full p-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              className="w-full p-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-xs text-gray-600"
                >
                  I agree to the Terms & Conditions
                </label>
              </div>
            </>
          )}

          {!isSignUp && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-gray-700"
                >
                  Keep me signed in
                </label>
              </div>
              <a
                href="#"
                className="font-medium text-gray-600 hover:text-black"
              >
                Forgot password?
              </a>
            </div>
          )}

          <div className="text-center text-xs text-gray-500 leading-relaxed">
            By continuing, I agree to Nexus's{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Terms of Use
            </a>
            .
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}
          {success && <div className="text-sm text-green-500">{success}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 rounded-md font-bold transition-colors duration-300 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isLoading
                ? "Loading..."
                : isSignUp
                ? "CREATE ACCOUNT"
                : "SIGN IN"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          {isSignUp ? "Already a member?" : "Not a member?"}
          <button
            onClick={toggleForm}
            className="font-bold underline ml-1 focus:outline-none"
          >
            {isSignUp ? "Sign In." : "Join Us."}
          </button>
        </p>
      </div>
    </div>
  );
}
