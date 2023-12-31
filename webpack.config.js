const Path = require("path");

const config = {
	mode: "production",

	entry: {
		background: "./src/background.ts",
		main: "./src/main.ts",
		option: "./src/option.ts"
	},

	output: {
		path: Path.resolve("webextension/dist")
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/
			}
		]
	},

	resolve: {
		extensions: [".ts", ".js"]
	}
};

module.exports = config;
