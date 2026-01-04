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
  const [newSpocName, setNewSpocName] = useState("")
  const [newSpocNumber, setNewSpocNumber] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [editSpocName, setEditSpocName] = useState("")
  const [editSpocNumber, setEditSpocNumber] = useState("")
  const [isEditingSpoc, setIsEditingSpoc] = useState(false)

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
        body: JSON.stringify({
          name: newSiteName,
          spocName: newSpocName,
          spocNumber: newSpocNumber,
        }),
      })
      const newSite = await response.json()
      setSites([newSite, ...sites])
      setNewSiteName("")
      setNewSpocName("")
      setNewSpocNumber("")
      setIsAdding(false)
      onSelect(newSite._id)
    } catch (error) {
      console.error("Error creating site:", error)
    }
  }

  const handleUpdateSpoc = async () => {
    if (!selectedSite) return

    try {
      const response = await fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: selectedSite._id,
          spocName: editSpocName,
          spocNumber: editSpocNumber,
        }),
      })
      const updatedSite = await response.json()
      setSites(sites.map((s) => (s._id === updatedSite._id ? updatedSite : s)))
      setSelectedSite(updatedSite)
      setIsEditingSpoc(false)
    } catch (error) {
      console.error("Error updating SPOC:", error)
    }
  }

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site)
    setEditSpocName(site.spocName || "")
    setEditSpocNumber(site.spocNumber || "")
    setIsEditingSpoc(!site.spocName && !site.spocNumber)
  }

  const handleConfirmSite = () => {
    if (selectedSite) {
      onSelect(selectedSite._id)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  if (selectedSite && !isAdding) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Site Details</h2>
          <p className="text-sm text-muted-foreground">Review and update SPOC information</p>
        </div>

        <Card className="p-4 space-y-4">
          <div>
            <Label className="text-sm font-semibold">Site Name</Label>
            <p className="text-base mt-1">{selectedSite.name}</p>
          </div>

          {!isEditingSpoc ? (
            <>
              <div>
                <Label className="text-sm font-semibold">Name</Label>
                <p className="text-base mt-1">{selectedSite.spocName || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Number</Label>
                <p className="text-base mt-1">{selectedSite.spocNumber || "Not provided"}</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsEditingSpoc(true)}>
                {selectedSite.spocName ? "Edit SPOC Details" : "Add SPOC Details"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="editSpocName">Name</Label>
                <Input
                  id="editSpocName"
                  value={editSpocName}
                  onChange={(e) => setEditSpocName(e.target.value)}
                  placeholder="Enter name"
                  type='text'
                />
              </div>
              <div>
                <Label htmlFor="editSpocNumber">Number</Label>
                <Input
                  id="editSpocNumber"
                  value={editSpocNumber}
                  onChange={(e) => setEditSpocNumber(e.target.value)}
                  placeholder="Enter number"
                  type='number'
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateSpoc} className="flex-1">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingSpoc(false)
                    setEditSpocName(selectedSite.spocName || "")
                    setEditSpocNumber(selectedSite.spocNumber || "")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </Card>

        <div className="flex gap-2">
          <Button onClick={handleConfirmSite} className="flex-1">
            Continue with this Site
          </Button>
          <Button variant="outline" onClick={() => setSelectedSite(null)}>
            Back
          </Button>
        </div>
      </div>
    )
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
              onClick={() => handleSiteClick(site)}
            >
              <div className="font-medium text-foreground">{site.name}</div>
              {site.spocName && <div className="text-sm text-muted-foreground mt-1">SPOC: {site.spocName}</div>}
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
          <div>
            <Label htmlFor="spocName">Name</Label>
            <Input
              id="spocName"
              value={newSpocName}
              onChange={(e) => setNewSpocName(e.target.value)}
              placeholder="Enter name (optional)"
            />
          </div>
          <div>
            <Label htmlFor="spocNumber">Number</Label>
            <Input
              id="spocNumber"
              value={newSpocNumber}
              type='number'
              onChange={(e) => setNewSpocNumber(e.target.value)}
              placeholder="Enter number (optional)"
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
