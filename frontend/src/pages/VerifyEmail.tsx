import React from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
	Container,
	Box,
	Typography,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { api } from "../api/axios";
import { useState } from "react";

export const VerifyEmail: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get("token");
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("");

	const verify = async () => {
		if (!token) {
			setStatus("error");
			setMessage("No verification token provided.");
			return;
		}

		try {
			await api.post("/user/verify-email", { token });
			setStatus("success");
			setMessage("Email verified successfully! You can now log in.");
		} catch (err: any) {
			setStatus("error");
			setMessage(err.message || "Verification failed. The link may be invalid or expired.");
		}
	};

	React.useEffect(() => {
		if (token) {
			verify();
		} else {
			setStatus("error");
			setMessage("No verification token provided.");
		}
	}, [token]);

	return (
		<Container maxWidth="sm">
			<Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
				<Card sx={{ width: "100%", p: 2 }}>
					<CardContent>
						{status === "loading" && (
							<Box textAlign="center" py={4}>
								<CircularProgress />
								<Typography variant="body1" sx={{ mt: 2 }}>
									Verifying your email...
								</Typography>
							</Box>
						)}

						{status === "success" && (
							<Box textAlign="center" py={4}>
								<CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
								<Typography variant="h5" fontWeight={800} gutterBottom>
									Email Verified!
								</Typography>
								<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
									{message}
								</Typography>
								<Button
									variant="contained"
									component={Link}
									to="/login"
									sx={{
										borderRadius: 2.5,
										px: 4,
										background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
									}}
								>
									Go to Login
								</Button>
							</Box>
						)}

						{status === "error" && (
							<Box textAlign="center" py={4}>
								<ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
								<Typography variant="h5" fontWeight={800} gutterBottom>
									Verification Failed
								</Typography>
								<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
									{message}
								</Typography>
								<Button
									variant="contained"
									component={Link}
									to="/login"
									sx={{
										borderRadius: 2.5,
										px: 4,
										background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
									}}
								>
									Go to Login
								</Button>
							</Box>
						)}
					</CardContent>
				</Card>
			</Box>
		</Container>
	);
};