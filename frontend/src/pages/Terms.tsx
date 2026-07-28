import React from "react";
import { Container, Typography, Box } from "@mui/material";

export const Terms: React.FC = () => {
	return (
		<Container maxWidth="md" sx={{ py: 8 }}>
			<Typography variant="h4" gutterBottom fontWeight={800}>
				Terms of Service
			</Typography>
			<Box sx={{ mt: 2 }}>
				<Typography variant="body1" paragraph>
					Last updated: July 2026
				</Typography>
				<Typography variant="body1" paragraph>
					These Terms of Service govern your use of the Luxe Store website and
					services. By accessing or using our platform, you agree to be bound by
					these terms. If you do not agree, please do not use our services.
				</Typography>
				<Typography variant="body1" paragraph>
					Users are responsible for maintaining the confidentiality of their account
					credentials and for all activities that occur under their account.
				</Typography>
				<Typography variant="body1" paragraph>
					Luxe Store reserves the right to modify these terms at any time. Changes
					will be effective immediately upon posting on this page.
				</Typography>
			</Box>
		</Container>
	);
};