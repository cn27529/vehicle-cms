// vue.config.js
import { defineConfig } from "@vue/cli-service";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export default defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "stats.html",
      }),
    ],
  },
});
