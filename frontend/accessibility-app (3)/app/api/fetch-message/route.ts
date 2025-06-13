import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 
    const urls = [,
      "https://www.codingwithdox.com:8080/",
    ]

    let lastError = null

    // Try each URL until one works
    for (const url of urls) {
      try {
        console.log(`Attempting to fetch from: ${url}`)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "text/plain",
          },
          // Add a longer timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000),
          // Disable SSL verification for development
          // @ts-ignore - Next.js specific option
          next: { revalidate: 0 },
        })

        if (response.ok) {
          const data = await response.text()
          console.log("Fetch successful, received data:", data)
          return NextResponse.json({ message: data }, { status: 200 })
        } else {
          console.log(`Fetch failed with status: ${response.status} ${response.statusText}`)
          lastError = `Error: ${response.status} ${response.statusText}`
        }
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error)
        lastError = error instanceof Error ? error.message : "Unknown error"
      }
    }

    // If we get here, all URLs failed
    console.error("All fetch attempts failed. Last error:", lastError)

    // Return a fallback response for testing
    return NextResponse.json(
      {
        message: "Hello world! (Fallback response - API connection failed)",
        error: `Failed to connect to server: ${lastError}`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("API fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch message" },
      { status: 500 },
    )
  }
}
