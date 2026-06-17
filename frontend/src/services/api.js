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

export const deleteEntry = async (
  id,
  token
) => {
  const response = await API.delete(
    `/entries/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
export const rescoreEntry = async (id, token) => {
  const response = await API.post(
    `/entries/${id}/rescore`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
export const saveJournalLog = async (logData, token) => {
  const response = await API.post("/journal", logData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getJournalLogs = async (token) => {
  const response = await API.get("/journal", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.logs;
};

export const getTodayLog = async (token) => {
  const response = await API.get("/journal/today", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.log;
};
export const getInsights = async (token) => {
  const response = await API.get("/insights", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};