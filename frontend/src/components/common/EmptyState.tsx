import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import SearchOff from "@mui/icons-material/SearchOff";

interface EmptyStateProps {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	actionText?: string;
	onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon = (
		<SearchOff sx={{ fontSize: 64, color: "text.secondary", opacity: 0.6 }} />
	),
	title,
	description,
	actionText,
	onAction,
}) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 6,
				textAlign: "center",
				borderRadius: 4,
				bgcolor: "background.paper",
				border: "1px dashed",
				borderColor: "divider",
				my: 4,
			}}
		>
			<Box mb={2} display="flex" justifyContent="center">
				{icon}
			</Box>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				{title}
			</Typography>
			{description && (
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ maxWidth: 450, mx: "auto", mb: 3 }}
				>
					{description}
				</Typography>
			)}
			{actionText && onAction && (
				<Button
					variant="contained"
					color="primary"
					onClick={onAction}
					sx={{ borderRadius: 2 }}
				>
					{actionText}
				</Button>
			)}
		</Paper>
	);
};
