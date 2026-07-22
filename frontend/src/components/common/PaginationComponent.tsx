import React from "react";
import {
	Box,
	Pagination,
	Typography,
	MenuItem,
	Select,
	SelectChangeEvent,
} from "@mui/material";
import { IPagination } from "../../types";

interface PaginationComponentProps {
	pagination: IPagination;
	onPageChange: (page: number) => void;
	onLimitChange?: (limit: number) => void;
}

export const PaginationComponent: React.FC<PaginationComponentProps> = ({
	pagination,
	onPageChange,
	onLimitChange,
}) => {
	const { page, limit, totalItems, totalPages } = pagination;

	const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
	const endItem = Math.min(page * limit, totalItems);

	const handlePageChange = (
		_event: React.ChangeEvent<unknown>,
		value: number,
	) => {
		onPageChange(value);
	};

	const handleLimitChange = (event: SelectChangeEvent<number>) => {
		if (onLimitChange) {
			onLimitChange(Number(event.target.value));
		}
	};

	if (totalItems === 0) return null;

	return (
		<Box
			display="flex"
			flexDirection={{ xs: "column", sm: "row" }}
			justifyContent="space-between"
			alignItems="center"
			gap={2}
			mt={4}
			pt={3}
			borderTop="1px solid"
			borderColor="divider"
		>
			<Typography variant="body2" color="text.secondary" fontWeight={500}>
				Showing{" "}
				<Box component="span" color="text.primary" fontWeight={700}>
					{startItem}
				</Box>{" "}
				to{" "}
				<Box component="span" color="text.primary" fontWeight={700}>
					{endItem}
				</Box>{" "}
				of{" "}
				<Box component="span" color="text.primary" fontWeight={700}>
					{totalItems}
				</Box>{" "}
				items
			</Typography>

			<Box
				display="flex"
				alignItems="center"
				gap={2}
				flexWrap="wrap"
				justifyContent="center"
			>
				{onLimitChange && (
					<Box display="flex" alignItems="center" gap={1}>
						<Typography
							variant="caption"
							color="text.secondary"
							fontWeight={600}
						>
							Per page:
						</Typography>
						<Select
							value={limit}
							onChange={handleLimitChange}
							size="small"
							sx={{
								height: 36,
								fontSize: "0.875rem",
								borderRadius: 2,
								"& .MuiOutlinedInput-input": { py: 0.5, px: 1.5 },
							}}
						>
							<MenuItem value={6}>6</MenuItem>
							<MenuItem value={12}>12</MenuItem>
							<MenuItem value={24}>24</MenuItem>
							<MenuItem value={48}>48</MenuItem>
						</Select>
					</Box>
				)}

				<Pagination
					count={totalPages}
					page={page}
					onChange={handlePageChange}
					color="primary"
					shape="rounded"
					size="medium"
					showFirstButton
					showLastButton
				/>
			</Box>
		</Box>
	);
};
