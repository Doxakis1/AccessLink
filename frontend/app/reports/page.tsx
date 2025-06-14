import ReportsPage from "@/components/reports-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility Reports - Accessibility Assistant",
  description: "View and report accessibility issues in your area",
}

export default function Reports() {
  return <ReportsPage />
}
