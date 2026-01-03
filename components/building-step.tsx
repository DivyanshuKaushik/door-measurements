"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { Building } from "@/lib/types"

interface BuildingStepProps {
  siteId: string
  onSelect: (buildingId: string) => void
}

export function BuildingStep({ siteId, onSelect }: BuildingStepProps) {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [newBuildingName, setNewBuildingName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuildings()
  }, [siteId])

  const fetchBuildings = async () => {
    try {
      const response = await fetch(`/api/building?siteId=${siteId}`)
      const data = await response.json()
      setBuildings(data)
    } catch (error) {
      console.error("Error fetching buildings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBuilding = async () => {
    if (!newBuildingName.trim()) return

    try {
      const response = await fetch("/api/building", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBuildingName, siteId }),
      })
      const newBuilding = await response.json()
      setBuildings([newBuilding, ...buildings])
      setNewBuildingName("")
      setIsAdding(false)
      onSelect(newBuilding._id)
    } catch (error) {
      console.error("Error creating building:", error)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Select Building</h2>
        <p className="text-sm text-muted-foreground">Choose an existing building or add a new one</p>
      </div>

      {buildings.length > 0 && (
        <div className="grid gap-2">
          {buildings.map((building) => (
            <Card
              key={building._id}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelect(building._id)}
            >
              <div className="font-medium text-foreground">{building.name}</div>
            </Card>
          ))}
        </div>
      )}

      {!isAdding ? (
        <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsAdding(true)}>
          Add New Building
        </Button>
      ) : (
        <Card className="p-4 space-y-3">
          <div>
            <Label htmlFor="buildingName">Building Name</Label>
            <Input
              id="buildingName"
              value={newBuildingName}
              onChange={(e) => setNewBuildingName(e.target.value)}
              placeholder="Enter building name"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddBuilding} className="flex-1">
              Add Building
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
