"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { Building } from "@/lib/types"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface BuildingStepProps {
  siteId: string
  onSelect: (buildingId: string) => void
}

export function BuildingStep({ siteId, onSelect }: BuildingStepProps) {
  const { toast } = useToast()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
  const [newBuildingName, setNewBuildingName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openDropdown, setOpenDropdown] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDeleteBuilding = async (buildingId: string, buildingName: string) => {
    try {
      const response = await fetch(`/api/building?buildingId=${buildingId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setBuildings(buildings.filter((b) => b._id !== buildingId))
        if (selectedBuildingId === buildingId) {
          setSelectedBuildingId(null)
          onSelect("")
        }
        setDeletingId(null)
        toast({
          title: "Success",
          description: `Building "${buildingName}" and all related data have been deleted.`,
        })
      } else {
        throw new Error("Failed to delete building")
      }
    } catch (error) {
      console.error("Error deleting building:", error)
      toast({
        title: "Error",
        description: "Failed to delete building",
        variant: "destructive",
      })
      setDeletingId(null)
    }
  }

  const handleSelectChange = (value: string) => {
    setSelectedBuildingId(value)
    onSelect(value)
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Select Building</h2>
        <p className="text-sm text-muted-foreground">Choose a building from the dropdown or delete one</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Building</Label>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
              {buildings.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">No buildings available</div>
              ) : (
                buildings.map((building) => (
                  <div
                    key={building._id}
                    className="flex items-center justify-between gap-2 p-3 hover:bg-accent rounded-md border-b last:border-b-0"
                  >
                    <button
                      onClick={() => {
                        setSelectedBuildingId(building._id)
                        onSelect(building._id)
                      }}
                      className="flex-1 text-left text-sm hover:font-medium transition-all"
                    >
                      {building.name}
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingId(building._id)
                          }}
                          className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Building</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{building.name}"? This will also delete all flats and
                          measurements associated with this building.
                        </AlertDialogDescription>
                        <div className="flex gap-2">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBuilding(building._id, building.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {!isAdding ? (
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsAdding(true)}>
            Add New Building
          </Button>
        ) : (
          <div className="space-y-3 pt-4 border-t">
            <div>
              <Label htmlFor="buildingName">Building Name</Label>
              <Input
                id="buildingName"
                value={newBuildingName}
                onChange={(e) => setNewBuildingName(e.target.value)}
                placeholder="Enter building name"
                autoFocus
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
          </div>
        )}
      </Card>
    </div>
  )
}
