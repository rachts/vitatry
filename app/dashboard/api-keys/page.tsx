"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Clipboard, Eye, EyeOff, Trash } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
  expiresAt?: string
}

export default function ApiKeysPage() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user) {
      fetchApiKeys()
    }
  }, [session])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/user/api-keys")
      const data = await response.json()
      setApiKeys(data.apiKeys)
    } catch (error) {
      console.error("Failed to fetch API keys:", error)
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your API key",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys([...apiKeys, data.apiKey])
        setNewKeyName("")
        toast({
          title: "Success",
          description: "API key created successfully",
        })

        // Show the newly created key
        setShowKeys({
          ...showKeys,
          [data.apiKey.id]: true,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create API key")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/user/api-keys/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter((key) => key.id !== id))
        toast({
          title: "Success",
          description: "API key deleted successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete API key")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  const toggleShowKey = (id: string) => {
    setShowKeys({
      ...showKeys,
      [id]: !showKeys[id],
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-[#1a472a] mb-8">API Keys</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-[#1a472a]">Create New API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="keyName">API Key Name</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Development, Production"
              />
            </div>
            <Button onClick={createApiKey} className="bg-[#2ea043] hover:bg-[#2ea043]/90 mt-auto" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create API Key"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1a472a]">Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">You don't have any API keys yet.</p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{apiKey.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.lastUsed && ` • Last used: ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-gray-100 p-2 rounded flex-1 font-mono text-sm overflow-x-auto">
                      {showKeys[apiKey.id] ? apiKey.key : "•".repeat(40)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => toggleShowKey(apiKey.id)}>
                      {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey.key)}>
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-[#1a472a]">API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Use your API key to authenticate requests to the VitaMend API. Include your API key in the Authorization
            header of your requests:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto mb-4">
            Authorization: Bearer YOUR_API_KEY
          </div>
          <p className="mb-2">Example request:</p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
            {`fetch('https://vitamend.com/api/v1/donations', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})`}
          </div>
          <div className="mt-4">
            <Button asChild className="bg-[#1a472a] hover:bg-[#1a472a]/90">
              <a href="/docs/api" target="_blank" rel="noreferrer">
                View Full API Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
