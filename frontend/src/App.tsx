import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ColorModeProvider } from "./context/ColorModeContext";
import { AppRoutes } from "./routes/AppRoutes";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ColorModeProvider>
				<AuthProvider>
					<BrowserRouter>
						<AppRoutes />
						<Toaster position="top-right" />
					</BrowserRouter>
				</AuthProvider>
			</ColorModeProvider>
		</QueryClientProvider>
	);
}

export default App;
