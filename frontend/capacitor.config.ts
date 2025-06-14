import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "io.accessibility.app",
  appName: "Accessibility App",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    },
  },
}

export default config
