import { productModel } from "../models/productModel";

export const getAllProducts = async () => {
	const products = await productModel.find().lean();
	return products;
};

export const seedInitialProducts = async () => {
	try {
		const products = [
			{
				name: "iPhone 16",
				description: "Apple smartphone",
				price: 1200,
				category: "Phones",
				brand: "Apple",
				stock: 20,
				imageUrl: "https://example.com/iphone16.jpg",
			},
			{
				name: "Galaxy S25",
				description: "Samsung smartphone",
				price: 950,
				category: "Phones",
				brand: "Samsung",
				stock: 15,
				imageUrl: "https://example.com/s25.jpg",
			},
			{
				name: "MacBook Pro",
				description: "Apple laptop",
				price: 2200,
				category: "Laptops",
				brand: "Apple",
				stock: 10,
				imageUrl: "https://example.com/macbook.jpg",
			},
		];

		const existingProducts = await productModel.find().lean();
		if (existingProducts.length === 0) {
			await productModel.insertMany(products);
		}
	} catch (error) {
		console.error("Error seeding database:", error);
	}
};
