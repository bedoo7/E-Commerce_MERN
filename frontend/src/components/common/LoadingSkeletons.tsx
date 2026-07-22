import React from "react";
import {
	Grid,
	Card,
	CardContent,
	Skeleton,
	Box,
	TableRow,
	TableCell,
} from "@mui/material";

export const ProductSkeletonGrid: React.FC<{ count?: number }> = ({
	count = 6,
}) => {
	return (
		<Grid container spacing={3}>
			{Array.from(new Array(count)).map((_, index) => (
				<Grid item xs={12} sm={6} md={4} key={index}>
					<Card sx={{ height: "100%", borderRadius: 4 }}>
						<Skeleton variant="rectangular" height={220} animation="wave" />
						<CardContent sx={{ p: 2.5 }}>
							<Skeleton
								width="40%"
								height={20}
								animation="wave"
								sx={{ mb: 1 }}
							/>
							<Skeleton
								width="80%"
								height={28}
								animation="wave"
								sx={{ mb: 1 }}
							/>
							<Skeleton
								width="100%"
								height={40}
								animation="wave"
								sx={{ mb: 2 }}
							/>
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
							>
								<Skeleton width="30%" height={32} animation="wave" />
								<Skeleton
									width="35%"
									height={36}
									animation="wave"
									sx={{ borderRadius: 2 }}
								/>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			))}
		</Grid>
	);
};

export const TableSkeletonRows: React.FC<{ rows?: number; cols?: number }> = ({
	rows = 5,
	cols = 4,
}) => {
	return (
		<>
			{Array.from(new Array(rows)).map((_, rowIndex) => (
				<TableRow key={rowIndex}>
					{Array.from(new Array(cols)).map((_, colIndex) => (
						<TableCell key={colIndex}>
							<Skeleton variant="text" height={28} animation="wave" />
						</TableCell>
					))}
				</TableRow>
			))}
		</>
	);
};
