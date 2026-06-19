import axios from "axios";

const API_URL =
  `${import.meta.env.VITE_API_URL}/auth`;

export const loginUser = async (email, password) => {
  const response = await axios.post(
    `${API_URL}/login`,
    {
      email,
      password,
    }
  );

  return response.data;
};
export const registerUser = async (
  name,
  email,
  password
) => {
  const response = await axios.post(
    `${API_URL}/register`,
    {
      name,
      email,
      password,
    }
  );

  return response.data;
};