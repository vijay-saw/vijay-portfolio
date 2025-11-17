import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
export default API_BASE;

export const getProfile = () => axios.get(`${API_BASE}/profile/`);
export const getProjects = () => axios.get(`${API_BASE}/projects/`);
export const sendContact = (data) => axios.post(`${API_BASE}/contact/`, data);

