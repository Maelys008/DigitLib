import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digilib.app',
  appName: 'DigiLib',
  webDir: 'capacitor-public',
  
  server: {
    url: 'http://10.0.2.2:8000',
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;