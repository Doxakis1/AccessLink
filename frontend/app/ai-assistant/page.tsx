import AIAssistant from "@/components/ai-assistant"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Assistant - Accessibility App",
  description: "Chat with our AI assistant using text or voice",
}

export default function AIAssistantPage() {
  return <AIAssistant />
}
