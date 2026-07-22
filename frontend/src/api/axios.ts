import axios from "axios";

const API_URL = "http://localhost:3001";

export const api = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor to handle common errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status;
		const message =
			error.response?.data?.message || "An unexpected error occurred";

		if (status === 401) {
			// Unauthorized - clear token and redirect if not on login/register
			localStorage.removeItem("token");
			if (
				!window.location.pathname.includes("/login") &&
				!window.location.pathname.includes("/register")
			) {
				window.location.href = "/login";
			}
		} else if (status === 403) {
			console.error(
				"Forbidden: You do not have permission to perform this action.",
			);
		} else if (status === 500) {
			console.error("Internal Server Error: Please try again later.");
		}

		return Promise.reject(new Error(message));
	},
);
