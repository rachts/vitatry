"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Heart, ShoppingCart, User, Home, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/components/shop/cart-provider"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: Info },
  { name: "Donate", href: "/donate", icon: Heart },
  { name: "Volunteer", href: "/volunteer", icon: User },
  { name: "Shop", href: "/shop", icon: ShoppingCart },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { totalItems } = useCart()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle>
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
              <img
                src="/images/design-mode/VITAMEND_LOGO.png"
                alt="VitaMend"
                className="h-8 w-8 mr-2"
              />
              VitaMend
            </Link>
          </SheetTitle>
          <SheetDescription>Reviving Medicines, Restoring Lives</SheetDescription>
        </SheetHeader>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-foreground" : "text-foreground/60",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
                {item.name === "Shop" && totalItems > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
