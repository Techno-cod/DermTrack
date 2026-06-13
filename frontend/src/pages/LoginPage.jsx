import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import womanArt from "../assets/woman.png";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F4EE] via-[#F4F2EC] to-[#EEF3ED] flex items-start justify-center px-6">
      <div className="max-w-7xl w-full grid md:grid-cols-2 gap-24 items-center">

        {/* Left Section */}
  
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
    left-8
    top-40
    w-[450px]
    opacity-10
    mix-blend-multiply
    pointer-events-none
    select-none
  "
/>

  {/* Content */}
  <div className="relative z-10">
    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-sm text-gray-600 mb-8">
      ✦ Personal Skin Journal
    </div>

    <h1 className="text-8xl font-bold text-[#1F2A44] leading-none mb-6">
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
        <div className="mt-16 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.10)] p-7 max-w-[380px] w-full">
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
            <p className="text-sm text-center text-gray-500 mt-4">
  New here? <span className="text-[#6F8E85] font-medium">Create account</span>
</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;