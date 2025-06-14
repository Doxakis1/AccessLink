import type { Metadata } from "next"
import LoginForm from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login - Accessibility Assistant",
  description: "Log in to your Accessibility Assistant account",
}

export default function LoginPage() {
  return <LoginForm />
}
