import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export const NotFound: React.FC = () => {
	return (
		<Container maxWidth="md" sx={{ py: 8 }}>
			<Paper
				elevation={0}
				sx={{
					p: 6,
					textAlign: "center",
					borderRadius: 5,
					border: "1px solid",
					borderColor: "divider",
					background: (theme) =>
						theme.palette.mode === "light"
							? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
							: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
				}}
			>
				<ErrorOutlineIcon
					sx={{ fontSize: 80, color: "primary.main", mb: 2, opacity: 0.9 }}
				/>
				<Typography
					variant="h2"
					fontWeight={800}
					color="text.primary"
					gutterBottom
				>
					404
				</Typography>
				<Typography
					variant="h5"
					fontWeight={700}
					color="text.primary"
					gutterBottom
				>
					Page Not Found
				</Typography>
				<Typography
					variant="body1"
					color="text.secondary"
					sx={{ maxWidth: 480, mx: "auto", mb: 4 }}
				>
					The page you are looking for might have been removed, had its name
					changed, or is temporarily unavailable.
				</Typography>
				<Button
					variant="contained"
					size="large"
					component={Link}
					to="/"
					startIcon={<HomeIcon />}
					sx={{ px: 4, py: 1.2, borderRadius: 3 }}
				>
					Back to Home
				</Button>
			</Paper>
		</Container>
	);
};
