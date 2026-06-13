import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

export const uploadEntry = async (
  image,
  notes,
  acneScore,
  token
) => {
  const formData = new FormData();

  formData.append("photo", image);
  formData.append("notes", notes);
  formData.append("acneScore", acneScore);

  const response = await API.post(
  "/entries/upload",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  }
);

  return response.data;
};

export const getEntries = async (token) => {
  const response = await API.get(
    "/entries",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.entries;
};