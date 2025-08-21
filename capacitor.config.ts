import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.898faa95218e4fb6ade9323ece86fcbb',
  appName: 'wits-runner-go',
  webDir: 'dist',
  server: {
    url: 'https://898faa95-218e-4fb6-ade9-323ece86fcbb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;