import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
	CircularProgress,
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
			<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
				<WarningAmberIcon color="warning" />
				{title}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>{message}</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ p: 2, pt: 0 }}>
				<Button onClick={onCancel} color="inherit" disabled={isLoading}>
					{cancelText}
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="error"
					disabled={isLoading}
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
