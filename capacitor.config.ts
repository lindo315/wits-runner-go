import { CapacitorConfig } from "@capacitor/core";

const config: CapacitorConfig = {
  appId: "app.lovable.witsrunnergo", // Changed to valid format
  appName: "Wits Runner Go",
  webDir: "dist",
  server: {
    url: "https://898faa95-218e-4fb6-ade9-323ece86fcbb.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
