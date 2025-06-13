import SettingsPage from "@/components/settings-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility Settings - Accessibility Assistant",
  description: "Customize your accessibility preferences",
}

export default function Settings() {
  return <SettingsPage />
}
