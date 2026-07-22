import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Cart } from "../pages/Cart";
import { AdminDashboard } from "../pages/AdminDashboard";
import { ProductDetail } from "../pages/ProductDetail";
import { MyOrders } from "../pages/MyOrders";
import { OrderDetail } from "../pages/OrderDetail";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { NotFound } from "../pages/NotFound";
import { Layout } from "../components/layout/Layout";

export const AppRoutes: React.FC = () => {
	return (
		<Layout>
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/product/:id" element={<ProductDetail />} />

				{/* Protected User Routes */}
				<Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
					<Route path="/cart" element={<Cart />} />
					<Route path="/orders" element={<MyOrders />} />
					<Route path="/orders/:id" element={<OrderDetail />} />
				</Route>

				{/* Protected Admin Routes */}
				<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
					<Route path="/admin" element={<AdminDashboard />} />
				</Route>

				{/* Fallback Route */}
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Layout>
	);
};
