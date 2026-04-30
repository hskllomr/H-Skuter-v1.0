import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/rentals";

export const rentRental = (scooterId) => {
    const userId = 1;


    return axios.post(`${API_URL}/start/${scooterId}/${userId}`);
};

export const finishRental = (rentalId) => {
    return axios.post(`${API_URL}/finish/${rentalId}`);
};