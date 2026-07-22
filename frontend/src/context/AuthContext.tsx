import React, { createContext, useContext, useState, useEffect } from "react";
import { IUser, LoginResponse } from "../types";
import { api } from "../api/axios";
import toast from "react-hot-toast";

interface AuthContextType {
	user: IUser | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (data: LoginResponse) => void;
	logout: () => void;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<IUser | null>(null);
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("token"),
	);
	const [isLoading, setIsLoading] = useState(true);

	const refreshUser = async () => {
		const currentToken = localStorage.getItem("token");
		if (!currentToken) {
			setUser(null);
			setToken(null);
			setIsLoading(false);
			return;
		}

		try {
			const response = await api.get<IUser>("/user/getmebytoken");
			setUser(response.data);
			setToken(currentToken);
		} catch (error) {
			console.error("Failed to fetch user profile", error);
			localStorage.removeItem("token");
			setUser(null);
			setToken(null);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		refreshUser();
	}, []);

	const login = (data: LoginResponse) => {
		localStorage.setItem("token", data.token);
		setToken(data.token);
		setUser(data.user);
		toast.success(data.message || "Logged in successfully!");
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setUser(null);
		toast.success("Logged out successfully!");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated: !!user,
				isLoading,
				login,
				logout,
				refreshUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
