import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import womanArt from "../assets/woman.png";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDemoPassword, setShowDemoPassword] =
  useState(false);

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center px-6 overflow-hidden">
      <div className="max-w-7xl w-full grid md:grid-cols-2 gap-24 items-center">

  
        {/* Left Section */}
<div className="relative">

  {/* Decorative Illustration */}
  <div
  className="
    absolute
    left-16
    top-52
    w-72
    h-72
    rounded-full
    bg-[#A6B8A2]/20
    blur-3xl
  "
></div>

<img
  src={womanArt}
  alt="DermTrack"
  className="
    absolute
    -left-10
    top-8
    w-[550px]
    opacity-[0.06]
    pointer-events-none
    select-none
  "
/>
<div
  className="
    absolute
    left-20
    top-48
    w-[400px]
    h-[400px]
    rounded-full
    bg-white/40
    blur-3xl
  "
></div>

  {/* Content */}
  <div className="relative z-10 -translate-y-12">
    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-sm text-gray-600 mb-8">
      ✦ Personal Skin Journal
    </div>

    <h1 className="text-7xl font-bold text-[#1F2A44] leading-none mb-6">
      DermTrack
    </h1>

    <p className="text-2xl text-gray-500 max-w-sm leading-relaxed">
      Your skin journey,
      <br />
      beautifully documented.
    </p>
  </div>

</div>


        {/* Right Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.10)] p-7 max-w-[420px] w-full">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800">
            Welcome Back
          </h2>

          <div className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
               className="w-full bg-[#F8F7F3] border border-transparent rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#95A78D]"
               />

            <input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full bg-[#F8F7F3] border border-transparent rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#95A78D]"
/>
            <button
  onClick={async () => {
    try {
      const data = await loginUser(
        email,
        password
      );

      localStorage.setItem(
        "token",
        data.token
      );

      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  }}
  className="w-full bg-gradient-to-r from-[#8FA58B] to-[#6F8E85] text-white py-3 rounded-xl font-medium shadow-lg hover:opacity-90 transition"
>
  Sign In
</button>

<button
  onClick={() => {
    setEmail("demo@dermtrack.app");
    setPassword("Demo1234!");
  }}
  className="w-full mt-3 bg-[#EEF3ED] text-[#6F8E85] py-2 rounded-xl text-sm font-medium hover:opacity-90"
>
  Use Demo Account
</button>

<div className="mt-3 p-2.5 bg-[#F8F7F3] rounded-xl text-xs text-gray-600">
  <p className="font-medium mb-2">
    Demo Credentials
  </p>

  <p>Email: demo@dermtrack.app</p>

  <div className="flex items-center justify-between mt-1">
    <span>
      Password:{" "}
      {showDemoPassword
        ? "Demo1234!"
        : "•••••••"}
    </span>

    <button
      onClick={() =>
        setShowDemoPassword(
          !showDemoPassword
        )
      }
      className="text-[#6F8E85] text-xs hover:underline"
    >
      {showDemoPassword
        ? "Hide"
        : "Show"}
    </button>
  </div>
</div>
<p className="text-sm text-center text-gray-500 mt-4">
  New here?{" "}
  <Link
    to="/register"
    className="text-[#6F8E85] font-medium hover:underline"
  >
    Create Account
  </Link>
</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;