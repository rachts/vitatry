import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider
      session={{
        user: { id: "1", name: "Test User", email: "test@example.com", role: "donor" },
        expires: "2024-12-31",
      }}
    >
      {children}
    </SessionProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }
