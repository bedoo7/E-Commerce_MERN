import React from "react";
import {
	Box,
	TextField,
	IconButton,
	Chip,
	Collapse,
	Grid,
	MenuItem,
	InputAdornment,
	FormControl,
	InputLabel,
	Select,
	SelectChangeEvent,
	Typography,
	Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { luxeGlassPanel, luxeIconButton, luxeFilterPanel } from "../../theme/luxeStyles";

export interface FilterOption {
	value: string;
	label: string;
}

export interface FilterConfig {
	key: string;
	label: string;
	type: "select" | "date" | "text";
	options?: FilterOption[];
	value: string;
	onChange: (value: string) => void;
	fullWidth?: boolean;
}

export interface SortConfig {
	value: string;
	order: "asc" | "desc";
	onChange: (field: string) => void;
	onOrderChange: (order: "asc" | "desc") => void;
	options: { value: string; label: string }[];
}

export interface AdminFilterToolbarProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	filters: FilterConfig[];
	sort: SortConfig;
	onClearAll: () => void;
	hasActiveFilters: boolean;
	activeFilterChips?: { label: string; onClear: () => void }[];
}

export const AdminFilterToolbar: React.FC<AdminFilterToolbarProps> = ({
	searchValue,
	onSearchChange,
	filters,
	sort,
	onClearAll,
	hasActiveFilters,
	activeFilterChips = [],
}) => {
	const [showFilters, setShowFilters] = React.useState(false);

	return (
		<Box sx={{ mb: 3 }}>
			<Paper
				elevation={0}
				sx={{
					...luxeGlassPanel,
					p: { xs: 1.5, sm: 2 },
					borderRadius: 3,
				}}
			>
			<Box
				display="flex"
				flexDirection={{ xs: "column", sm: "row" }}
				alignItems="center"
				gap={2}
			>
					<TextField
						fullWidth
						placeholder="Search..."
						value={searchValue}
						onChange={(e) => onSearchChange(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
						size="small"
						sx={{
							"& .MuiOutlinedInput-root": {
								bgcolor: "background.paper",
								minHeight: 44,
							},
						}}
					/>
					<Box
						display="flex"
						alignItems="center"
						gap={1}
						sx={{ flexShrink: 0 }}
					>
						<IconButton
							onClick={() => setShowFilters(!showFilters)}
							color={showFilters ? "primary" : "default"}
							size="small"
							sx={{
								...luxeIconButton,
								...(showFilters
									? {
											borderColor: "primary.main",
											bgcolor: (t: any) =>
												t.palette.mode === "dark"
													? "rgba(129, 140, 248, 0.12)"
													: "rgba(79, 70, 229, 0.08)",
										}
									: {}),
							}}
						>
							<FilterListIcon />
						</IconButton>
						{hasActiveFilters && (
							<IconButton
								onClick={onClearAll}
								color="error"
								size="small"
								sx={luxeIconButton}
							>
								<CloseIcon />
							</IconButton>
						)}
					</Box>
				</Box>

				<Collapse in={showFilters}>
					<Box sx={luxeFilterPanel}>
						<Grid container spacing={2}>
							{filters.map((filter) => (
								<Grid
									item
									xs={12}
									sm={filter.fullWidth ? 12 : 6}
									md={filter.fullWidth ? 12 : 4}
									key={filter.key}
								>
								{filter.type === "select" ? (
									<FormControl fullWidth size="small">
										<InputLabel>{filter.label}</InputLabel>
										<Select
											value={filter.value}
											label={filter.label}
											onChange={(e: SelectChangeEvent<string>) =>
												filter.onChange(e.target.value)
											}
										>
											{filter.options?.map((opt) => (
												<MenuItem key={opt.value} value={opt.value}>
													{opt.label}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								) : filter.type === "date" ? (
									<TextField
										fullWidth
										type="date"
										label={filter.label}
										value={filter.value}
										onChange={(e) => filter.onChange(e.target.value)}
										size="small"
										InputLabelProps={{ shrink: true }}
									/>
								) : (
									<TextField
										fullWidth
										label={filter.label}
										value={filter.value}
										onChange={(e) => filter.onChange(e.target.value)}
										size="small"
										type="text"
									/>
								)}
								</Grid>
							))}
							<Grid item xs={12} sm={6} md={4}>
								<FormControl fullWidth size="small">
									<InputLabel>Sort By</InputLabel>
									<Select
										value={sort.value}
										label="Sort By"
										onChange={(e: SelectChangeEvent<string>) =>
											sort.onChange(e.target.value)
										}
									>
										{sort.options.map((opt) => (
											<MenuItem key={opt.value} value={opt.value}>
												{opt.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} sm={6} md={4}>
								<FormControl fullWidth size="small">
									<InputLabel>Order</InputLabel>
									<Select
										value={sort.order}
										label="Order"
										onChange={(e: SelectChangeEvent<string>) =>
											sort.onOrderChange(e.target.value as "asc" | "desc")
										}
									>
										<MenuItem value="desc">Descending</MenuItem>
										<MenuItem value="asc">Ascending</MenuItem>
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Box>
				</Collapse>
			</Paper>

			{hasActiveFilters && activeFilterChips.length > 0 && (
				<Box display="flex" flexWrap="wrap" gap={1} mt={2}>
					{activeFilterChips.map((chip, index) => (
						<Chip
							key={index}
							label={chip.label}
							onDelete={chip.onClear}
							size="small"
							sx={{
								bgcolor: "rgba(79, 70, 229, 0.08)",
								border: "1px solid",
								borderColor: "primary.main",
								color: "primary.main",
								fontWeight: 600,
								"& .MuiChip-deleteIcon": {
									color: "primary.main",
								},
							}}
						/>
					))}
					<Chip
						label="Clear All"
						onDelete={onClearAll}
						size="small"
						sx={{
							bgcolor: "rgba(239, 68, 68, 0.08)",
							border: "1px solid",
							borderColor: "error.main",
							color: "error.main",
							fontWeight: 600,
							"& .MuiChip-deleteIcon": {
								color: "error.main",
							},
						}}
					/>
				</Box>
			)}
		</Box>
	);
};
