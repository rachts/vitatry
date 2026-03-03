"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCheck, Bell, Calendar } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  actionUrl?: string
  createdAt: string
}

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      // Mock notifications - can be connected to Firestore
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "donation":
        return "💊"
      case "volunteer":
        return "🤝"
      case "achievement":
        return "🏆"
      default:
        return "📢"
    }
  }

  if (!user && !loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Please sign in to view your notifications.</p>
            <Button asChild className="mt-4">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-emerald-700" />
          <h1 className="text-2xl font-bold text-emerald-700">Notifications</h1>
          {unreadCount > 0 && <Badge className="bg-red-500">{unreadCount} unread</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">Loading...</div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet.</p>
            <p className="text-sm text-muted-foreground mt-1">We will notify you when something happens.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={!notification.read ? "border-l-4 border-l-blue-500" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {!notification.read && <Badge className="bg-blue-500">New</Badge>}
                      </div>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
