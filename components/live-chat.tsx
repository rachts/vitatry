"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import { MessageCircle, Send, Smile, Paperclip, Minus, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import dynamic from "next/dynamic"
import anime from "animejs"

interface Message {
  id: string
  text: string
  sender: "bot" | "user"
  timestamp: Date
  read?: boolean
}

const quickActions = [
  { label: "What is VitaMend?", emoji: "👋" },
  { label: "Pricing", emoji: "💰" },
  { label: "FAQs", emoji: "📁" },
] as const

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! Welcome to VitaMend. How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
]

const MessageBubble = memo(function MessageBubble({
  message,
  formatTime,
  onCopy,
  isNew,
}: {
  message: Message
  formatTime: (date: Date) => string
  onCopy: (text: string) => void
  isNew?: boolean
}) {
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isNew && bubbleRef.current) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (prefersReducedMotion) return

      anime({
        targets: bubbleRef.current,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 300,
        easing: "easeOutCubic",
      })
    }
  }, [isNew])

  if (message.sender === "user") {
    return (
      <div ref={bubbleRef} className="flex justify-end" style={{ opacity: isNew ? 0 : 1 }}>
        <div className="flex flex-col items-end max-w-[80%]">
          <div className="bg-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md">
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
          <span className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            {formatTime(message.timestamp)}
            {message.read && <span className="text-violet-500">✓✓</span>}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div ref={bubbleRef} className="flex justify-start" style={{ opacity: isNew ? 0 : 1 }}>
      <div className="flex items-start gap-2.5 max-w-[85%]">
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-md">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{message.text}</p>
          </div>
          <div className="flex items-center gap-2.5 mt-1.5 ml-1">
            <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
            <button
              onClick={() => onCopy(message.text)}
              className="p-1 text-slate-400 hover:text-violet-500 transition-colors duration-200"
              aria-label="Copy message"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1 text-slate-400 hover:text-green-500 transition-colors duration-200"
              aria-label="Like message"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200"
              aria-label="Dislike message"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow-sm">
        <MessageCircle className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white dark:bg-slate-700 rounded-2xl px-4 py-3 shadow-md">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
})

const QuickActionChip = memo(function QuickActionChip({
  action,
  onClick,
}: {
  action: (typeof quickActions)[number]
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3.5 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 hover:text-violet-700 dark:hover:text-violet-400 transition-all duration-200 flex items-center gap-1.5 shadow-sm"
    >
      <span>{action.emoji}</span>
      {action.label}
    </button>
  )
})

function LiveChatComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [newMessageId, setNewMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      requestAnimationFrame(() => {
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const toggleChat = useCallback(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!isOpen) {
      setIsOpen(true)
      if (!prefersReducedMotion && chatWindowRef.current && fabRef.current) {
        anime({
          targets: fabRef.current,
          scale: [1, 0],
          opacity: [1, 0],
          duration: 200,
          easing: "easeInCubic",
        })
        anime({
          targets: chatWindowRef.current,
          scale: [0.95, 1],
          opacity: [0, 1],
          duration: 350,
          easing: "easeOutBack",
        })
      }
    } else {
      if (!prefersReducedMotion && chatWindowRef.current && fabRef.current) {
        anime({
          targets: chatWindowRef.current,
          scale: [1, 0.95],
          opacity: [1, 0],
          duration: 250,
          easing: "easeInCubic",
          complete: () => setIsOpen(false),
        })
        anime({
          targets: fabRef.current,
          scale: [0, 1],
          opacity: [0, 1],
          duration: 250,
          delay: 100,
          easing: "easeOutBack",
        })
      } else {
        setIsOpen(false)
      }
    }
  }, [isOpen])

  const getBotResponse = useCallback((input: string): string => {
    const lower = input.toLowerCase()
    if (lower.includes("donate") || lower.includes("donation")) {
      return "To donate medicines, go to our Donate page and fill out the form with your medicine details. Our AI will verify the medicine quality automatically!"
    }
    if (lower.includes("vitamend") || lower.includes("what")) {
      return "VitaMend is a platform that connects medicine donors with NGOs and people in need. We use AI to verify medicine quality and ensure safe redistribution."
    }
    if (lower.includes("volunteer")) {
      return "We'd love to have you! Visit our Volunteer page to apply. We need help with medicine collection, verification, and distribution."
    }
    if (lower.includes("pricing") || lower.includes("cost") || lower.includes("free")) {
      return "VitaMend is completely free for donors and NGOs! Our mission is to reduce medicine waste and help those in need without any cost barriers."
    }
    if (lower.includes("faq") || lower.includes("question")) {
      return "Here are common questions: 1) How do I donate? Visit our Donate page. 2) Is it safe? Yes, all medicines are AI-verified. 3) Who receives donations? Verified NGOs and individuals in need."
    }
    if (lower.includes("contact") || lower.includes("help")) {
      return "You can reach us at contact@vitamend.org or visit our Contact page for more options."
    }
    return "Thanks for your message! Our team will get back to you soon. Feel free to explore our website or ask me about donations, volunteering, or how VitaMend works."
  }, [])

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
      read: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessageId(userMessage.id)
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage.text),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setNewMessageId(botResponse.id)
      setIsTyping(false)
    }, 1000)
  }, [inputValue, getBotResponse])

  const handleQuickAction = useCallback(
    (action: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: action,
        sender: "user",
        timestamp: new Date(),
        read: true,
      }
      setMessages((prev) => [...prev, userMessage])
      setNewMessageId(userMessage.id)
      setIsTyping(true)

      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(action),
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setNewMessageId(botResponse.id)
        setIsTyping(false)
      }, 1000)
    },
    [getBotResponse],
  )

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  }, [])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const messagesList = useMemo(
    () =>
      messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          formatTime={formatTime}
          onCopy={copyToClipboard}
          isNew={message.id === newMessageId}
        />
      )),
    [messages, formatTime, copyToClipboard, newMessageId],
  )

  return (
    <>
      <button
        ref={fabRef}
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg flex items-center justify-center transition-colors duration-200 ${
          isOpen ? "pointer-events-none" : ""
        }`}
        style={{ opacity: isOpen ? 0 : 1, transform: isOpen ? "scale(0)" : "scale(1)" }}
        aria-label="Open chat"
        aria-expanded={isOpen}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        ref={chatWindowRef}
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden ${
          !isOpen ? "pointer-events-none" : ""
        }`}
        style={{
          transformOrigin: "bottom right",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0.95)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Chat with VitaMend AI"
      >
        <div className="bg-violet-600 dark:bg-violet-700 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">VitaMend AI</h3>
              <p className="text-xs text-violet-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            aria-label="Minimize chat"
          >
            <Minus className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={messagesContainerRef}
          className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
        >
          {messagesList}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto scrollbar-none shadow-inner">
          {quickActions.map((action) => (
            <QuickActionChip key={action.label} action={action} onClick={() => handleQuickAction(action.label)} />
          ))}
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-inner">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-violet-500/50 transition-shadow duration-200">
            <button
              className="p-1 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors duration-200"
              aria-label="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
            <button
              className="p-1 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors duration-200"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
              aria-label="Chat message input"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-1 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export const LiveChat = dynamic(() => Promise.resolve(LiveChatComponent), {
  ssr: false,
  loading: () => null,
})
