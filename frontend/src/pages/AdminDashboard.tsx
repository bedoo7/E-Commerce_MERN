import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Box,
	Typography,
	Card,
	CardContent,
	Tabs,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	CircularProgress,
	Button,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
	IconButton,
	Tooltip,
	Grid,
	Divider,
	Alert,
	List,
	ListItem,
	ListItemText,
	LinearProgress,
	Autocomplete,
	FormControlLabel,
	Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CategoryIcon from "@mui/icons-material/Category";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from "@mui/icons-material/PieChart";
import PercentIcon from "@mui/icons-material/Percent";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import SpeedIcon from "@mui/icons-material/Speed";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { AnalyticsCharts } from "../components/analytics/AnalyticsCharts";
import { api } from "../api/axios";
import {
	IProduct,
	IUser,
	IOrder,
	IPaginatedResponse,
	IUsersResponse,
	OrderStatus,
	IAnalytics,
	ICoupon,
	IProductQuery,
	IUserQuery,
	IOrderQuery,
	ICouponQuery,
} from "../types";
import {
	ProductSkeletonGrid,
	TableSkeletonRows,
} from "../components/common/LoadingSkeletons";
import { PaginationComponent } from "../components/common/PaginationComponent";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import {
	luxeTableContainer,
	luxeDialogPaper,
	luxeSurface,
	luxeStickySummary,
} from "../theme/luxeStyles";
import { useDebounce } from "../hooks/useDebounce";
import { AdminFilterToolbar } from "../components/admin/AdminFilterToolbar";
import toast from "react-hot-toast";

const statusColors: Record<
	OrderStatus,
	"warning" | "info" | "primary" | "success" | "error"
> = {
	pending: "warning",
	processing: "info",
	shipped: "primary",
	delivered: "success",
	cancelled: "error",
};

interface TabPanelProps {
	children: React.ReactNode;
	value: number;
	index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
	<Box role="tabpanel" hidden={value !== index} sx={{ mt: 3 }}>
		{value === index && children}
	</Box>
);

export const AdminDashboard: React.FC = () => {
	const queryClient = useQueryClient();
	const [tabIndex, setTabIndex] = useState(0);
	const [productPage, setProductPage] = useState(1);
	const [orderPage, setOrderPage] = useState(1);
	const [userPage, setUserPage] = useState(1);
	const [couponPage, setCouponPage] = useState(1);
	const limit = 12;
	const productContainerRef = React.useRef<HTMLDivElement>(null);
	const orderContainerRef = React.useRef<HTMLDivElement>(null);
	const userContainerRef = React.useRef<HTMLDivElement>(null);
	const couponContainerRef = React.useRef<HTMLDivElement>(null);

	const prevProductPage = React.useRef(1);
	const prevOrderPage = React.useRef(1);
	const prevUserPage = React.useRef(1);
	const prevCouponPage = React.useRef(1);

	const scrollToProduct = React.useCallback(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				productContainerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	}, []);

	const scrollToOrder = React.useCallback(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				orderContainerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	}, []);

	const scrollToUser = React.useCallback(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				userContainerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	}, []);

	const scrollToCoupon = React.useCallback(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				couponContainerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	}, []);

	const [productSearch, setProductSearch] = useState("");
	const debouncedProductSearch = useDebounce(productSearch, 300);
	const [productCategory, setProductCategory] = useState("All");
	const [productBrand, setProductBrand] = useState("All");
	const [productStockStatus, setProductStockStatus] = useState("all");
	const [productMinPrice, setProductMinPrice] = useState("");
	const [productMaxPrice, setProductMaxPrice] = useState("");
	const [productSortBy, setProductSortBy] = useState("createdAt");
	const [productSortOrder, setProductSortOrder] = useState<"asc" | "desc">(
		"desc",
	);

	const [orderSearch, setOrderSearch] = useState("");
	const debouncedOrderSearch = useDebounce(orderSearch, 300);
	const [orderStatus, setOrderStatus] = useState("");
	const [orderMinPrice, setOrderMinPrice] = useState("");
	const [orderMaxPrice, setOrderMaxPrice] = useState("");
	const [orderStartDate, setOrderStartDate] = useState("");
	const [orderEndDate, setOrderEndDate] = useState("");
	const [orderSortBy, setOrderSortBy] = useState("createdAt");
	const [orderSortOrder, setOrderSortOrder] = useState<"asc" | "desc">("desc");

	const [userSearch, setUserSearch] = useState("");
	const debouncedUserSearch = useDebounce(userSearch, 300);
	const [userRole, setUserRole] = useState("");
	const [userIsActive, setUserIsActive] = useState("");
	const [userStartDate, setUserStartDate] = useState("");
	const [userEndDate, setUserEndDate] = useState("");
	const [userSortBy, setUserSortBy] = useState("createdAt");
	const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");

	const [couponSearch, setCouponSearch] = useState("");
	const debouncedCouponSearch = useDebounce(couponSearch, 300);
	const [couponStatus, setCouponStatus] = useState("");
	const [couponDiscountType, setCouponDiscountType] = useState("");
	const [couponMinDiscount, setCouponMinDiscount] = useState("");
	const [couponMaxDiscount, setCouponMaxDiscount] = useState("");
	const [couponStartDate, setCouponStartDate] = useState("");
	const [couponEndDate, setCouponEndDate] = useState("");
	const [couponSortBy, setCouponSortBy] = useState("createdAt");
	const [couponSortOrder, setCouponSortOrder] = useState<"asc" | "desc">(
		"desc",
	);

	// Product management state
	const [productDialogOpen, setProductDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] =
		useState<Partial<IProduct> | null>(null);
	const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
	const [productForm, setProductForm] = useState({
		name: "",
		description: "",
		price: 0,
		category: "",
		brand: "",
		stock: 0,
		imageUrl: "",
	});

	// Order management state
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
	const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [viewingOrder, setViewingOrder] = useState<IOrder | null>(null);

	// User management state
	const [userDialogOpen, setUserDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<Partial<IUser> | null>(null);
	const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
	const [userForm, setUserForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		role: "user" as "user" | "admin",
	});

	// Category and brand state
	const [optionDialogOpen, setOptionDialogOpen] = useState(false);
	const [optionDialogType, setOptionDialogType] = useState<
		"category" | "brand" | null
	>(null);
	const [optionName, setOptionName] = useState("");

	// Coupon management state
	const [couponDialogOpen, setCouponDialogOpen] = useState(false);
	const [couponForm, setCouponForm] = useState({
		code: "",
		discountType: "percentage" as "percentage" | "fixed",
		discountPercent: 10,
		discountValue: 0,
		minOrderAmount: 0,
		expiresAt: "",
		usageLimit: 0,
		isActive: true,
	});
	const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);
	const [editCouponId, setEditCouponId] = useState<string | null>(null);

	// Fetch analytics data
	const {
		data: analytics,
		isLoading: analyticsLoading,
		isError: analyticsError,
		error: analyticsErrorObj,
	} = useQuery<IAnalytics>({
		queryKey: ["admin-analytics"],
		queryFn: async () => {
			const res = await api.get<IAnalytics>("/analytics/dashboard");
			return res.data;
		},
		staleTime: 1000 * 30,
		retry: 1,
	});

	// Fetch dashboard stats
	const { data: stats } = useQuery({
		queryKey: ["admin-stats"],
		queryFn: async () => {
			const [usersRes, productsRes, ordersRes] = await Promise.all([
				api.get<IUsersResponse>("/user/getAllUsers"),
				api.get<IPaginatedResponse<IProduct>>("/product?limit=1"),
				api.get<IPaginatedResponse<IOrder>>("/order/admin/all?limit=1"),
			]);
			return {
				totalUsers: usersRes.data.count || 0,
				totalProducts: productsRes.data.pagination?.totalItems || 0,
				totalOrders: ordersRes.data.pagination?.totalItems || 0,
			};
		},
		staleTime: 1000 * 30,
	});

	// Fetch users with pagination
	const buildUserQueryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.set("page", String(userPage));
		params.set("limit", String(limit));
		if (debouncedUserSearch) params.set("search", debouncedUserSearch);
		if (userRole) params.set("role", userRole);
		if (userIsActive) params.set("isActive", userIsActive);
		if (userStartDate) params.set("startDate", userStartDate);
		if (userEndDate) params.set("endDate", userEndDate);
		if (userSortBy) {
			params.set("sortBy", userSortBy);
			params.set("sortOrder", userSortOrder);
		}
		return params.toString();
	}, [
		userPage,
		debouncedUserSearch,
		userRole,
		userIsActive,
		userStartDate,
		userEndDate,
		userSortBy,
		userSortOrder,
	]);

	const { data: usersData, isLoading: usersLoading } = useQuery<IUsersResponse>(
		{
			queryKey: [
				"admin-users",
				userPage,
				debouncedUserSearch,
				userRole,
				userIsActive,
				userStartDate,
				userEndDate,
				userSortBy,
			],
			queryFn: async () => {
				const res = await api.get<IUsersResponse>(
					`/user/getAllUsers?${buildUserQueryParams}`,
				);
				return res.data;
			},
		},
	);

	// Fetch all orders
	const buildOrderQueryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.set("page", String(orderPage));
		params.set("limit", String(limit));
		if (debouncedOrderSearch) params.set("search", debouncedOrderSearch);
		if (orderStatus) params.set("status", orderStatus);
		if (orderMinPrice) params.set("minPrice", orderMinPrice);
		if (orderMaxPrice) params.set("maxPrice", orderMaxPrice);
		if (orderStartDate) params.set("startDate", orderStartDate);
		if (orderEndDate) params.set("endDate", orderEndDate);
		if (orderSortBy) {
			params.set("sortBy", orderSortBy);
			params.set("sortOrder", orderSortOrder);
		}
		return params.toString();
	}, [
		orderPage,
		debouncedOrderSearch,
		orderStatus,
		orderMinPrice,
		orderMaxPrice,
		orderStartDate,
		orderEndDate,
		orderSortBy,
		orderSortOrder,
	]);

	const { data: ordersData, isLoading: ordersLoading } = useQuery<
		IPaginatedResponse<IOrder>
	>({
		queryKey: [
			"admin-orders",
			orderPage,
			debouncedOrderSearch,
			orderStatus,
			orderMinPrice,
			orderMaxPrice,
			orderStartDate,
			orderEndDate,
			orderSortBy,
		],
		queryFn: async () => {
			const res = await api.get<IPaginatedResponse<IOrder>>(
				`/order/admin/all?${buildOrderQueryParams}`,
			);
			return res.data;
		},
	});

	// Fetch all products
	const buildProductQueryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.set("page", String(productPage));
		params.set("limit", String(limit));
		if (debouncedProductSearch) params.set("search", debouncedProductSearch);
		if (productCategory && productCategory !== "All")
			params.set("category", productCategory);
		if (productBrand && productBrand !== "All")
			params.set("brand", productBrand);
		if (productStockStatus === "instock") params.set("inStock", "true");
		if (productStockStatus === "lowstock")
			params.set("stockStatus", "lowstock");
		if (productStockStatus === "outofstock")
			params.set("stockStatus", "outofstock");
		if (productMinPrice) params.set("minPrice", productMinPrice);
		if (productMaxPrice) params.set("maxPrice", productMaxPrice);
		if (productSortBy) {
			params.set("sortBy", productSortBy);
			params.set("sortOrder", productSortOrder);
		}
		return params.toString();
	}, [
		productPage,
		debouncedProductSearch,
		productCategory,
		productBrand,
		productStockStatus,
		productMinPrice,
		productMaxPrice,
		productSortBy,
		productSortOrder,
	]);

	const { data: productsData, isLoading: productsLoading } = useQuery<
		IPaginatedResponse<IProduct>
	>({
		queryKey: [
			"admin-products",
			productPage,
			debouncedProductSearch,
			productCategory,
			productBrand,
			productStockStatus,
			productMinPrice,
			productMaxPrice,
			productSortBy,
		],
		queryFn: async () => {
			const res = await api.get<IPaginatedResponse<IProduct>>(
				`/product?${buildProductQueryParams}`,
			);
			return res.data;
		},
	});

	// Fetch category and brand options for product dialogs
	const { data: categoryOptions = [] } = useQuery<string[]>({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.get<string[]>("/category");
			return res.data;
		},
		staleTime: 1000 * 60 * 10,
	});

	const { data: brandOptions = [] } = useQuery<string[]>({
		queryKey: ["brands"],
		queryFn: async () => {
			const res = await api.get<string[]>("/brand");
			return res.data;
		},
		staleTime: 1000 * 60 * 10,
	});

	// Fetch coupons with pagination
	const buildCouponQueryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.set("page", String(couponPage));
		params.set("limit", "10");
		if (debouncedCouponSearch) params.set("search", debouncedCouponSearch);
		if (couponStatus) params.set("status", couponStatus);
		if (couponDiscountType) params.set("discountType", couponDiscountType);
		if (couponMinDiscount) params.set("minDiscount", couponMinDiscount);
		if (couponMaxDiscount) params.set("maxDiscount", couponMaxDiscount);
		if (couponStartDate) params.set("startDate", couponStartDate);
		if (couponEndDate) params.set("endDate", couponEndDate);
		if (couponSortBy) {
			params.set("sortBy", couponSortBy);
			params.set("sortOrder", couponSortOrder);
		}
		return params.toString();
	}, [
		couponPage,
		debouncedCouponSearch,
		couponStatus,
		couponDiscountType,
		couponMinDiscount,
		couponMaxDiscount,
		couponStartDate,
		couponEndDate,
		couponSortBy,
		couponSortOrder,
	]);

	const { data: couponsData, isLoading: couponsLoading } = useQuery<
		IPaginatedResponse<ICoupon>
	>({
		queryKey: [
			"admin-coupons",
			couponPage,
			debouncedCouponSearch,
			couponStatus,
			couponDiscountType,
			couponMinDiscount,
			couponMaxDiscount,
			couponStartDate,
			couponEndDate,
			couponSortBy,
		],
		queryFn: async () => {
			const res = await api.get<IPaginatedResponse<ICoupon>>(
				`/coupon?${buildCouponQueryParams}`,
			);
			return res.data;
		},
	}); // Scroll to tab content only when page actually changes (not on initial mount)
	useEffect(() => {
		if (
			productsData?.data &&
			productsData.data.length > 0 &&
			productPage !== prevProductPage.current
		) {
			scrollToProduct();
			prevProductPage.current = productPage;
		}
	}, [productPage, productsData]);

	useEffect(() => {
		if (
			ordersData?.data &&
			ordersData.data.length > 0 &&
			orderPage !== prevOrderPage.current
		) {
			scrollToOrder();
			prevOrderPage.current = orderPage;
		}
	}, [orderPage, ordersData]);

	useEffect(() => {
		if (
			usersData?.users &&
			usersData.users.length > 0 &&
			userPage !== prevUserPage.current
		) {
			scrollToUser();
			prevUserPage.current = userPage;
		}
	}, [userPage, usersData]);

	useEffect(() => {
		if (
			couponsData?.data &&
			couponsData.data.length > 0 &&
			couponPage !== prevCouponPage.current
		) {
			scrollToCoupon();
			prevCouponPage.current = couponPage;
		}
	}, [couponPage, couponsData]);

	const coupons = couponsData?.data ?? [];
	const couponsPagination = couponsData?.pagination;

	// Create/Update product mutation
	const saveProductMutation = useMutation({
		mutationFn: async (data: Partial<IProduct>) => {
			if (editingProduct?._id) {
				const res = await api.put(`/product/${editingProduct._id}`, data);
				return res.data;
			} else {
				const res = await api.post("/product", data);
				return res.data;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-products"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success(editingProduct ? "Product updated!" : "Product created!");
			setProductDialogOpen(false);
			resetProductForm();
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to save product");
		},
	});

	// Delete product mutation
	const deleteProductMutation = useMutation({
		mutationFn: async (productId: string) => {
			await api.delete(`/product/${productId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-products"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product deleted!");
			setDeleteProductId(null);
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to delete product");
			setDeleteProductId(null);
		},
	});

	// Update order status mutation
	const updateStatusMutation = useMutation({
		mutationFn: async ({
			orderId,
			status,
		}: {
			orderId: string;
			status: string;
		}) => {
			const res = await api.put(`/order/admin/${orderId}/status`, { status });
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
			toast.success("Order status updated!");
			setStatusDialogOpen(false);
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to update status");
		},
	});

	// Save user (create/edit)
	const saveUserMutation = useMutation({
		mutationFn: async (data: {
			firstName: string;
			lastName: string;
			email: string;
			password?: string;
			role: string;
		}) => {
			if (editingUser?._id) {
				const res = await api.put(`/user/${editingUser._id}`, data);
				return res.data;
			} else {
				const res = await api.post("/user/register", data);
				return res.data;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast.success(editingUser ? "User updated!" : "User created!");
			setUserDialogOpen(false);
			resetUserForm();
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to save user");
		},
	});

	// Delete user mutation
	const deleteUserMutation = useMutation({
		mutationFn: async (userId: string) => {
			await api.delete(`/user/${userId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			toast.success("User deleted!");
			setDeleteUserId(null);
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to delete user");
			setDeleteUserId(null);
		},
	});

	// Create category / brand mutation
	const saveOptionMutation = useMutation({
		mutationFn: async (name: string) => {
			if (!optionDialogType) {
				throw new Error("Unable to determine option type");
			}
			const endpoint = optionDialogType === "category" ? "/category" : "/brand";
			const res = await api.post(endpoint, { name });
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [optionDialogType === "category" ? "categories" : "brands"],
			});
			const normalized = data?.name || optionName.trim();
			if (optionDialogType === "category") {
				setProductForm((current) => ({ ...current, category: normalized }));
			} else {
				setProductForm((current) => ({ ...current, brand: normalized }));
			}
			setOptionDialogOpen(false);
			setOptionName("");
			setOptionDialogType(null);
			toast.success(
				`${optionDialogType === "category" ? "Category" : "Brand"} created successfully!`,
			);
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to create option");
		},
	});

	// Create/delete coupon mutations
	const saveCouponMutation = useMutation({
		mutationFn: async (data: typeof couponForm) => {
			const res = await api.post("/coupon", data);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
			toast.success("Coupon created successfully!");
			setCouponDialogOpen(false);
			setCouponForm({
				code: "",
				discountType: "percentage",
				discountPercent: 10,
				discountValue: 0,
				minOrderAmount: 0,
				expiresAt: "",
				usageLimit: 0,
				isActive: true,
			});
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to create coupon");
		},
	});

	const deleteCouponMutation = useMutation({
		mutationFn: async (couponId: string) => {
			await api.delete(`/coupon/${couponId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
			toast.success("Coupon deleted!");
			setDeleteCouponId(null);
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to delete coupon");
			setDeleteCouponId(null);
		},
	});

	const updateCouponMutation = useMutation({
		mutationFn: async (data: typeof couponForm & { id: string }) => {
			const { id, ...updateData } = data;
			const res = await api.put("/coupon/" + id, updateData);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
			queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
			toast.success("Coupon updated successfully!");
			setCouponDialogOpen(false);
			setEditCouponId(null);
			setCouponForm({
				code: "",
				discountType: "percentage",
				discountPercent: 10,
				discountValue: 0,
				minOrderAmount: 0,
				expiresAt: "",
				usageLimit: 0,
				isActive: true,
			});
		},
		onError: (err: any) => {
			toast.error(err.message || "Failed to update coupon");
		},
	});

	const resetProductForm = () => {
		setProductForm({
			name: "",
			description: "",
			price: 0,
			category: "",
			brand: "",
			stock: 0,
			imageUrl: "",
		});
		setEditingProduct(null);
	};

	const resetUserForm = () => {
		setUserForm({
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			role: "user",
		});
		setEditingUser(null);
	};

	const openEditProduct = (product: IProduct) => {
		setEditingProduct(product);
		setProductForm({
			name: product.name,
			description: product.description,
			price: product.price,
			category: product.category,
			brand: product.brand,
			stock: product.stock,
			imageUrl: product.imageUrl,
		});
		setProductDialogOpen(true);
	};

	const openCreateProduct = () => {
		resetProductForm();
		setProductDialogOpen(true);
	};

	const handleSaveProduct = () => {
		if (!productForm.name || !productForm.price) {
			toast.error("Name and price are required");
			return;
		}
		saveProductMutation.mutate(productForm);
	};

	const openEditUser = (user: IUser) => {
		setEditingUser(user);
		setUserForm({
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			password: "",
			role: user.role,
		});
		setUserDialogOpen(true);
	};

	const openCreateUser = () => {
		resetUserForm();
		setUserDialogOpen(true);
	};

	const handleSaveUser = () => {
		if (!userForm.firstName || !userForm.lastName || !userForm.email) {
			toast.error("Name and email are required");
			return;
		}
		if (!editingUser && !userForm.password) {
			toast.error("Password is required for new users");
			return;
		}
		const data = editingUser
			? { ...userForm }
			: { ...userForm, password: userForm.password };
		saveUserMutation.mutate(
			userForm.password
				? { ...userForm, password: userForm.password }
				: {
						firstName: userForm.firstName,
						lastName: userForm.lastName,
						email: userForm.email,
						role: userForm.role,
					},
		);
	};

	const handleOpenStatus = (order: IOrder) => {
		setSelectedOrder(order);
		setNewStatus(order.status || "pending");
		setStatusDialogOpen(true);
	};

	const handleViewOrder = (order: IOrder) => {
		setViewingOrder(order);
		setViewDialogOpen(true);
	};

	const orders = ordersData?.data ?? [];
	const ordersPagination = ordersData?.pagination;
	const products = productsData?.data ?? [];
	const productsPagination = productsData?.pagination;
	const usersPagination = usersData?.pagination;
	const totalItems = productsData?.pagination?.totalItems || 0;

	const clearProductFilters = () => {
		setProductSearch("");
		setProductCategory("All");
		setProductBrand("All");
		setProductStockStatus("all");
		setProductMinPrice("");
		setProductMaxPrice("");
		setProductSortBy("createdAt");
		setProductPage(1);
	};

	const clearOrderFilters = () => {
		setOrderSearch("");
		setOrderStatus("");
		setOrderMinPrice("");
		setOrderMaxPrice("");
		setOrderStartDate("");
		setOrderEndDate("");
		setOrderSortBy("createdAt");
		setOrderPage(1);
	};

	const clearUserFilters = () => {
		setUserSearch("");
		setUserRole("");
		setUserIsActive("");
		setUserStartDate("");
		setUserEndDate("");
		setUserSortBy("createdAt");
		setUserPage(1);
	};

	const clearCouponFilters = () => {
		setCouponSearch("");
		setCouponStatus("");
		setCouponDiscountType("");
		setCouponMinDiscount("");
		setCouponMaxDiscount("");
		setCouponStartDate("");
		setCouponEndDate("");
		setCouponSortBy("createdAt");
		setCouponPage(1);
	};

	const productHasActiveFilters =
		productSearch !== "" ||
		productCategory !== "All" ||
		productBrand !== "All" ||
		productStockStatus !== "all" ||
		productMinPrice !== "" ||
		productMaxPrice !== "";

	const orderHasActiveFilters =
		orderSearch !== "" ||
		orderStatus !== "" ||
		orderMinPrice !== "" ||
		orderMaxPrice !== "" ||
		orderStartDate !== "" ||
		orderEndDate !== "";

	const userHasActiveFilters =
		userSearch !== "" ||
		userRole !== "" ||
		userIsActive !== "" ||
		userStartDate !== "" ||
		userEndDate !== "";

	const couponHasActiveFilters =
		couponSearch !== "" ||
		couponStatus !== "" ||
		couponDiscountType !== "" ||
		couponMinDiscount !== "" ||
		couponMaxDiscount !== "" ||
		couponStartDate !== "" ||
		couponEndDate !== "";

	return (
		<Box>
			<Typography variant="h4" fontWeight={800} gutterBottom>
				Admin Dashboard
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
				Manage products, orders, and users
			</Typography>

			{/* Analytics Loading State */}
			{analyticsLoading && (
				<Box sx={{ width: "100%", mb: 3 }}>
					<LinearProgress />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						Loading analytics...
					</Typography>
				</Box>
			)}

			{/* Analytics Error State */}
			{analyticsError && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
					Failed to load analytics:{" "}
					{(analyticsErrorObj as any)?.message || "Unknown error"}
				</Alert>
			)}

			{/* ====== ANALYTICS DASHBOARD ====== */}
			{analytics && (
				<Box mb={4}>
					<Typography variant="h5" fontWeight={700} mb={3}>
						Analytics Dashboard
					</Typography>

					{/* ── Revenue Section ── */}
					<Typography variant="h6" fontWeight={700} mb={2}>
						Revenue Overview
					</Typography>
					<Grid container spacing={3} mb={3}>
						{[
							{
								label: "Total Revenue",
								value:
									"$" +
									Number(analytics.revenue?.totalRevenue || 0).toLocaleString(),
								color: "success.main",
								isCurrency: true,
								icon: <AttachMoneyIcon sx={{ fontSize: 40 }} color="success" />,
							},
							{
								label: "Today",
								value:
									"$" +
									Number(analytics.revenue?.revenueToday || 0).toLocaleString(),
								color: "success.main",
								isCurrency: true,
								icon: <ShowChartIcon sx={{ fontSize: 40 }} color="success" />,
							},
							{
								label: "This Week",
								value:
									"$" +
									Number(
										analytics.revenue?.revenueThisWeek || 0,
									).toLocaleString(),
								color: "primary.main",
								isCurrency: true,
								icon: <TrendingUpIcon sx={{ fontSize: 40 }} color="primary" />,
							},
							{
								label: "This Month",
								value:
									"$" +
									Number(
										analytics.revenue?.revenueThisMonth || 0,
									).toLocaleString(),
								color: "info.main",
								isCurrency: true,
								icon: <AssessmentIcon sx={{ fontSize: 40 }} color="info" />,
							},
							{
								label: "This Year",
								value:
									"$" +
									Number(
										analytics.revenue?.revenueThisYear || 0,
									).toLocaleString(),
								color: "secondary.main",
								isCurrency: true,
								icon: <BarChartIcon sx={{ fontSize: 40 }} color="secondary" />,
							},
							{
								label: "Avg Order Value",
								value:
									"$" +
									Number(
										analytics.revenue?.avgOrderValue || 0,
									).toLocaleString(),
								color: "warning.main",
								isCurrency: true,
								icon: (
									<AccountBalanceWalletIcon
										sx={{ fontSize: 40 }}
										color="warning"
									/>
								),
							},
							{
								label: "Revenue Growth",
								value: (analytics.revenue?.revenueGrowth || 0) + "%",
								color:
									(analytics.revenue?.revenueGrowth || 0) >= 0
										? "success.main"
										: "error.main",
								isCurrency: false,
								icon: (
									<PercentIcon
										sx={{ fontSize: 40 }}
										color={
											(analytics.revenue?.revenueGrowth || 0) >= 0
												? "success"
												: "error"
										}
									/>
								),
							},
						].map((stat) => (
							<Grid item xs={12} sm={6} md={4} lg={3} key={stat.label}>
								<Card
									sx={{
										...luxeSurface,
										transition: "transform 0.25s ease, box-shadow 0.3s ease",
										"&:hover": { transform: "translateY(-3px)" },
									}}
								>
									<CardContent>
										<Stack direction="row" alignItems="center" spacing={2}>
											<Box
												sx={{
													width: 48,
													height: 48,
													borderRadius: 2.5,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													bgcolor: (theme) =>
														theme.palette.mode === "light"
															? stat.color.replace(".main", "") + "15"
															: stat.color.replace(".main", "") + "20",
												}}
											>
												{stat.icon}
											</Box>
											<Box>
												<Typography
													variant="overline"
													color="text.secondary"
													fontWeight={700}
													sx={{ lineHeight: 1.2 }}
												>
													{stat.label}
												</Typography>
												<Typography variant="h6" fontWeight={800}>
													{stat.value}
												</Typography>
											</Box>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
					<Grid container spacing={3} mb={4}>
						<Grid item xs={12} md={6}>
							<AnalyticsCharts
								data={(analytics.charts?.dailyRevenue || []).slice(-14)}
								title="Daily Revenue"
								type="line"
								color="#4f46e5"
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<AnalyticsCharts
								data={(analytics.charts?.monthlyRevenue || []).slice(-6)}
								title="Monthly Revenue"
								type="bar"
								color="#6366f1"
							/>
						</Grid>
					</Grid>

					{/* ── Orders Section ── */}
					<Typography variant="h6" fontWeight={700} mb={2}>
						Orders Analytics
					</Typography>
					<Grid container spacing={3} mb={3}>
						{[
							{
								label: "Total Orders",
								value: Number(
									analytics.orders?.totalOrders || 0,
								).toLocaleString(),
								color: "primary.main",
								icon: <ShoppingBagIcon sx={{ fontSize: 40 }} color="primary" />,
							},
							{
								label: "Today",
								value: Number(
									analytics.orders?.ordersToday || 0,
								).toLocaleString(),
								color: "info.main",
								icon: <SpeedIcon sx={{ fontSize: 40 }} color="info" />,
							},
							{
								label: "This Week",
								value: Number(
									analytics.orders?.ordersThisWeek || 0,
								).toLocaleString(),
								color: "primary.main",
								icon: <TrendingUpIcon sx={{ fontSize: 40 }} color="primary" />,
							},
							{
								label: "This Month",
								value: Number(
									analytics.orders?.ordersThisMonth || 0,
								).toLocaleString(),
								color: "info.main",
								icon: <AssessmentIcon sx={{ fontSize: 40 }} color="info" />,
							},
							{
								label: "Pending",
								value: Number(analytics.orders?.pending || 0).toLocaleString(),
								color: "warning.main",
								icon: (
									<WarningAmberIcon sx={{ fontSize: 40 }} color="warning" />
								),
							},
							{
								label: "Completion Rate",
								value: (analytics.orders?.completionRate || 0) + "%",
								color: "success.main",
								icon: <AutoFixHighIcon sx={{ fontSize: 40 }} color="success" />,
							},
							{
								label: "Cancellation Rate",
								value: (analytics.orders?.cancellationRate || 0) + "%",
								color: "error.main",
								icon: <PercentIcon sx={{ fontSize: 40 }} color="error" />,
							},
						].map((stat) => (
							<Grid item xs={12} sm={6} md={4} lg={3} key={stat.label}>
								<Card
									sx={{
										...luxeSurface,
										transition: "transform 0.25s ease",
										"&:hover": { transform: "translateY(-3px)" },
									}}
								>
									<CardContent>
										<Stack direction="row" alignItems="center" spacing={2}>
											<Box
												sx={{
													width: 48,
													height: 48,
													borderRadius: 2.5,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													bgcolor: (theme) =>
														theme.palette.mode === "light"
															? stat.color.replace(".main", "") + "15"
															: stat.color.replace(".main", "") + "20",
												}}
											>
												{stat.icon}
											</Box>
											<Box>
												<Typography
													variant="overline"
													color="text.secondary"
													fontWeight={700}
													sx={{ lineHeight: 1.2 }}
												>
													{stat.label}
												</Typography>
												<Typography variant="h6" fontWeight={800}>
													{stat.value}
												</Typography>
											</Box>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
					<Grid container spacing={3} mb={4}>
						<Grid item xs={12} md={6}>
							<AnalyticsCharts
								data={(analytics.charts?.ordersOverTime || []).slice(-14)}
								title="Orders Over Time"
								type="bar"
								color="#10b981"
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<AnalyticsCharts
								data={[
									{
										label: "Pending",
										value: analytics.orders?.pending || 0,
										color: "#f59e0b",
									},
									{
										label: "Processing",
										value: analytics.orders?.processing || 0,
										color: "#3b82f6",
									},
									{
										label: "Shipped",
										value: analytics.orders?.shipped || 0,
										color: "#8b5cf6",
									},
									{
										label: "Delivered",
										value: analytics.orders?.delivered || 0,
										color: "#10b981",
									},
									{
										label: "Cancelled",
										value: analytics.orders?.cancelled || 0,
										color: "#ef4444",
									},
								]}
								title="Orders by Status"
								type="donut"
							/>
						</Grid>
					</Grid>

					{/* ── Products Section ── */}
					<Typography variant="h6" fontWeight={700} mb={2}>
						Products Analytics
					</Typography>
					<Grid container spacing={3} mb={3}>
						{[
							{
								label: "Total Products",
								value: Number(
									analytics.products?.totalProducts || 0,
								).toLocaleString(),
								color: "primary.main",
							},
							{
								label: "Active",
								value: Number(
									analytics.products?.activeProducts || 0,
								).toLocaleString(),
								color: "success.main",
							},
							{
								label: "Low Stock",
								value: Number(
									analytics.products?.lowStock || 0,
								).toLocaleString(),
								color: "warning.main",
							},
							{
								label: "Out of Stock",
								value: Number(
									analytics.products?.outOfStock || 0,
								).toLocaleString(),
								color: "error.main",
							},
						].map((stat) => (
							<Grid item xs={6} md={3} key={stat.label}>
								<Card sx={{ ...luxeSurface }}>
									<CardContent>
										<Typography
											variant="overline"
											color="text.secondary"
											fontWeight={700}
										>
											{stat.label}
										</Typography>
										<Typography
											variant="h5"
											fontWeight={800}
											color={stat.color}
										>
											{stat.value}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>

					{/* Best & Worst Selling */}
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} md={6}>
							<Card sx={{ ...luxeSurface, borderRadius: 3 }}>
								<CardContent>
									<Typography variant="subtitle1" fontWeight={700} mb={2}>
										Best Selling Products
									</Typography>
									{(analytics.products?.topSelling || []).length === 0 ? (
										<Typography color="text.secondary" variant="body2">
											No sales data yet.
										</Typography>
									) : (
										<Box sx={{ maxHeight: 300, overflow: "auto" }}>
											{(analytics.products?.topSelling || []).map(
												(p: any, i: number) => (
													<Box
														key={i}
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 2,
															py: 1,
															borderBottom: "1px solid",
															borderColor: "divider",
														}}
													>
														<Typography
															variant="body2"
															fontWeight={700}
															sx={{ minWidth: 24 }}
														>
															#{i + 1}
														</Typography>
														<Box sx={{ flexGrow: 1 }}>
															<Typography variant="body2" fontWeight={600}>
																{p.name}
															</Typography>
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{Number(p.totalQuantity || 0).toLocaleString()}{" "}
																sold
															</Typography>
														</Box>
														<Typography
															variant="body2"
															fontWeight={700}
															color="primary"
														>
															${Number(p.totalRevenue || 0).toLocaleString()}
														</Typography>
													</Box>
												),
											)}
										</Box>
									)}
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} md={6}>
							{/* Never Ordered */}
							<Card sx={{ ...luxeSurface, borderRadius: 3, mb: 3 }}>
								<CardContent>
									<Typography variant="subtitle1" fontWeight={700} mb={2}>
										Never Ordered Products
									</Typography>
									{(analytics.products?.neverOrdered || []).length === 0 ? (
										<Typography color="text.secondary" variant="body2">
											All products have been ordered.
										</Typography>
									) : (
										<Box sx={{ maxHeight: 250, overflow: "auto" }}>
											{(analytics.products?.neverOrdered || []).map(
												(p: any) => (
													<Box
														key={p._id}
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 2,
															py: 1,
															borderBottom: "1px solid",
															borderColor: "divider",
														}}
													>
														<Chip
															label="Never sold"
															size="small"
															color="default"
															sx={{
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
																minHeight: 28,
																height: 28,
																fontWeight: 700,
																minWidth: 80,
															}}
														/>
														<Box sx={{ flexGrow: 1 }}>
															<Typography variant="body2" fontWeight={600}>
																{p.name}
															</Typography>
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{p.category} | Stock: {p.stock}
															</Typography>
														</Box>
													</Box>
												),
											)}
										</Box>
									)}
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					{/* ── Inventory Section ── */}
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} md={6}>
							<Card sx={{ ...luxeSurface, borderRadius: 3 }}>
								<CardContent>
									<Typography
										variant="subtitle1"
										fontWeight={700}
										mb={2}
										color="warning.main"
									>
										Low Stock Inventory
									</Typography>
									{(analytics.inventory?.lowStock || []).length === 0 ? (
										<Typography color="text.secondary" variant="body2">
											No low stock items.
										</Typography>
									) : (
										<Box sx={{ maxHeight: 250, overflow: "auto" }}>
											{(analytics.inventory?.lowStock || []).map(
												(item: any) => (
													<Box
														key={item._id}
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 2,
															py: 1,
															borderBottom: "1px solid",
															borderColor: "divider",
														}}
													>
														<Chip
															label={item.stock + " left"}
															size="small"
															color="warning"
															sx={{
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
																minHeight: 28,
																height: 28,
																fontWeight: 700,
																minWidth: 70,
															}}
														/>
														<Box sx={{ flexGrow: 1 }}>
															<Typography variant="body2" fontWeight={600}>
																{item.name}
															</Typography>
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{item.category}
															</Typography>
														</Box>
													</Box>
												),
											)}
										</Box>
									)}
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} md={6}>
							<Card sx={{ ...luxeSurface, borderRadius: 3 }}>
								<CardContent>
									<Typography
										variant="subtitle1"
										fontWeight={700}
										mb={2}
										color="error"
									>
										Out of Stock Inventory
									</Typography>
									{(analytics.inventory?.outOfStock || []).length === 0 ? (
										<Typography color="text.secondary" variant="body2">
											All products in stock.
										</Typography>
									) : (
										<Box sx={{ maxHeight: 250, overflow: "auto" }}>
											{(analytics.inventory?.outOfStock || []).map(
												(item: any) => (
													<Box
														key={item._id}
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 2,
															py: 1,
															borderBottom: "1px solid",
															borderColor: "divider",
														}}
													>
														<Chip
															label="Out of stock"
															size="small"
															color="error"
															sx={{
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
																minHeight: 28,
																height: 28,
																fontWeight: 700,
																minWidth: 80,
															}}
														/>
														<Box sx={{ flexGrow: 1 }}>
															<Typography variant="body2" fontWeight={600}>
																{item.name}
															</Typography>
															<Typography
																variant="caption"
																color="text.secondary"
															>
																{item.category}
															</Typography>
														</Box>
													</Box>
												),
											)}
										</Box>
									)}
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					{/* ── Customer Analytics ── */}
					<Typography variant="h6" fontWeight={700} mb={2}>
						Customer Analytics
					</Typography>
					<Grid container spacing={3} mb={3}>
						{[
							{
								label: "Total Users",
								value: Number(
									analytics.customers?.totalUsers || 0,
								).toLocaleString(),
								color: "info.main",
							},
							{
								label: "New Today",
								value: Number(
									analytics.customers?.newUsersToday || 0,
								).toLocaleString(),
								color: "primary.main",
							},
							{
								label: "New This Month",
								value: Number(
									analytics.customers?.newUsersThisMonth || 0,
								).toLocaleString(),
								color: "primary.main",
							},
							{
								label: "Returning",
								value: Number(
									analytics.customers?.returningCustomers || 0,
								).toLocaleString(),
								color: "success.main",
							},
						].map((stat) => (
							<Grid item xs={6} md={3} key={stat.label}>
								<Card sx={{ ...luxeSurface }}>
									<CardContent>
										<Typography
											variant="overline"
											color="text.secondary"
											fontWeight={700}
										>
											{stat.label}
										</Typography>
										<Typography
											variant="h5"
											fontWeight={800}
											color={stat.color}
										>
											{stat.value}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} md={6}>
							<Card sx={{ ...luxeSurface, borderRadius: 3 }}>
								<CardContent>
									<Typography variant="subtitle1" fontWeight={700} mb={2}>
										Highest Spending Customers
									</Typography>
									{(analytics.customers?.highestSpending || []).length === 0 ? (
										<Typography color="text.secondary" variant="body2">
											No customer data yet.
										</Typography>
									) : (
										<Box sx={{ maxHeight: 250, overflow: "auto" }}>
											{(analytics.customers?.highestSpending || []).map(
												(c: any, i: number) => (
													<Box
														key={c.userId || i}
														sx={{
															py: 1,
															borderBottom: "1px solid",
															borderColor: "divider",
														}}
													>
														<Box
															sx={{
																display: "flex",
																justifyContent: "space-between",
																alignItems: "center",
															}}
														>
															<Typography variant="body2" fontWeight={600}>
																{c.firstName} {c.lastName}
															</Typography>
															<Typography
																variant="body2"
																fontWeight={700}
																color="primary"
															>
																${Number(c.totalSpent || 0).toLocaleString()}
															</Typography>
														</Box>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															{c.email} | {c.orderCount} orders
														</Typography>
													</Box>
												),
											)}
										</Box>
									)}
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} md={6}>
							<Card sx={{ ...luxeSurface, borderRadius: 3 }}>
								<CardContent>
									<Typography variant="subtitle1" fontWeight={700} mb={2}>
										Most Active Customers
									</Typography>
									{(analytics.customers?.mostOrders || []).length === 0 ? (
										<Typography color="text.secondary" variant="body2">
											No customer data yet.
										</Typography>
									) : (
										<Box sx={{ maxHeight: 250, overflow: "auto" }}>
											{(analytics.customers?.mostOrders || []).map(
												(c: any, i: number) => (
													<Box
														key={c.userId || i}
														sx={{
															py: 1,
															borderBottom: "1px solid",
															borderColor: "divider",
														}}
													>
														<Box
															sx={{
																display: "flex",
																justifyContent: "space-between",
																alignItems: "center",
															}}
														>
															<Typography variant="body2" fontWeight={600}>
																{c.firstName} {c.lastName}
															</Typography>
															<Typography
																variant="body2"
																fontWeight={700}
																color="primary"
															>
																{c.orderCount} orders
															</Typography>
														</Box>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															{c.email} | $
															{Number(c.totalSpent || 0).toLocaleString()} spent
														</Typography>
													</Box>
												),
											)}
										</Box>
									)}
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					{/* ── Coupon Analytics ── */}
					<Typography variant="h6" fontWeight={700} mb={2}>
						Coupon Analytics
					</Typography>
					<Grid container spacing={3} mb={3}>
						{[
							{
								label: "Total Coupons",
								value: Number(
									analytics.coupons?.totalCoupons || 0,
								).toLocaleString(),
								color: "primary.main",
							},
							{
								label: "Active",
								value: Number(
									analytics.coupons?.activeCoupons || 0,
								).toLocaleString(),
								color: "success.main",
							},
							{
								label: "Expired",
								value: Number(
									analytics.coupons?.expiredCoupons || 0,
								).toLocaleString(),
								color: "error.main",
							},
							{
								label: "Total Discounts",
								value:
									"$" +
									Number(
										analytics.coupons?.totalDiscountsGiven || 0,
									).toLocaleString(),
								color: "warning.main",
							},
							{
								label: "Inactive",
								value: Number(
									analytics.coupons?.inactiveCoupons || 0,
								).toLocaleString(),
								color: "secondary.main",
							},
						].map((stat) => (
							<Grid item xs={6} md={3} key={stat.label}>
								<Card sx={{ ...luxeSurface }}>
									<CardContent>
										<Typography
											variant="overline"
											color="text.secondary"
											fontWeight={700}
										>
											{stat.label}
										</Typography>
										<Typography
											variant="h5"
											fontWeight={800}
											color={stat.color}
										>
											{stat.value}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>

					{/* ── Category Analytics ── */}
					<Typography variant="h6" fontWeight={700} mb={2}>
						Category Analytics
					</Typography>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} md={6}>
							<AnalyticsCharts
								data={(analytics.categories?.revenueByCategory || [])
									.slice(0, 8)
									.map((c) => ({
										label: c.category || "Unknown",
										value: c.revenue || 0,
									}))}
								title="Revenue by Category"
								type="bar"
								color="#8b5cf6"
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<AnalyticsCharts
								data={(analytics.categories?.revenueByCategory || [])
									.slice(0, 8)
									.map((c) => ({
										label: c.category || "Unknown",
										value: c.revenue || 0,
									}))}
								title="Revenue by Category"
								type="pie"
							/>
						</Grid>
					</Grid>

					{/* ── Business Insights ── */}
					<Typography variant="h6" fontWeight={700} mb={2}>
						Business Insights
					</Typography>
					<Grid container spacing={3} mb={3}>
						{[
							{
								label: "Best Selling Product",
								value: analytics.insights?.bestSellingProduct?.name || "N/A",
								color: "success.main",
								icon: <TrendingUpIcon sx={{ fontSize: 40 }} color="success" />,
							},
							{
								label: "Worst Selling Product",
								value: analytics.insights?.worstSellingProduct?.name || "N/A",
								color: "error.main",
								icon: <TrendingUpIcon sx={{ fontSize: 40 }} color="error" />,
							},
							{
								label: "Fastest Growing Category",
								value:
									analytics.insights?.fastestGrowingCategory?.category || "N/A",
								color: "primary.main",
								icon: <CategoryIcon sx={{ fontSize: 40 }} color="primary" />,
							},
							{
								label: "Avg Products/Order",
								value: String(analytics.insights?.avgProductsPerOrder || 0),
								color: "info.main",
								icon: <SpeedIcon sx={{ fontSize: 40 }} color="info" />,
							},
							{
								label: "Avg Revenue/Customer",
								value:
									"$" +
									Number(
										analytics.insights?.avgRevenuePerCustomer || 0,
									).toLocaleString(),
								color: "warning.main",
								icon: (
									<AccountBalanceWalletIcon
										sx={{ fontSize: 40 }}
										color="warning"
									/>
								),
							},
						].map((stat) => (
							<Grid item xs={12} sm={6} md={4} lg={3} key={stat.label}>
								<Card
									sx={{
										...luxeSurface,
										transition: "transform 0.25s ease",
										"&:hover": { transform: "translateY(-3px)" },
									}}
								>
									<CardContent>
										<Stack direction="row" alignItems="center" spacing={2}>
											<Box
												sx={{
													width: 40,
													height: 40,
													borderRadius: 2.5,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													bgcolor: (theme) =>
														theme.palette.mode === "light"
															? stat.color.replace(".main", "") + "15"
															: stat.color.replace(".main", "") + "20",
												}}
											>
												{stat.icon}
											</Box>
											<Box>
												<Typography
													variant="overline"
													color="text.secondary"
													fontWeight={700}
													sx={{ lineHeight: 1.2, fontSize: "0.65rem" }}
												>
													{stat.label}
												</Typography>
												<Typography
													variant="subtitle2"
													fontWeight={700}
													sx={{ wordBreak: "break-word" }}
												>
													{stat.value}
												</Typography>
											</Box>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>

					{/* Revenue Line Chart */}
					<Grid container spacing={3} mb={4}>
						<Grid item xs={12} md={8}>
							<AnalyticsCharts
								data={(analytics.charts?.dailyRevenue || []).slice(-14)}
								title="Daily Revenue Trend"
								type="line"
								color="#4f46e5"
							/>
						</Grid>
						<Grid item xs={12} md={4}>
							<AnalyticsCharts
								data={[
									{
										label: "Completed",
										value: analytics.orders?.delivered || 0,
										color: "#10b981",
									},
									{
										label: "Shipped",
										value: analytics.orders?.shipped || 0,
										color: "#8b5cf6",
									},
									{
										label: "Processing",
										value: analytics.orders?.processing || 0,
										color: "#3b82f6",
									},
									{
										label: "Pending",
										value: analytics.orders?.pending || 0,
										color: "#f59e0b",
									},
									{
										label: "Cancelled",
										value: analytics.orders?.cancelled || 0,
										color: "#ef4444",
									},
								]}
								title="Order Status Distribution"
								type="donut"
							/>
						</Grid>
					</Grid>
				</Box>
			)}

			{/* Dashboard Stats Cards */}
			<Grid container spacing={3} mb={4}>
				{[
					{
						icon: <PeopleIcon sx={{ fontSize: 40 }} color="primary" />,
						label: "Total Users",
						value: stats?.totalUsers ?? usersData?.count ?? 0,
						color: "primary.main",
					},
					{
						icon: <InventoryIcon sx={{ fontSize: 40 }} color="secondary" />,
						label: "Total Products",
						value: stats?.totalProducts ?? totalItems,
						color: "secondary.main",
					},
					{
						icon: <LocalShippingIcon sx={{ fontSize: 40 }} color="success" />,
						label: "Total Orders",
						value: stats?.totalOrders ?? ordersPagination?.totalItems ?? 0,
						color: "success.main",
					},
				].map((stat) => (
					<Grid item xs={12} sm={4} key={stat.label}>
						<Card
							sx={{
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								transition: "transform 0.2s, box-shadow 0.2s",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: 3,
								},
							}}
						>
							<CardContent>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Box
										sx={{
											width: 56,
											height: 56,
											borderRadius: 2.5,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											bgcolor: (theme) =>
												theme.palette.mode === "light"
													? `${stat.color}15`
													: `${stat.color}20`,
										}}
									>
										{stat.icon}
									</Box>
									<Box>
										<Typography
											variant="overline"
											color="text.secondary"
											fontWeight={700}
										>
											{stat.label}
										</Typography>
										<Typography variant="h4" fontWeight={800}>
											{stat.value.toLocaleString()}
										</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			{/* Tab Navigation */}
			<Card sx={{ borderRadius: 3, overflow: "hidden" }}>
				<Tabs
					value={tabIndex}
					onChange={(_, newValue) => setTabIndex(newValue)}
					sx={{
						px: 2,
						pt: 1,
						borderBottom: "1px solid",
						borderColor: "divider",
					}}
				>
					<Tab label="Products" />
					<Tab label="Orders" />
					<Tab label="Users" />
					<Tab label="Coupons" />
				</Tabs>

				<TabPanel value={tabIndex} index={0}>
					<Box px={3} ref={productContainerRef}>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
							mb={3}
						>
							<Typography variant="h6" fontWeight={700}>
								All Products
							</Typography>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={openCreateProduct}
							>
								Add Product
							</Button>
						</Box>

						<AdminFilterToolbar
							searchValue={productSearch}
							onSearchChange={(value) => {
								setProductSearch(value);
								setProductPage(1);
							}}
							filters={[
								{
									key: "category",
									label: "Category",
									type: "select",
									value: productCategory,
									onChange: (value) => {
										setProductCategory(value);
										setProductPage(1);
									},
									options: [
										{ value: "All", label: "All Categories" },
										...(categoryOptions || []).map((c) => ({
											value: c,
											label: c,
										})),
									],
								},
								{
									key: "brand",
									label: "Brand",
									type: "select",
									value: productBrand,
									onChange: (value) => {
										setProductBrand(value);
										setProductPage(1);
									},
									options: [
										{ value: "All", label: "All Brands" },
										...(brandOptions || []).map((b) => ({
											value: b,
											label: b,
										})),
									],
								},
								{
									key: "stock",
									label: "Stock Status",
									type: "select",
									value: productStockStatus,
									onChange: (value) => {
										setProductStockStatus(value);
										setProductPage(1);
									},
									options: [
										{ value: "all", label: "All Stock" },
										{ value: "instock", label: "In Stock" },
										{ value: "lowstock", label: "Low Stock" },
										{ value: "outofstock", label: "Out of Stock" },
									],
								},
								{
									key: "minPrice",
									label: "Min Price",
									type: "text",
									value: productMinPrice,
									onChange: (value) => {
										setProductMinPrice(value);
										setProductPage(1);
									},
								},
								{
									key: "maxPrice",
									label: "Max Price",
									type: "text",
									value: productMaxPrice,
									onChange: (value) => {
										setProductMaxPrice(value);
										setProductPage(1);
									},
								},
							]}
							sort={{
								value: productSortBy,
								order: productSortOrder as "asc" | "desc",
								onChange: setProductSortBy,
								onOrderChange: setProductSortOrder,
								options: [
									{ value: "createdAt", label: "Newest" },
									{ value: "price", label: "Price" },
									{ value: "name", label: "Name" },
								],
							}}
							onClearAll={clearProductFilters}
							hasActiveFilters={productHasActiveFilters}
							activeFilterChips={[
								...(productCategory !== "All"
									? [
											{
												label: `Category: ${productCategory}`,
												onClear: () => {
													setProductCategory("All");
													setProductPage(1);
												},
											},
										]
									: []),
								...(productBrand !== "All"
									? [
											{
												label: `Brand: ${productBrand}`,
												onClear: () => {
													setProductBrand("All");
													setProductPage(1);
												},
											},
										]
									: []),
								...(productStockStatus !== "all"
									? [
											{
												label: `Stock: ${productStockStatus}`,
												onClear: () => {
													setProductStockStatus("all");
													setProductPage(1);
												},
											},
										]
									: []),
								...(productMinPrice
									? [
											{
												label: `Min Price: $${productMinPrice}`,
												onClear: () => {
													setProductMinPrice("");
													setProductPage(1);
												},
											},
										]
									: []),
								...(productMaxPrice
									? [
											{
												label: `Max Price: $${productMaxPrice}`,
												onClear: () => {
													setProductMaxPrice("");
													setProductPage(1);
												},
											},
										]
									: []),
							]}
						/>

						{productsLoading ? (
							<ProductSkeletonGrid count={4} />
						) : (
							<>
								<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
									<Table>
										<TableHead sx={{ bgcolor: "action.hover" }}>
											<TableRow>
												<TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{products.map((product) => (
												<TableRow key={product._id} hover>
													<TableCell>
														<Box
															component="img"
															src={product.imageUrl}
															alt={product.name}
															sx={{
																width: 50,
																height: 50,
																objectFit: "contain",
																borderRadius: 2,
																bgcolor: "#fafafa",
															}}
														/>
													</TableCell>
													<TableCell>
														<Typography fontWeight={600}>
															{product.name}
														</Typography>
													</TableCell>
													<TableCell>{product.category}</TableCell>
													<TableCell>
														<Typography fontWeight={600}>
															${product.price}
														</Typography>
													</TableCell>
													<TableCell>
														<Chip
															label={product.stock}
															size="small"
															color={product.stock > 0 ? "success" : "error"}
															sx={{
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
																minHeight: 28,
																height: 28,
																fontWeight: 700,
															}}
														/>
													</TableCell>
													<TableCell>
														<Stack direction="row" spacing={1}>
															<Tooltip title="Edit">
																<IconButton
																	size="small"
																	color="primary"
																	onClick={() => openEditProduct(product)}
																>
																	<EditIcon />
																</IconButton>
															</Tooltip>
															<Tooltip title="Delete">
																<IconButton
																	size="small"
																	color="error"
																	onClick={() =>
																		setDeleteProductId(product._id)
																	}
																>
																	<DeleteIcon />
																</IconButton>
															</Tooltip>
														</Stack>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
								{productsPagination && (
									<Box mt={2} pb={2}>
										<PaginationComponent
											pagination={productsPagination}
											onPageChange={(p) => {
												setProductPage(p);
											}}
										/>
									</Box>
								)}
							</>
						)}
					</Box>
				</TabPanel>

				<TabPanel value={tabIndex} index={1}>
					<Box px={3} ref={orderContainerRef}>
						<Typography variant="h6" fontWeight={700} mb={3}>
							All Orders
						</Typography>

						<AdminFilterToolbar
							searchValue={orderSearch}
							onSearchChange={(value) => {
								setOrderSearch(value);
								setOrderPage(1);
							}}
							filters={[
								{
									key: "status",
									label: "Status",
									type: "select",
									value: orderStatus,
									onChange: (value) => {
										setOrderStatus(value);
										setOrderPage(1);
									},
									options: [
										{ value: "", label: "All Statuses" },
										{ value: "pending", label: "Pending" },
										{ value: "processing", label: "Processing" },
										{ value: "shipped", label: "Shipped" },
										{ value: "delivered", label: "Delivered" },
										{ value: "cancelled", label: "Cancelled" },
									],
								},
								{
									key: "startDate",
									label: "From Date",
									type: "date",
									value: orderStartDate,
									onChange: (value) => {
										setOrderStartDate(value);
										setOrderPage(1);
									},
								},
								{
									key: "endDate",
									label: "To Date",
									type: "date",
									value: orderEndDate,
									onChange: (value) => {
										setOrderEndDate(value);
										setOrderPage(1);
									},
								},
								{
									key: "minPrice",
									label: "Min Amount",
									type: "text",
									value: orderMinPrice,
									onChange: (value) => {
										setOrderMinPrice(value);
										setOrderPage(1);
									},
								},
								{
									key: "maxPrice",
									label: "Max Amount",
									type: "text",
									value: orderMaxPrice,
									onChange: (value) => {
										setOrderMaxPrice(value);
										setOrderPage(1);
									},
								},
							]}
							sort={{
								value: orderSortBy,
								order: orderSortOrder as "asc" | "desc",
								onChange: setOrderSortBy,
								onOrderChange: setOrderSortOrder,
								options: [
									{ value: "createdAt", label: "Newest" },
									{ value: "totalAmount", label: "Amount" },
								],
							}}
							onClearAll={clearOrderFilters}
							hasActiveFilters={orderHasActiveFilters}
							activeFilterChips={[
								...(orderStatus
									? [
											{
												label: `Status: ${orderStatus}`,
												onClear: () => {
													setOrderStatus("");
													setOrderPage(1);
												},
											},
										]
									: []),
								...(orderStartDate
									? [
											{
												label: `From: ${orderStartDate}`,
												onClear: () => {
													setOrderStartDate("");
													setOrderPage(1);
												},
											},
										]
									: []),
								...(orderEndDate
									? [
											{
												label: `To: ${orderEndDate}`,
												onClear: () => {
													setOrderEndDate("");
													setOrderPage(1);
												},
											},
										]
									: []),
								...(orderMinPrice
									? [
											{
												label: `Min: $${orderMinPrice}`,
												onClear: () => {
													setOrderMinPrice("");
													setOrderPage(1);
												},
											},
										]
									: []),
								...(orderMaxPrice
									? [
											{
												label: `Max: $${orderMaxPrice}`,
												onClear: () => {
													setOrderMaxPrice("");
													setOrderPage(1);
												},
											},
										]
									: []),
							]}
						/>

						{ordersLoading ? (
							<TableContainer component={Paper}>
								<Table>
									<TableBody>
										<TableSkeletonRows rows={5} cols={7} />
									</TableBody>
								</Table>
							</TableContainer>
						) : (
							<>
								<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
									<Table>
										<TableHead sx={{ bgcolor: "action.hover" }}>
											<TableRow>
												<TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{orders.map((order, index) => {
												const user = order.userId as IUser;
												return (
													<TableRow key={order._id} hover>
														<TableCell>
															<Typography
																variant="body2"
																fontWeight={600}
																sx={{ fontFamily: "monospace" }}
															>
																#{order.orderNumber}
															</Typography>
														</TableCell>
														<TableCell>
															{user?.firstName} {user?.lastName}
															<Typography
																variant="caption"
																display="block"
																color="text.secondary"
															>
																{user?.email}
															</Typography>
														</TableCell>
														<TableCell>{order.orderItems.length}</TableCell>
														<TableCell>
															<Typography fontWeight={700}>
																${order.totalAmount}
															</Typography>
														</TableCell>
														<TableCell>
															<Chip
																label={(
																	order.status || "pending"
																).toUpperCase()}
																color={statusColors[order.status || "pending"]}
																size="small"
																sx={{
																	whiteSpace: "nowrap",
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	minHeight: 28,
																	height: 28,
																	fontWeight: 700,
																}}
															/>
														</TableCell>
														<TableCell>
															{new Date(order.createdAt!).toLocaleDateString()}
														</TableCell>
														<TableCell>
															<Stack direction="row" spacing={1}>
																<Tooltip title="View order details">
																	<IconButton
																		size="small"
																		color="primary"
																		onClick={() => handleViewOrder(order)}
																	>
																		<VisibilityIcon fontSize="small" />
																	</IconButton>
																</Tooltip>
																<Tooltip
																	title={
																		order.status === "cancelled"
																			? "Cancelled orders cannot be modified"
																			: "Update order status"
																	}
																>
																	<span>
																		<Button
																			size="small"
																			variant="outlined"
																			onClick={() => handleOpenStatus(order)}
																			disabled={order.status === "cancelled"}
																		>
																			Update
																		</Button>
																	</span>
																</Tooltip>
															</Stack>
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</TableContainer>
								{ordersPagination && (
									<Box mt={2} pb={2}>
										<PaginationComponent
											pagination={ordersPagination}
											onPageChange={(p) => {
												setOrderPage(p);
											}}
										/>
									</Box>
								)}
							</>
						)}
					</Box>
				</TabPanel>

				<TabPanel value={tabIndex} index={2}>
					<Box px={3} ref={userContainerRef}>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
							mb={3}
						>
							<Typography variant="h6" fontWeight={700}>
								Registered Users
							</Typography>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={openCreateUser}
							>
								Add User
							</Button>
						</Box>

						<AdminFilterToolbar
							searchValue={userSearch}
							onSearchChange={(value) => {
								setUserSearch(value);
								setUserPage(1);
							}}
							filters={[
								{
									key: "role",
									label: "Role",
									type: "select",
									value: userRole,
									onChange: (value) => {
										setUserRole(value);
										setUserPage(1);
									},
									options: [
										{ value: "", label: "All Roles" },
										{ value: "user", label: "User" },
										{ value: "admin", label: "Admin" },
									],
								},
								{
									key: "isActive",
									label: "Status",
									type: "select",
									value: userIsActive,
									onChange: (value) => {
										setUserIsActive(value);
										setUserPage(1);
									},
									options: [
										{ value: "", label: "All Statuses" },
										{ value: "true", label: "Active" },
										{ value: "false", label: "Inactive" },
									],
								},
								{
									key: "startDate",
									label: "Joined From",
									type: "date",
									value: userStartDate,
									onChange: (value) => {
										setUserStartDate(value);
										setUserPage(1);
									},
								},
								{
									key: "endDate",
									label: "Joined To",
									type: "date",
									value: userEndDate,
									onChange: (value) => {
										setUserEndDate(value);
										setUserPage(1);
									},
								},
							]}
							sort={{
								value: userSortBy,
								order: userSortOrder as "asc" | "desc",
								onChange: setUserSortBy,
								onOrderChange: setUserSortOrder,
								options: [
									{ value: "createdAt", label: "Newest" },
									{ value: "firstName", label: "First Name" },
									{ value: "lastName", label: "Last Name" },
								],
							}}
							onClearAll={clearUserFilters}
							hasActiveFilters={userHasActiveFilters}
							activeFilterChips={[
								...(userRole
									? [
											{
												label: `Role: ${userRole}`,
												onClear: () => {
													setUserRole("");
													setUserPage(1);
												},
											},
										]
									: []),
								...(userIsActive
									? [
											{
												label: `Status: ${userIsActive === "true" ? "Active" : "Inactive"}`,
												onClear: () => {
													setUserIsActive("");
													setUserPage(1);
												},
											},
										]
									: []),
								...(userStartDate
									? [
											{
												label: `Joined From: ${userStartDate}`,
												onClear: () => {
													setUserStartDate("");
													setUserPage(1);
												},
											},
										]
									: []),
								...(userEndDate
									? [
											{
												label: `Joined To: ${userEndDate}`,
												onClear: () => {
													setUserEndDate("");
													setUserPage(1);
												},
											},
										]
									: []),
							]}
						/>

						{usersLoading ? (
							<TableContainer component={Paper}>
								<Table>
									<TableBody>
										<TableSkeletonRows rows={8} cols={5} />
									</TableBody>
								</Table>
							</TableContainer>
						) : (
							<>
								<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
									<Table>
										<TableHead sx={{ bgcolor: "action.hover" }}>
											<TableRow>
												<TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{usersData?.users.map((user) => (
												<TableRow key={user._id} hover>
													<TableCell>
														<Typography fontWeight={600}>
															{user.firstName} {user.lastName}
														</Typography>
													</TableCell>
													<TableCell>{user.email}</TableCell>
													<TableCell>
														<Chip
															label={(user.role || "user").toUpperCase()}
															color={
																user.role === "admin" ? "secondary" : "default"
															}
															size="small"
															sx={{
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
																minHeight: 28,
																height: 28,
																fontWeight: 700,
															}}
														/>
													</TableCell>
													<TableCell>
														{user.createdAt
															? new Date(user.createdAt).toLocaleDateString()
															: "N/A"}
													</TableCell>
													<TableCell>
														<Stack direction="row" spacing={1}>
															<Tooltip title="Edit User">
																<IconButton
																	size="small"
																	color="primary"
																	onClick={() => openEditUser(user)}
																>
																	<EditIcon />
																</IconButton>
															</Tooltip>
															<Tooltip title="Delete User">
																<IconButton
																	size="small"
																	color="error"
																	onClick={() => setDeleteUserId(user._id)}
																>
																	<DeleteIcon />
																</IconButton>
															</Tooltip>
														</Stack>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
								{usersPagination && (
									<Box mt={2} pb={2}>
										<PaginationComponent
											pagination={usersPagination}
											onPageChange={(p) => {
												setUserPage(p);
											}}
										/>
									</Box>
								)}
							</>
						)}
					</Box>
				</TabPanel>

				<TabPanel value={tabIndex} index={3}>
					<Box px={3} ref={couponContainerRef}>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
							mb={3}
						>
							<Typography variant="h6" fontWeight={700}>
								Coupon Management
							</Typography>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() => setCouponDialogOpen(true)}
							>
								Add Coupon
							</Button>
						</Box>

						<AdminFilterToolbar
							searchValue={couponSearch}
							onSearchChange={(value) => {
								setCouponSearch(value);
								setCouponPage(1);
							}}
							filters={[
								{
									key: "status",
									label: "Status",
									type: "select",
									value: couponStatus,
									onChange: (value) => {
										setCouponStatus(value);
										setCouponPage(1);
									},
									options: [
										{ value: "", label: "All Statuses" },
										{ value: "active", label: "Active" },
										{ value: "inactive", label: "Inactive" },
										{ value: "expired", label: "Expired" },
									],
								},
								{
									key: "discountType",
									label: "Discount Type",
									type: "select",
									value: couponDiscountType,
									onChange: (value) => {
										setCouponDiscountType(value);
										setCouponPage(1);
									},
									options: [
										{ value: "", label: "All Types" },
										{ value: "percentage", label: "Percentage" },
										{ value: "fixed", label: "Fixed" },
									],
								},
								{
									key: "minDiscount",
									label: "Min Discount",
									type: "text",
									value: couponMinDiscount,
									onChange: (value) => {
										setCouponMinDiscount(value);
										setCouponPage(1);
									},
								},
								{
									key: "maxDiscount",
									label: "Max Discount",
									type: "text",
									value: couponMaxDiscount,
									onChange: (value) => {
										setCouponMaxDiscount(value);
										setCouponPage(1);
									},
								},
								{
									key: "startDate",
									label: "Created From",
									type: "date",
									value: couponStartDate,
									onChange: (value) => {
										setCouponStartDate(value);
										setCouponPage(1);
									},
								},
								{
									key: "endDate",
									label: "Created To",
									type: "date",
									value: couponEndDate,
									onChange: (value) => {
										setCouponEndDate(value);
										setCouponPage(1);
									},
								},
							]}
							sort={{
								value: couponSortBy,
								order: couponSortOrder as "asc" | "desc",
								onChange: setCouponSortBy,
								onOrderChange: setCouponSortOrder,
								options: [
									{ value: "createdAt", label: "Newest" },
									{ value: "expiresAt", label: "Expiration Date" },
									{ value: "discountPercent", label: "Discount %" },
								],
							}}
							onClearAll={clearCouponFilters}
							hasActiveFilters={couponHasActiveFilters}
							activeFilterChips={[
								...(couponStatus
									? [
											{
												label: `Status: ${couponStatus}`,
												onClear: () => {
													setCouponStatus("");
													setCouponPage(1);
												},
											},
										]
									: []),
								...(couponDiscountType
									? [
											{
												label: `Type: ${couponDiscountType}`,
												onClear: () => {
													setCouponDiscountType("");
													setCouponPage(1);
												},
											},
										]
									: []),
								...(couponMinDiscount
									? [
											{
												label: `Min Discount: ${couponMinDiscount}`,
												onClear: () => {
													setCouponMinDiscount("");
													setCouponPage(1);
												},
											},
										]
									: []),
								...(couponMaxDiscount
									? [
											{
												label: `Max Discount: ${couponMaxDiscount}`,
												onClear: () => {
													setCouponMaxDiscount("");
													setCouponPage(1);
												},
											},
										]
									: []),
								...(couponStartDate
									? [
											{
												label: `Created From: ${couponStartDate}`,
												onClear: () => {
													setCouponStartDate("");
													setCouponPage(1);
												},
											},
										]
									: []),
								...(couponEndDate
									? [
											{
												label: `Created To: ${couponEndDate}`,
												onClear: () => {
													setCouponEndDate("");
													setCouponPage(1);
												},
											},
										]
									: []),
							]}
						/>

						{couponsLoading ? (
							<TableContainer component={Paper}>
								<Table>
									<TableBody>
										<TableSkeletonRows rows={6} cols={7} />
									</TableBody>
								</Table>
							</TableContainer>
						) : (
							<TableContainer component={Paper} sx={{ borderRadius: 2 }}>
								<Table>
									<TableHead sx={{ bgcolor: "action.hover" }}>
										<TableRow>
											<TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>
												Discount Type
											</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Min Order</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Expires</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Usage</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{coupons.map((coupon) => (
											<TableRow key={coupon._id} hover>
												<TableCell>
													<Typography variant="subtitle2" fontWeight={700}>
														{coupon.code}
													</Typography>
												</TableCell>
												<TableCell>Percentage</TableCell>
												<TableCell>{coupon.discountPercent}%</TableCell>
												<TableCell>${coupon.minOrderAmount}</TableCell>
												<TableCell>
													{new Date(coupon.expiresAt).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{coupon.usedCount}/{coupon.usageLimit || "∞"}
												</TableCell>
												<TableCell>
													<Chip
														label={coupon.isActive ? "Active" : "Inactive"}
														color={coupon.isActive ? "success" : "default"}
														size="small"
														sx={{
															whiteSpace: "nowrap",
															overflow: "hidden",
															textOverflow: "ellipsis",
															minHeight: 28,
															height: 28,
															fontWeight: 700,
														}}
													/>
												</TableCell>
												<TableCell>
													<Stack direction="row" spacing={0.5}>
														<Tooltip title="Edit">
															<IconButton
																size="small"
																color="primary"
																onClick={() => {
																	setEditCouponId(coupon._id);
																	setCouponForm({
																		code: coupon.code,
																		discountType:
																			coupon.discountType || "percentage",
																		discountPercent: coupon.discountPercent,
																		discountValue: coupon.discountValue ?? 0,
																		minOrderAmount: coupon.minOrderAmount,
																		expiresAt: coupon.expiresAt
																			? new Date(coupon.expiresAt)
																					.toISOString()
																					.slice(0, 16)
																			: "",
																		usageLimit: coupon.usageLimit,
																		isActive: coupon.isActive,
																	});
																	setCouponDialogOpen(true);
																}}
															>
																<EditIcon />
															</IconButton>
														</Tooltip>
														<Tooltip title="Delete">
															<IconButton
																size="small"
																color="error"
																onClick={() => setDeleteCouponId(coupon._id)}
															>
																<DeleteIcon />
															</IconButton>
														</Tooltip>
													</Stack>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						)}
						{couponsPagination && (
							<Box mt={2} pb={2}>
								<PaginationComponent
									pagination={couponsPagination}
									onPageChange={(p) => {
										setCouponPage(p);
									}}
								/>
							</Box>
						)}
					</Box>
				</TabPanel>
			</Card>

			{/* Product Dialog - Create/Edit */}
			<Dialog
				open={productDialogOpen}
				onClose={() => setProductDialogOpen(false)}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle fontWeight={700}>
					{editingProduct ? "Edit Product" : "Add New Product"}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2} mt={1}>
						<TextField
							fullWidth
							label="Product Name"
							value={productForm.name}
							onChange={(e) =>
								setProductForm({ ...productForm, name: e.target.value })
							}
							size="small"
						/>
						<TextField
							fullWidth
							label="Description"
							multiline
							rows={3}
							value={productForm.description}
							onChange={(e) =>
								setProductForm({ ...productForm, description: e.target.value })
							}
							size="small"
						/>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Price"
									type="number"
									value={productForm.price}
									onChange={(e) =>
										setProductForm({
											...productForm,
											price: Number(e.target.value),
										})
									}
									size="small"
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Stock"
									type="number"
									value={productForm.stock}
									onChange={(e) =>
										setProductForm({
											...productForm,
											stock: Number(e.target.value),
										})
									}
									size="small"
								/>
							</Grid>
						</Grid>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Autocomplete
									fullWidth
									freeSolo
									options={categoryOptions}
									value={productForm.category}
									onChange={(_, value) =>
										setProductForm({
											...productForm,
											category: typeof value === "string" ? value : value || "",
										})
									}
									onInputChange={(_, value) =>
										setProductForm({ ...productForm, category: value })
									}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Category"
											size="small"
											placeholder="Select or add new"
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Autocomplete
									fullWidth
									freeSolo
									options={brandOptions}
									value={productForm.brand}
									onChange={(_, value) =>
										setProductForm({
											...productForm,
											brand: typeof value === "string" ? value : value || "",
										})
									}
									onInputChange={(_, value) =>
										setProductForm({ ...productForm, brand: value })
									}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Brand"
											size="small"
											placeholder="Select or add new"
										/>
									)}
								/>
							</Grid>
						</Grid>
						<TextField
							fullWidth
							label="Image URL"
							value={productForm.imageUrl}
							onChange={(e) =>
								setProductForm({ ...productForm, imageUrl: e.target.value })
							}
							size="small"
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button onClick={() => setProductDialogOpen(false)} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleSaveProduct}
						variant="contained"
						disabled={saveProductMutation.isPending}
					>
						{saveProductMutation.isPending ? "Saving..." : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Order Status Dialog */}
			<Dialog
				open={statusDialogOpen}
				onClose={() => setStatusDialogOpen(false)}
				fullWidth
				maxWidth="xs"
			>
				<DialogTitle fontWeight={700}>Update Order Status</DialogTitle>
				<DialogContent>
					{selectedOrder && (
						<Box mt={1}>
							<Typography variant="body2" color="text.secondary" mb={2}>
								Order #{selectedOrder.orderNumber}
							</Typography>
							<TextField
								fullWidth
								select
								label="Status"
								value={newStatus}
								onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
								size="small"
							>
								{(
									[
										"pending",
										"processing",
										"shipped",
										"delivered",
										"cancelled",
									] as OrderStatus[]
								).map((status) => (
									<MenuItem key={status} value={status}>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</MenuItem>
								))}
							</TextField>
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button onClick={() => setStatusDialogOpen(false)} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={() =>
							selectedOrder &&
							updateStatusMutation.mutate({
								orderId: selectedOrder._id,
								status: newStatus,
							})
						}
						variant="contained"
						disabled={updateStatusMutation.isPending}
					>
						{updateStatusMutation.isPending ? "Updating..." : "Update"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* View Order Dialog */}
			<Dialog
				open={viewDialogOpen}
				onClose={() => setViewDialogOpen(false)}
				fullWidth
				maxWidth="md"
				PaperProps={{ sx: luxeDialogPaper }}
			>
				<DialogTitle fontWeight={800} letterSpacing="-0.02em">
					Order #{viewingOrder?.orderNumber}
				</DialogTitle>
				<DialogContent>
					{viewingOrder && (
						<Stack spacing={3} mt={1}>
							<Box>
								<Typography variant="subtitle2" color="text.secondary" gutterBottom>
									Customer
								</Typography>
								<Typography variant="body1" fontWeight={600}>
									{typeof viewingOrder.userId === "object"
										? `${viewingOrder.userId.firstName} ${viewingOrder.userId.lastName}`
										: "Unknown User"}
								</Typography>
								{typeof viewingOrder.userId === "object" && (
									<Typography variant="body2" color="text.secondary">
										{viewingOrder.userId.email}
									</Typography>
								)}
							</Box>
							<Box>
								<Typography variant="subtitle2" color="text.secondary" gutterBottom>
									Shipping Address
								</Typography>
								<Typography variant="body1">{viewingOrder.address}</Typography>
							</Box>
							{viewingOrder.phone && (
								<Box>
									<Typography variant="subtitle2" color="text.secondary" gutterBottom>
										Phone Number
									</Typography>
									<Typography variant="body1">{viewingOrder.phone}</Typography>
								</Box>
							)}
							<Box>
								<Typography variant="subtitle2" color="text.secondary" gutterBottom>
									Order Items
								</Typography>
								<TableContainer component={Paper} sx={{ ...luxeTableContainer }}>
									<Table size="small">
										<TableHead sx={{ bgcolor: "action.hover" }}>
											<TableRow>
												<TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{viewingOrder.orderItems.map((item, idx) => (
												<TableRow key={idx}>
													<TableCell>{item.productTitle}</TableCell>
													<TableCell>{item.quantity}</TableCell>
													<TableCell>${item.unitPrice}</TableCell>
													<TableCell>
														<Typography fontWeight={700}>
															${item.unitPrice * item.quantity}
														</Typography>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</Box>
							<Box display="flex" justifyContent="space-between" alignItems="center">
								<Typography variant="body2" color="text.secondary">
									Total: <strong>${viewingOrder.totalAmount}</strong>
								</Typography>
								<Chip
									label={(viewingOrder.status || "pending").toUpperCase()}
									color={statusColors[viewingOrder.status || "pending"]}
									size="small"
									sx={{ fontWeight: 700 }}
								/>
							</Box>
						</Stack>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button onClick={() => setViewDialogOpen(false)} color="inherit">
						Close
					</Button>
				</DialogActions>
			</Dialog>

			{/* User Dialog - Create/Edit */}
			<Dialog
				open={userDialogOpen}
				onClose={() => setUserDialogOpen(false)}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle fontWeight={700}>
					{editingUser ? "Edit User" : "Add New User"}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2} mt={1}>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="First Name"
									value={userForm.firstName}
									onChange={(e) =>
										setUserForm({ ...userForm, firstName: e.target.value })
									}
									size="small"
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									label="Last Name"
									value={userForm.lastName}
									onChange={(e) =>
										setUserForm({ ...userForm, lastName: e.target.value })
									}
									size="small"
								/>
							</Grid>
						</Grid>
						<TextField
							fullWidth
							label="Email"
							type="email"
							value={userForm.email}
							onChange={(e) =>
								setUserForm({ ...userForm, email: e.target.value })
							}
							size="small"
						/>
						<TextField
							fullWidth
							label={
								editingUser ? "New Password (leave blank to keep)" : "Password"
							}
							type="password"
							value={userForm.password}
							onChange={(e) =>
								setUserForm({ ...userForm, password: e.target.value })
							}
							required={!editingUser}
							size="small"
						/>
						<TextField
							fullWidth
							select
							label="Role"
							value={userForm.role}
							onChange={(e) =>
								setUserForm({
									...userForm,
									role: e.target.value as "user" | "admin",
								})
							}
							size="small"
						>
							<MenuItem value="user">User</MenuItem>
							<MenuItem value="admin">Admin</MenuItem>
						</TextField>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button onClick={() => setUserDialogOpen(false)} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleSaveUser}
						variant="contained"
						disabled={saveUserMutation.isPending}
					>
						{saveUserMutation.isPending ? "Saving..." : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Product Confirmation */}
			<ConfirmDialog
				open={!!deleteProductId}
				title="Delete Product"
				message="Are you sure you want to delete this product? This action cannot be undone."
				onConfirm={() => {
					if (deleteProductId) deleteProductMutation.mutate(deleteProductId);
				}}
				onCancel={() => setDeleteProductId(null)}
				isLoading={deleteProductMutation.isPending}
			/>

			{/* Create Category/Brand Dialog */}
			<Dialog
				open={optionDialogOpen}
				onClose={() => setOptionDialogOpen(false)}
				fullWidth
				maxWidth="xs"
			>
				<DialogTitle fontWeight={700}>
					Add New {optionDialogType === "category" ? "Category" : "Brand"}
				</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						label="Name"
						value={optionName}
						onChange={(e) => setOptionName(e.target.value)}
						size="small"
						sx={{ mt: 1 }}
					/>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button onClick={() => setOptionDialogOpen(false)} color="inherit">
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={() => {
							const trimmed = optionName.trim();
							if (!trimmed) {
								toast.error("Name is required");
								return;
							}
							saveOptionMutation.mutate(trimmed);
						}}
						disabled={saveOptionMutation.isPending}
					>
						{saveOptionMutation.isPending ? "Saving..." : "Create"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Coupon Dialog */}
			<Dialog
				open={couponDialogOpen}
				onClose={() => {
					setCouponDialogOpen(false);
					setEditCouponId(null);
				}}
				fullWidth
				maxWidth="md"
			>
				<DialogTitle fontWeight={700}>
					{editCouponId ? "Edit Coupon" : "Create Coupon"}
				</DialogTitle>
				<DialogContent>
					<Grid container spacing={2} sx={{ mt: 0.5 }}>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Coupon Code"
								value={couponForm.code}
								onChange={(e) =>
									setCouponForm({ ...couponForm, code: e.target.value })
								}
								size="small"
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								type="number"
								label="Discount %"
								value={couponForm.discountPercent}
								onChange={(e) =>
									setCouponForm({
										...couponForm,
										discountPercent: Number(e.target.value),
									})
								}
								size="small"
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								type="number"
								label="Minimum Order Amount"
								value={couponForm.minOrderAmount}
								onChange={(e) =>
									setCouponForm({
										...couponForm,
										minOrderAmount: Number(e.target.value),
									})
								}
								size="small"
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								type="number"
								label="Usage Limit"
								value={couponForm.usageLimit}
								onChange={(e) =>
									setCouponForm({
										...couponForm,
										usageLimit: Number(e.target.value),
									})
								}
								size="small"
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								type="datetime-local"
								label="Expires At"
								value={couponForm.expiresAt}
								onChange={(e) =>
									setCouponForm({ ...couponForm, expiresAt: e.target.value })
								}
								size="small"
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControlLabel
								control={
									<Switch
										checked={couponForm.isActive}
										onChange={(e) =>
											setCouponForm({
												...couponForm,
												isActive: e.target.checked,
											})
										}
									/>
								}
								label="Active"
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button onClick={() => setCouponDialogOpen(false)} color="inherit">
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={() => {
							if (!couponForm.code.trim()) {
								toast.error("Coupon code is required");
								return;
							}
							if (editCouponId) {
								updateCouponMutation.mutate({
									...couponForm,
									id: editCouponId,
									code: couponForm.code.trim().toUpperCase(),
									expiresAt: new Date(couponForm.expiresAt).toISOString(),
								});
							} else {
								saveCouponMutation.mutate({
									...couponForm,
									code: couponForm.code.trim().toUpperCase(),
									expiresAt: new Date(couponForm.expiresAt).toISOString(),
								});
							}
						}}
						disabled={
							saveCouponMutation.isPending || updateCouponMutation.isPending
						}
					>
						{editCouponId ? "Update Coupon" : "Save Coupon"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete User Confirmation */}
			<ConfirmDialog
				open={!!deleteUserId}
				title="Delete User"
				message="Are you sure you want to delete this user? This action cannot be undone."
				onConfirm={() => {
					if (deleteUserId) deleteUserMutation.mutate(deleteUserId);
				}}
				onCancel={() => setDeleteUserId(null)}
				isLoading={deleteUserMutation.isPending}
			/>

			{/* Delete Coupon Confirmation */}
			<ConfirmDialog
				open={!!deleteCouponId}
				title="Delete Coupon"
				message="Are you sure you want to delete this coupon?"
				onConfirm={() => {
					if (deleteCouponId) deleteCouponMutation.mutate(deleteCouponId);
				}}
				onCancel={() => setDeleteCouponId(null)}
				isLoading={deleteCouponMutation.isPending}
			/>
		</Box>
	);
};
