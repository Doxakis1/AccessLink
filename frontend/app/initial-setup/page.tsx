import type { Metadata } from "next"
import InitialSetupWizard from "@/components/initial-setup-wizard"

export const metadata: Metadata = {
  title: "Initial Setup - Accessibility Assistant",
  description: "Set up your accessibility preferences before getting started",
}

export default function InitialSetupPage() {
  return <InitialSetupWizard />
}
