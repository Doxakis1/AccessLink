import type { Metadata } from "next"
import HomeScreen from "@/components/home-screen"

export const metadata: Metadata = {
  title: "Home - Accessibility Assistant",
  description:
    "Mobile application providing accessibility assistance with call help, AI support, gadgets management, and reports",
}

export default function HomePage() {
  return <HomeScreen />
}
