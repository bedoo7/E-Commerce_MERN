import { SxProps, Theme } from "@mui/material";

/** Shared keyframes — spread onto a Box sx when using luxeFadeIn */
export const luxeKeyframes = {
	"@keyframes luxeFadeUp": {
		from: { opacity: 0, transform: "translateY(18px)" },
		to: { opacity: 1, transform: "translateY(0)" },
	},
};

export const luxeFadeIn: SxProps<Theme> = {
	...luxeKeyframes,
	animation: "luxeFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
};

export const luxeSurface: SxProps<Theme> = {
	borderRadius: 4,
	border: "1px solid",
	borderColor: (t) =>
		t.palette.mode === "dark"
			? "rgba(129, 140, 248, 0.14)"
			: "rgba(226, 232, 240, 0.95)",
	boxShadow: (t) =>
		t.palette.mode === "dark"
			? "0 16px 48px -20px rgba(0, 0, 0, 0.45)"
			: "0 16px 40px -16px rgba(15, 23, 42, 0.08)",
	bgcolor: "background.paper",
	transition:
		"box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
};

export const luxeGlassPanel: SxProps<Theme> = {
	borderRadius: 4,
	border: "1px solid",
	borderColor: (t) =>
		t.palette.mode === "dark"
			? "rgba(129, 140, 248, 0.18)"
			: "rgba(255, 255, 255, 0.25)",
	bgcolor: (t) =>
		t.palette.mode === "dark"
			? "rgba(30, 41, 59, 0.65)"
			: "rgba(255, 255, 255, 0.85)",
	backdropFilter: "blur(16px)",
};

export const luxeAuthCard: SxProps<Theme> = {
	width: "100%",
	borderRadius: 4,
	overflow: "visible",
	position: "relative",
	border: "1px solid",
	borderColor: (t) =>
		t.palette.mode === "dark"
			? "rgba(129, 140, 248, 0.12)"
			: "rgba(226, 232, 240, 0.9)",
	boxShadow: (t) =>
		t.palette.mode === "dark"
			? "0 32px 64px -16px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(129, 140, 248, 0.12)"
			: "0 32px 64px -16px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.9)",
	bgcolor: "background.paper",
	transition: "box-shadow 0.3s ease, border-color 0.3s ease",
};

export const luxeBrandIcon: SxProps<Theme> = {
	width: 56,
	height: 56,
	borderRadius: "16px",
	background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "#fff",
	boxShadow: "0 12px 32px -8px rgba(79, 70, 229, 0.55)",
};

export const luxeFormStack: SxProps<Theme> = {
	"& .MuiTextField-root .MuiOutlinedInput-root": {
		minHeight: 48,
	},
	"& .MuiFormControl-root .MuiOutlinedInput-root": {
		minHeight: 48,
	},
};

export const luxeFilterPanel: SxProps<Theme> = {
	mt: 2,
	p: { xs: 2, sm: 2.5 },
	borderRadius: 4,
	...luxeGlassPanel,
};

export const luxeStickySummary: SxProps<Theme> = {
	borderRadius: 4,
	...luxeSurface,
	position: "sticky",
	top: 88,
};

export const luxeTableContainer: SxProps<Theme> = {
	borderRadius: 4,
	overflow: "auto",
	maxHeight: { xs: "none", md: "70vh" },
	...luxeSurface,
	"& .MuiTableHead-root": {
		position: "sticky",
		top: 0,
		zIndex: 2,
	},
	"& .MuiTableHead-root .MuiTableCell-root": {
		fontWeight: 700,
		fontSize: "0.8125rem",
		letterSpacing: "0.02em",
		textTransform: "uppercase",
		color: "text.secondary",
		borderBottom: "1px solid",
		borderColor: "divider",
		bgcolor: (t: Theme) =>
			t.palette.mode === "dark"
				? "rgba(15, 23, 42, 0.95)"
				: "rgba(248, 250, 252, 0.98)",
		backdropFilter: "blur(8px)",
	},
	"& .MuiTableBody-root .MuiTableRow-root:hover": {
		bgcolor: (t: Theme) =>
			t.palette.mode === "dark"
				? "rgba(129, 140, 248, 0.06)"
				: "rgba(79, 70, 229, 0.04)",
	},
	"& .MuiTableCell-root": {
		py: 1.75,
		px: 2,
		borderColor: (t: Theme) =>
			t.palette.mode === "dark"
				? "rgba(51, 65, 85, 0.6)"
				: "rgba(226, 232, 240, 0.9)",
	},
};

export const luxeDialogPaper: SxProps<Theme> = {
	borderRadius: 4,
	border: "1px solid",
	borderColor: (t) =>
		t.palette.mode === "dark"
			? "rgba(129, 140, 248, 0.15)"
			: "rgba(226, 232, 240, 0.9)",
	boxShadow: (t) =>
		t.palette.mode === "dark"
			? "0 32px 64px -16px rgba(0, 0, 0, 0.65)"
			: "0 32px 64px -16px rgba(15, 23, 42, 0.15)",
};

export const luxeIconButton: SxProps<Theme> = {
	border: "1px solid",
	borderColor: (t) =>
		t.palette.mode === "dark"
			? "rgba(129, 140, 248, 0.2)"
			: "rgba(226, 232, 240, 0.95)",
	borderRadius: 2.5,
	transition: "all 0.2s ease",
	"&:hover": {
		borderColor: "primary.main",
		bgcolor: (t) =>
			t.palette.mode === "dark"
				? "rgba(129, 140, 248, 0.12)"
				: "rgba(79, 70, 229, 0.06)",
	},
};

export const luxeNavLinkActive = (
	active: boolean,
	mode: "light" | "dark",
): SxProps<Theme> => ({
	fontWeight: active ? 700 : 500,
	borderRadius: 2.5,
	px: 2,
	py: 0.75,
	bgcolor: active
		? mode === "light"
			? "rgba(79, 70, 229, 0.08)"
			: "rgba(129, 140, 248, 0.14)"
		: "transparent",
	border: active ? "1px solid" : "1px solid transparent",
	borderColor: active
		? mode === "light"
			? "rgba(79, 70, 229, 0.15)"
			: "rgba(129, 140, 248, 0.22)"
		: "transparent",
	transition: "all 0.2s ease",
});

export const luxePrimaryGradient =
	"linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #7c3aed 100%)";
