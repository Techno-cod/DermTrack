import skin1 from "../assets/skin1.jpg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEntries,
  uploadEntry,
  deleteEntry,
} from "../services/api";
function Dashboard() {
  const [acneScore, setAcneScore] = useState(6);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState([]);
    useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
  }
}, [navigate]);
  useEffect(() => {
  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("token");

      const data = await getEntries(token);

      setEntries(data);
    } catch (error) {
      console.error(error);
    }
  };


  fetchEntries();
}, []);
  const latestEntry = entries[0];
 
useEffect(() => {
  console.log(
    "selectedImageFile changed:",
    selectedImageFile
  );
}, [selectedImageFile]);
  return (
    <div className="min-h-screen bg-[#F7F4EE] p-8">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex justify-between items-center">

  <div>
    <p className="text-gray-500">
      Welcome back 👋
    </p>

    <h1 className="text-5xl font-bold text-[#1F2A44]">
      Your Skin Journey
    </h1>
  </div>

  <button
    onClick={() => {
      localStorage.removeItem("token");
      navigate("/login");
    }}
    className="px-5 py-3 bg-red-500 text-white rounded-xl"
  >
    Logout
  </button>

</div>

        {/* Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Latest Entry */}
          <div className="col-span-8 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Latest Skin Entry
            </h2>

            <div className="bg-[#F8F7F3] rounded-2xl p-5">
  <div className="flex gap-6">

    <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center">
      <img
  src={latestEntry?.cloudinary_url || skin1}
  alt="Skin Entry"
  className="w-full h-full object-cover rounded-xl"
/>
    </div>

    <div>
     <p className="text-sm text-gray-500">
       {latestEntry?.created_at || "No entries yet"}
     </p>

      <h3 className="text-xl font-semibold mt-2">
        Mild Acne Flare-Up
      </h3>

      <p className="text-gray-600 mt-3 max-w-sm">
        {latestEntry?.notes || "Upload your first skin entry."}
     </p>

      <div className="mt-4 inline-flex px-4 py-2 rounded-full bg-[#E7EFE5] text-[#6F8E85] font-medium">
        Acne Score: {latestEntry?.acne_score || 6}/10
      </div>
      <div className="mt-4">
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];

    setSelectedImageFile(file);

    setSelectedImage(
      URL.createObjectURL(file)
    );
  }}
/>
   
<textarea
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  placeholder="Write today's skin notes..."
  className="w-full mt-4 p-3 rounded-xl bg-[#F8F7F3] outline-none"
/>
<div className="mt-4">
  <label className="block mb-2 font-medium">
    Acne Score (1-10)
  </label>

  <input
    type="number"
    min="1"
    max="10"
    value={acneScore}
    onChange={(e) => setAcneScore(e.target.value)}
    className="w-full p-3 rounded-xl bg-[#F8F7F3] outline-none"
  />
</div>
<button
  onClick={async () => {
    try {
      const token =
  localStorage.getItem("token");

await uploadEntry(
  selectedImageFile,
  notes,
  acneScore,
  token
);

      const updatedEntries =
        await getEntries(token);

      setEntries(updatedEntries);

      setNotes("");
      setAcneScore(6);
      setSelectedImage(null);
      setSelectedImageFile(null);

    } catch (error) {
  console.error(error);

  console.log(
    error.response?.data
  );
}
  }}
  className="mt-6 px-5 py-3 bg-[#8FA58B] text-white rounded-xl hover:opacity-90"
>
  Save Entry
</button>
</div>
    </div>

  </div>
</div>
          </div>

          {/* Quick Stats */}
          <div className="col-span-4 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Current Status
            </h2>

            <div className="grid gap-3">

  <div className="bg-[#F8F7F3] rounded-xl p-4">
    <p className="text-gray-500 text-sm">
      Acne Score
    </p>

   <h3 className="text-2xl font-bold text-[#1F2A44]">
  {latestEntry?.acne_score || 6}/10
   </h3>
  </div>

  <div className="bg-[#F8F7F3] rounded-xl p-4">
    <p className="text-gray-500 text-sm">
        Total Entries
    </p>

    <h3 className="text-2xl font-bold text-[#1F2A44]">
        {entries.length}
    </h3>
  </div>

  <div className="bg-[#F8F7F3] rounded-xl p-4">
    <p className="text-gray-500 text-sm">
  Latest Entry
</p>

<h3 className="text-2xl font-bold text-[#1F2A44]">
  {latestEntry ? "Available" : "None"}
</h3>
  </div>
 

</div>
          </div>

          {/* Progress Timeline */}
          <div className="col-span-7 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Progress Timeline
            </h2>

            <div className="bg-[#F8F7F3] rounded-2xl p-6 space-y-6">

  <div className="flex items-start gap-4">
    <div className="bg-[#F8F7F3] rounded-2xl p-6 space-y-6">

  {entries.map((entry, index) => (
    <div
      key={index}
      className="flex items-start gap-4"
    >
      <div className="w-4 h-4 rounded-full bg-[#8FA58B] mt-1"></div>

      <div>
        <p className="text-sm text-gray-500">
         {new Date(entry.created_at).toLocaleDateString()}
       </p>


        <h4 className="font-semibold">
  Acne Score: {entry.acne_score}/10
</h4>

        <p className="text-gray-600 text-sm">
          {entry.notes}
        </p>
     

<button
  onClick={async () => {
    try {
      const token =
        localStorage.getItem("token");

      await deleteEntry(
        entry.id,
        token
      );

      const updatedEntries =
        await getEntries(token);

      setEntries(updatedEntries);
    } catch (error) {
      console.error(error);
    }
  }}
  className="mt-2 text-red-500 text-sm"
>
  Delete
</button>
      </div>
    </div>
  ))}

</div>
    </div>

</div>
          </div>

          {/* Routine */}
          <div className="col-span-5 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Daily Routine
            </h2>

            <div className="space-y-3">
              <div>☑ Cleanser</div>
              <div>☑ Moisturizer</div>
              <div>☐ Sunscreen</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;