import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export const getProfile = () => axios.get(`${API_BASE}/profile/`);
export const getProjects = () => axios.get(`${API_BASE}/projects/`);
export const sendContact = (data) => axios.post(`${API_BASE}/contact/`, data);

