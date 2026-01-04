// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000
//   }
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 👇 CRITICAL: This tells Vite your app lives at /dashboard/
  base: "/dashboard/", 
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000' // Proxies API requests during dev
    }
  }
});