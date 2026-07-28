import React from "react";
import { Box, Typography, Stack } from "@mui/material";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	action?: React.ReactNode;
	overline?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	subtitle,
	action,
	overline,
}) => {
	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			alignItems={{ xs: "flex-start", sm: "center" }}
			justifyContent="space-between"
			spacing={2}
			sx={{ mb: { xs: 3, md: 4 } }}
		>
			<Box>
				{overline && (
					<Typography
						variant="overline"
						sx={{
							display: "block",
							mb: 0.75,
							fontWeight: 700,
							letterSpacing: "0.12em",
							color: "primary.main",
							fontSize: "0.68rem",
						}}
					>
						{overline}
					</Typography>
				)}
				<Typography
					variant="h4"
					component="h1"
					sx={{
						fontWeight: 800,
						letterSpacing: "-0.03em",
						fontSize: { xs: "1.65rem", sm: "2rem", md: "2.125rem" },
						mb: subtitle ? 0.75 : 0,
					}}
				>
					{title}
				</Typography>
				{subtitle && (
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ maxWidth: 520, lineHeight: 1.6 }}
					>
						{subtitle}
					</Typography>
				)}
			</Box>
			{action && <Box sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}>{action}</Box>}
		</Stack>
	);
};
