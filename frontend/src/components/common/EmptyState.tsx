import React from "react";
import { Box, Typography, Button } from "@mui/material";
import SearchOff from "@mui/icons-material/SearchOff";
import { luxeFadeIn, luxeSurface } from "../../theme/luxeStyles";

interface EmptyStateProps {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	actionText?: string;
	onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon = (
		<SearchOff sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />
	),
	title,
	description,
	actionText,
	onAction,
}) => {
	return (
		<Box
			sx={{
				...luxeFadeIn,
				...luxeSurface,
				p: { xs: 4, sm: 6 },
				textAlign: "center",
				my: 4,
				borderStyle: "dashed",
			} as any}
		>
			<Box
				mb={2.5}
				display="flex"
				justifyContent="center"
				sx={{
					"& svg": {
						filter: (t) =>
							t.palette.mode === "dark"
								? "drop-shadow(0 8px 24px rgba(129, 140, 248, 0.25))"
								: "none",
					},
				}}
			>
				{icon}
			</Box>
			<Typography
				variant="h6"
				fontWeight={800}
				gutterBottom
				letterSpacing="-0.02em"
			>
				{title}
			</Typography>
			{description && (
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ maxWidth: 450, mx: "auto", mb: 3, lineHeight: 1.65 }}
				>
					{description}
				</Typography>
			)}
			{actionText && onAction && (
				<Button
					variant="contained"
					color="primary"
					onClick={onAction}
					sx={{
						borderRadius: 2.5,
						px: 3,
						py: 1.25,
						background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
					}}
				>
					{actionText}
				</Button>
			)}
		</Box>
	);
};
