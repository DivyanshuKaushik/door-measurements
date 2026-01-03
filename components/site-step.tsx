"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { Site } from "@/lib/types"

interface SiteStepProps {
  onSelect: (siteId: string) => void
}

export function SiteStep({ onSelect }: SiteStepProps) {
  const [sites, setSites] = useState<Site[]>([])
  const [newSiteName, setNewSiteName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const response = await fetch("/api/site")
      const data = await response.json()
      setSites(data)
    } catch (error) {
      console.error("Error fetching sites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSite = async () => {
    if (!newSiteName.trim()) return

    try {
      const response = await fetch("/api/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSiteName }),
      })
      const newSite = await response.json()
      setSites([newSite, ...sites])
      setNewSiteName("")
      setIsAdding(false)
      onSelect(newSite._id)
    } catch (error) {
      console.error("Error creating site:", error)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Select Site</h2>
        <p className="text-sm text-muted-foreground">Choose an existing site or add a new one</p>
      </div>

      {sites.length > 0 && (
        <div className="grid gap-2">
          {sites.map((site) => (
            <Card
              key={site._id}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelect(site._id)}
            >
              <div className="font-medium text-foreground">{site.name}</div>
            </Card>
          ))}
        </div>
      )}

      {!isAdding ? (
        <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsAdding(true)}>
          Add New Site
        </Button>
      ) : (
        <Card className="p-4 space-y-3">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              placeholder="Enter site name"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddSite} className="flex-1">
              Add Site
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
