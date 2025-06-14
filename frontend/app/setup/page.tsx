import type { Metadata } from "next"
import SetupWizard from "@/components/setup-wizard"

export const metadata: Metadata = {
  title: "Setup Wizard - Accessibility Assistant",
  description: "Set up your accessibility preferences",
}

export default function SetupPage() {
  return <SetupWizard />
}
