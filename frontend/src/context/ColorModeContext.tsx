import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

interface ColorModeContextType {
	toggleColorMode: () => void;
	mode: "light" | "dark";
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(
	undefined,
);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [mode, setMode] = useState<"light" | "dark">(() => {
		const savedMode = localStorage.getItem("themeMode");
		return (savedMode as "light" | "dark") || "light";
	});

	useEffect(() => {
		localStorage.setItem("themeMode", mode);
	}, [mode]);

	const toggleColorMode = () => {
		setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
	};

	const theme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode,
					primary: {
						main: mode === "light" ? "#4f46e5" : "#818cf8",
						light: "#6366f1",
						dark: "#3730a3",
						contrastText: "#ffffff",
					},
					secondary: {
						main: mode === "light" ? "#ec4899" : "#f472b6",
						light: "#f472b6",
						dark: "#be185d",
					},
					background: {
						default: mode === "light" ? "#f8fafc" : "#0f172a",
						paper: mode === "light" ? "#ffffff" : "#1e293b",
					},
					text: {
						primary: mode === "light" ? "#0f172a" : "#f8fafc",
						secondary: mode === "light" ? "#64748b" : "#94a3b8",
					},
				},
				shape: {
					borderRadius: 14,
				},
				typography: {
					fontFamily: [
						"Plus Jakarta Sans",
						"Inter",
						"-apple-system",
						"BlinkMacSystemFont",
						'"Segoe UI"',
						"Roboto",
						"sans-serif",
					].join(","),
					h1: { fontWeight: 800, letterSpacing: "-0.025em" },
					h2: { fontWeight: 800, letterSpacing: "-0.025em" },
					h3: { fontWeight: 700, letterSpacing: "-0.02em" },
					h4: { fontWeight: 700, letterSpacing: "-0.02em" },
					h5: { fontWeight: 600, letterSpacing: "-0.01em" },
					h6: { fontWeight: 600 },
					subtitle1: { fontWeight: 500 },
					button: { fontWeight: 600, textTransform: "none" },
				},
				components: {
					MuiButton: {
						styleOverrides: {
							root: {
								borderRadius: 10,
								fontWeight: 600,
								padding: "8px 20px",
								transition: "all 0.2s ease-in-out",
								boxShadow: "none",
								"&:hover": {
									boxShadow: mode === "light"
										? "0 8px 20px -2px rgba(79, 70, 229, 0.3)"
										: "0 8px 20px -2px rgba(129, 140, 248, 0.3)",
									transform: "translateY(-1px)",
								},
							},
						},
					},
					MuiCard: {
						styleOverrides: {
							root: {
								borderRadius: 16,
								border: mode === "light"
									? "1px solid rgba(226, 232, 240, 0.8)"
									: "1px solid rgba(51, 65, 85, 0.8)",
								boxShadow:
									mode === "light"
										? "0px 4px 20px -2px rgba(15, 23, 42, 0.05)"
										: "0px 4px 20px -2px rgba(0, 0, 0, 0.3)",
								transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
							},
						},
					},
					MuiPaper: {
						styleOverrides: {
							root: {
								backgroundImage: "none",
							},
						},
					},
					MuiTextField: {
						styleOverrides: {
							root: {
								"& .MuiOutlinedInput-root": {
									borderRadius: 10,
								},
							},
						},
					},
					MuiChip: {
						styleOverrides: {
							root: {
								fontWeight: 600,
								borderRadius: 8,
							},
						},
					},
				},
			}),
		[mode],
	);

	return (
		<ColorModeContext.Provider value={{ toggleColorMode, mode }}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
};

export const useColorMode = () => {
	const context = useContext(ColorModeContext);
	if (context === undefined) {
		throw new Error("useColorMode must be used within a ColorModeProvider");
	}
	return context;
};
