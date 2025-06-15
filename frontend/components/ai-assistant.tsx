"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, ChevronLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define message types
type MessageRole = "user" | "assistant" | "system"

interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

export default function AIAssistant() {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. How can I help you today? You can type or use the microphone button to speak.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentlyReadingId, setCurrentlyReadingId] = useState<string | null>(null)
  const [autoRead, setAutoRead] = useState(true) // Default to true for accessibility
  const [apiError, setApiError] = useState<string | null>(null)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { toast } = useToast()
  const { isListening, startListening, stopListening, transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition()
  const { speak, stop, speaking, supported: speechSynthesisSupported } = useSpeechSynthesis()

  // Check if API key is available
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

  // Update input value when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue((prev) => prev + transcript)
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()

    // Auto-read the welcome message
    if (autoRead && speechSynthesisSupported && messages.length === 1) {
      const welcomeMessage = messages[0]
      setCurrentlyReadingId(welcomeMessage.id)
      setIsSpeaking(true)
      speak(welcomeMessage.content, {
        onEnd: () => {
          setIsSpeaking(false)
          setCurrentlyReadingId(null)
        },
      })
    }

    // Check if API key is available
    if (hasApiKey) {
      setApiError("Gemini API key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.")
    }
  }, [])

  // Generate a unique ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!inputValue.trim() || isLoading) return

    // Clear any previous API errors
    setApiError(null)

    // Stop any ongoing speech
    if (speaking) {
      stop()
      setIsSpeaking(false)
      setCurrentlyReadingId(null)
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Check if API key is available
      if (!hasApiKey) {
        throw new Error(
          "Gemini API key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.",
        )
      }

      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })

      // Prepare conversation history
      const history = messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }))

      // Start a chat
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      })

      // Send message and get response
      const result = await chat.sendMessage(inputValue.trim())
      const response = result.response
      const responseText = response.text()

      // Add assistant response to messages
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Auto-read response if enabled
      if (autoRead && speechSynthesisSupported) {
        setCurrentlyReadingId(assistantMessage.id)
        setIsSpeaking(true)
        speak(responseText, {
          onEnd: () => {
            setIsSpeaking(false)
            setCurrentlyReadingId(null)
          },
        })
      }
    } catch (error) {
      console.error("Error communicating with Gemini API:", error)

      // Set API error state
      if (error instanceof Error) {
        setApiError(error.message)
      } else {
        setApiError("Failed to connect to the AI service. Please check your internet connection and try again.")
      }

      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "system",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      // Focus back on input after response
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      stopListening()
    } else {
      if (browserSupportsSpeechRecognition) {
        startListening()
        toast({
          title: "Listening",
          description: "Speak now. Click the microphone again when finished.",
        })
      } else {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        })
      }
    }
  }

  // Read message aloud
  const readMessage = (message: Message) => {
    if (!speechSynthesisSupported) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    if (speaking && currentlyReadingId === message.id) {
      stop()
      setIsSpeaking(false)
      setCurrentlyReadingId(null)
    } else {
      // Stop any current speech
      if (speaking) {
        stop()
      }

      setCurrentlyReadingId(message.id)
      setIsSpeaking(true)
      speak(message.content, {
        onEnd: () => {
          setIsSpeaking(false)
          setCurrentlyReadingId(null)
        },
      })
    }
  }

  // Toggle auto-read
  const toggleAutoRead = () => {
    setAutoRead(!autoRead)
    toast({
      title: !autoRead ? "Auto-read Enabled" : "Auto-read Disabled",
      description: !autoRead
        ? "AI responses will be read aloud automatically."
        : "AI responses will not be read aloud automatically.",
    })
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  // Provide a mock response for demo purposes when API is unavailable
  const handleDemoResponse = () => {
    const demoResponses = [
      "I'm currently in demo mode because the API key is missing. In a real implementation, I would connect to the Gemini API to provide intelligent responses.",
      "This is a demonstration of the AI assistant interface. To enable full functionality, please add your Gemini API key to the environment variables.",
      "I'm showing you how the interface works, but I can't provide real AI responses without an API key. The UI is fully functional though!",
      "In demo mode, I can show you how the chat interface works, but I can't generate intelligent responses without connecting to the Gemini API.",
    ]

    const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)]

    // Add assistant response to messages
    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: randomResponse,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])

    // Auto-read response if enabled
    if (autoRead && speechSynthesisSupported) {
      setCurrentlyReadingId(assistantMessage.id)
      setIsSpeaking(true)
      speak(randomResponse, {
        onEnd: () => {
          setIsSpeaking(false)
          setCurrentlyReadingId(null)
        },
      })
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[100dvh] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Go back to home" onClick={() => router.push("/")}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <h1 className="text-xl font-bold">AI Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1",
              autoRead ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "",
            )}
            onClick={toggleAutoRead}
            aria-pressed={autoRead}
            aria-label={autoRead ? "Disable auto-read responses" : "Enable auto-read responses"}
          >
            {autoRead ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="sr-only md:not-sr-only">Auto-read</span>
          </Button>
        </div>
      </header>

      {/* API Error Alert */}
      {apiError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription>
            {apiError}
            {!hasApiKey && (
              <div className="mt-2">
                <p className="text-sm font-medium">Using demo mode instead. Responses will be pre-defined examples.</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Conversation with AI Assistant"
        aria-live="polite"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col max-w-[85%] rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4 duration-300",
              message.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : message.role === "assistant"
                  ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  : "mx-auto bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100",
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">
                {message.role === "user" ? "You" : message.role === "assistant" ? "AI Assistant" : "System"}
              </span>
              <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
            </div>
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.role === "assistant" && (
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 text-xs",
                    currentlyReadingId === message.id
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "opacity-70 hover:opacity-100",
                  )}
                  onClick={() => readMessage(message)}
                  aria-label={currentlyReadingId === message.id ? "Stop reading message aloud" : "Read message aloud"}
                  aria-pressed={currentlyReadingId === message.id}
                >
                  {currentlyReadingId === message.id ? (
                    <>
                      <VolumeX className="h-3 w-3 mr-1" aria-hidden="true" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3 w-3 mr-1" aria-hidden="true" />
                      Read
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div
              className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!hasApiKey) {
              // Use demo mode if API key is missing
              const userMessage: Message = {
                id: generateId(),
                role: "user",
                content: inputValue.trim(),
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, userMessage])
              setInputValue("")
              setTimeout(() => {
                handleDemoResponse()
              }, 1000)
            } else {
              handleSubmit(e)
            }
          }}
          className="flex flex-col gap-3"
        >
          <div className="relative">
            <label htmlFor="message-input" className="sr-only">
              Type your message
            </label>
            <Textarea
              id="message-input"
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[80px] pr-10 resize-none"
              aria-label="Type your message"
              disabled={isLoading}
            />
            {isListening && (
              <div className="absolute right-3 top-3 text-red-500 animate-pulse" role="status" aria-live="assertive">
                <span className="sr-only">Listening for speech input</span>
                <Mic className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleSpeechRecognition}
              disabled={isLoading || !browserSupportsSpeechRecognition}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              aria-pressed={isListening}
              className="h-10 w-10 rounded-full"
            >
              {isListening ? (
                <MicOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Mic className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>

            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              aria-label="Send message"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                <>
                  Send
                  <Send className="h-4 w-4 ml-2" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
