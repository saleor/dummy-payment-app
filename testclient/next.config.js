const { hostname } = new URL(process.env.SALEOR_API_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [{ hostname: "**.s3.amazonaws.com", pathname: "/**" }, { hostname }],
	},
	experimental: {
		serverActions: true,
	},
};

module.exports = nextConfig;
