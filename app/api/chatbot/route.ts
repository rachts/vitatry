import { type NextRequest, NextResponse } from "next/server"

const responses = {
  donation: [
    "To donate medicines, visit our donation page and fill out the form. We accept unexpired medicines in original packaging.",
    "You can schedule a pickup or drop off medicines at our collection centers. All donations are verified by our pharmacists.",
  ],
  volunteer: [
    "We have various volunteer opportunities including medicine collection, quality control, and community outreach.",
    "To volunteer, fill out our volunteer application form and we'll match you with suitable opportunities.",
  ],
  eligibility: [
    "We accept medicines that are unexpired (at least 6 months before expiry), in original packaging, and properly stored.",
    "Prescription and over-the-counter medicines are both accepted, but controlled substances are not.",
  ],
  process: [
    "Our process: 1) Collection 2) Quality verification by pharmacists 3) Repackaging 4) Distribution to communities in need.",
    "Each donation is tracked and you'll receive updates on the verification status and impact.",
  ],
  default: [
    "I can help you with information about donating medicines, volunteering, or our verification process. What would you like to know?",
    "Feel free to ask about our donation process, volunteer opportunities, or how we ensure medicine quality and safety.",
  ],
}

function getResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("donate") || lowerMessage.includes("donation")) {
    return responses.donation[Math.floor(Math.random() * responses.donation.length)]
  }

  if (lowerMessage.includes("volunteer")) {
    return responses.volunteer[Math.floor(Math.random() * responses.volunteer.length)]
  }

  if (lowerMessage.includes("eligible") || lowerMessage.includes("accept")) {
    return responses.eligibility[Math.floor(Math.random() * responses.eligibility.length)]
  }

  if (lowerMessage.includes("process") || lowerMessage.includes("how")) {
    return responses.process[Math.floor(Math.random() * responses.process.length)]
  }

  return responses.default[Math.floor(Math.random() * responses.default.length)]
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const response = getResponse(message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chatbot error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
