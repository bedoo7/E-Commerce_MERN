import React from "react";
import { Container, Typography, Box } from "@mui/material";

export const Privacy: React.FC = () => {
	return (
		<Container maxWidth="md" sx={{ py: 8 }}>
			<Typography variant="h4" gutterBottom fontWeight={800}>
				Privacy Policy
			</Typography>
			<Box sx={{ mt: 2 }}>
				<Typography variant="body1" paragraph>
					Last updated: July 2026
				</Typography>
				<Typography variant="body1" paragraph>
					Luxe Store is committed to protecting your privacy. This policy explains
					how we collect, use, and safeguard your personal information when you use
					our website and services.
				</Typography>
				<Typography variant="body1" paragraph>
					We collect personal information such as name, email address, and password
					to provide and improve our services. Your data is stored securely and is
					never shared with third parties without your consent.
				</Typography>
				<Typography variant="body1" paragraph>
					You have the right to access, update, or delete your personal data at any
					time by contacting us at support@luxestore.com.
				</Typography>
			</Box>
		</Container>
	);
};