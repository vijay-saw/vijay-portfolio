import axios from "axios";

//const API_BASE = "http://localhost:8000/api";
//const API_BASE = import.meta.env.VITE_API_URL;
export const API_BASE = import.meta.env.VITE_API_URL;

export const getProfile = () => axios.get(`${API_BASE}/profile/`);
export const getProjects = () => axios.get(`${API_BASE}/projects/`);
export const sendContact = (data) => axios.post(`${API_BASE}/contact/`, data);
export const getSkills = () => axios.get(`${API_BASE}/skills/`);
export const getExperience = () =>
  axios.get(`${API_BASE}/experience/`);
export const getCertifications = () => axios.get(`${API_BASE}/certifications/`);
export const getWhyHireMe = () => axios.get(`${API_BASE}/whyhireme/`);
