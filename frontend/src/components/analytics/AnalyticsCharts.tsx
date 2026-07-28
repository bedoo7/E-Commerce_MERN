import React from "react";
import { useTheme } from "@mui/material";
import { Box, Typography, Paper } from "@mui/material";
import { luxeSurface } from "../../theme/luxeStyles";

type ChartType = "line" | "bar" | "pie" | "donut";

interface ChartDataItem {
	label: string;
	value?: number;
	revenue?: number;
	orders?: number;
	color?: string;
}

interface AnalyticsChartsProps {
	data: ChartDataItem[];
	title?: string;
	type: ChartType;
	color?: string;
	height?: number;
}

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a78bfa", "#c4b5fd", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#4338ca", "#3730a3"];

const getVal = (d: ChartDataItem) => d.value ?? d.revenue ?? d.orders ?? 0;

const useThemeColors = () => {
	const theme = useTheme();
	return {
		textPrimary: theme.palette.text.primary,
		textSecondary: theme.palette.text.secondary,
	};
};

const LineChart: React.FC<{ data: ChartDataItem[]; color: string; height: number; title?: string }> = ({ data, color, height, title }) => {
	const { textSecondary, textPrimary } = useThemeColors();
	if (!data || data.length === 0) {
		return (
			<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
				<Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
				<Typography color="text.secondary" variant="body2">No data available</Typography>
			</Paper>
		);
	}
	const values = data.map(getVal);
	const maxVal = Math.max(...values, 1);
	const minVal = Math.min(...values, 0);
	const range = maxVal - minVal || 1;
	const w = 600;
	const pad = { top: 20, right: 20, bottom: 40, left: 60 };
	const cW = w - pad.left - pad.right;
	const cH = height - pad.top - pad.bottom;
	const pts = data.map((d, i) => ({ x: pad.left + (i / Math.max(data.length - 1, 1)) * cW, y: pad.top + cH - ((getVal(d) - minVal) / range) * cH, label: d.label, value: getVal(d) }));
	const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
	const areaD = `${pathD} L ${pts[pts.length - 1].x} ${pad.top + cH} L ${pts[0].x} ${pad.top + cH} Z`;
	return (
		<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
			{title && <Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>}
			<Box sx={{ overflowX: "auto" }}>
				<svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ maxWidth: "100%" }}>
					<defs><linearGradient id={`lg-${title}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3} /><stop offset="100%" stopColor={color} stopOpacity={0.02} /></linearGradient></defs>
					{[0, 0.25, 0.5, 0.75, 1].map((r, i) => <line key={i} x1={pad.left} y1={pad.top + cH * (1 - r)} x2={w - pad.right} y2={pad.top + cH * (1 - r)} stroke="rgba(129,140,248,0.1)" strokeWidth={1} />)}
					{[0, 0.25, 0.5, 0.75, 1].map((r, i) => <text key={i} x={pad.left - 8} y={pad.top + cH * (1 - r) + 4} textAnchor="end" fill={textSecondary} fontSize={10}>{Math.round(minVal + range * (1 - r))}</text>)}
					<path d={areaD} fill={`url(#lg-${title})`} />
					<path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
					{pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke="background.paper" strokeWidth={2} />)}
					{pts.map((p, i) => { if (i % Math.ceil(data.length / 8) !== 0 && i !== data.length - 1) return null; return <text key={i} x={p.x} y={height - 8} textAnchor="middle" fill={textSecondary} fontSize={9}>{p.label}</text>; })}
				</svg>
			</Box>
		</Paper>
	);
};

const BarChartComp: React.FC<{ data: ChartDataItem[]; color: string; height: number; title?: string }> = ({ data, color, height, title }) => {
	const { textSecondary, textPrimary } = useThemeColors();
	if (!data || data.length === 0) {
		return (
			<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
				<Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
				<Typography color="text.secondary" variant="body2">No data available</Typography>
			</Paper>
		);
	}
	const values = data.map(getVal);
	const maxVal = Math.max(...values, 1);
	const bw = Math.max(20, Math.min(60, 500 / data.length));
	const gap = 8;
	const cH = height - 60;
	return (
		<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
			{title && <Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>}
			<Box sx={{ overflowX: "auto" }}>
				<svg width={Math.max(data.length * (bw + gap) + 60, 300)} height={height} style={{ maxWidth: "100%" }}>
					{data.map((d, i) => {
						const barH = (getVal(d) / maxVal) * cH;
						const x = 40 + i * (bw + gap);
						const y = cH - barH + 10;
						return (
							<g key={i}>
								<rect x={x} y={y} width={bw} height={barH} rx={4} fill={color} opacity={0.85} />
								<text x={x + bw / 2} y={cH + 16} textAnchor="middle" fill={textSecondary} fontSize={8}>{d.label}</text>
								<text x={x + bw / 2} y={y - 4} textAnchor="middle" fill={textPrimary} fontSize={9} fontWeight={600}>{getVal(d)}</text>
							</g>
						);
					})}
				</svg>
			</Box>
		</Paper>
	);
};

const PieChartComp: React.FC<{ data: ChartDataItem[]; title?: string; size?: number }> = ({ data, title, size = 200 }) => {
	const { textPrimary } = useThemeColors();
	if (!data || data.length === 0) {
		return (
			<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
				<Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
				<Typography color="text.secondary" variant="body2">No data available</Typography>
			</Paper>
		);
	}
	const total = data.reduce((s, d) => s + getVal(d), 0);
	if (total === 0) {
		return (
			<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
				<Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
				<Typography color="text.secondary" variant="body2">No data available</Typography>
			</Paper>
		);
	}
	const cx = size / 2;
	const cy = size / 2;
	const r = size / 2 - 20;
	let angle = -Math.PI / 2;
	const slices = data.map((d, i) => {
		const a = (getVal(d) / total) * 2 * Math.PI;
		const start = angle;
		const end = angle + a;
		const x1 = cx + r * Math.cos(start);
		const y1 = cy + r * Math.sin(start);
		const x2 = cx + r * Math.cos(end);
		const y2 = cy + r * Math.sin(end);
		const large = a > Math.PI ? 1 : 0;
		angle = end;
		return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: d.color || COLORS[i % COLORS.length], label: d.label, value: getVal(d), pct: Math.round((getVal(d) / total) * 100) };
	});
	return (
		<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
			{title && <Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>}
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
				<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
					{slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="background.paper" strokeWidth={2} />)}
					<text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill={textPrimary} fontWeight={800} fontSize={14}>{total}</text>
				</svg>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
					{slices.map((s, i) => (
						<Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: s.color, flexShrink: 0 }} />
							<Typography variant="caption" color="text.secondary">{s.label} ({s.pct}%)</Typography>
						</Box>
					))}
				</Box>
			</Box>
		</Paper>
	);
};

const DonutChartComp: React.FC<{ data: ChartDataItem[]; title?: string; size?: number }> = ({ data, title, size = 200 }) => {
	const { textPrimary } = useThemeColors();
	if (!data || data.length === 0) {
		return (
			<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
				<Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
				<Typography color="text.secondary" variant="body2">No data available</Typography>
			</Paper>
		);
	}
	const total = data.reduce((s, d) => s + getVal(d), 0);
	if (total === 0) {
		return (
			<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
				<Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>
				<Typography color="text.secondary" variant="body2">No data available</Typography>
			</Paper>
		);
	}
	const cx = size / 2;
	const cy = size / 2;
	const outerR = size / 2 - 10;
	const innerR = outerR * 0.6;
	let angle = -Math.PI / 2;
	const slices = data.map((d, i) => {
		const a = (getVal(d) / total) * 2 * Math.PI;
		const start = angle;
		const end = angle + a;
		const x1o = cx + outerR * Math.cos(start);
		const y1o = cy + outerR * Math.sin(start);
		const x2o = cx + outerR * Math.cos(end);
		const y2o = cy + outerR * Math.sin(end);
		const x1i = cx + innerR * Math.cos(end);
		const y1i = cy + innerR * Math.sin(end);
		const x2i = cx + innerR * Math.cos(start);
		const y2i = cy + innerR * Math.sin(start);
		const large = a > Math.PI ? 1 : 0;
		angle = end;
		return { path: `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${large} 0 ${x2i} ${y2i} Z`, color: d.color || COLORS[i % COLORS.length], label: d.label, value: getVal(d), pct: Math.round((getVal(d) / total) * 100) };
	});
	return (
		<Paper elevation={0} sx={{ ...luxeSurface, p: 3 }}>
			{title && <Typography variant="subtitle1" fontWeight={700} mb={2}>{title}</Typography>}
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
				<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
					{slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="background.paper" strokeWidth={2} />)}
					<text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill={textPrimary} fontWeight={800} fontSize={14}>{total}</text>
				</svg>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
					{slices.map((s, i) => (
						<Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: s.color, flexShrink: 0 }} />
							<Typography variant="caption" color="text.secondary">{s.label} ({s.pct}%)</Typography>
						</Box>
					))}
				</Box>
			</Box>
		</Paper>
	);
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data, title, type, color = "#4f46e5", height = 200 }) => {
	switch (type) {
		case "line":
			return <LineChart data={data} color={color} height={height} title={title} />;
		case "bar":
			return <BarChartComp data={data} color={color} height={height} title={title} />;
		case "pie":
			return <PieChartComp data={data} title={title} />;
		case "donut":
			return <DonutChartComp data={data} title={title} />;
		default:
			return null;
	}
};