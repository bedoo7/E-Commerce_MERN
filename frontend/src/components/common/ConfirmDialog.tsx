import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
	CircularProgress,
	Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	open,
	title,
	message,
	confirmText = "Delete",
	cancelText = "Cancel",
	onConfirm,
	onCancel,
	isLoading = false,
}) => {
	return (
		<Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						bgcolor: "warning.main",
						color: "warning.contrastText",
						opacity: 0.95,
					}}
				>
					<WarningAmberIcon fontSize="small" />
				</Box>
				<Box component="span" fontWeight={800} letterSpacing="-0.02em">
					{title}
				</Box>
			</DialogTitle>
			<DialogContent>
				<DialogContentText sx={{ lineHeight: 1.65, color: "text.secondary" }}>
					{message}
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
				<Button
					onClick={onCancel}
					color="inherit"
					disabled={isLoading}
					sx={{ borderRadius: 2.5, px: 2.5 }}
				>
					{cancelText}
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="error"
					disabled={isLoading}
					sx={{ borderRadius: 2.5, px: 2.5 }}
					startIcon={
						isLoading ? <CircularProgress size={16} color="inherit" /> : null
					}
				>
					{isLoading ? "Deleting..." : confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
