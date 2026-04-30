import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/scooters";


export const getScooters = () => {
    return axios.get(API_URL);
};


export const getScooterById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};


export const createScooter = (scooterData) => {
    return axios.post(API_URL, scooterData);
};


export const updateScooter = (id, scooterData) => {
    return axios.put(`${API_URL}/${id}`, scooterData);
};


export const deleteScooter = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

const scooterService = {
    getScooters,
    getScooterById,
    createScooter,
    updateScooter,
    deleteScooter
};

export default scooterService;