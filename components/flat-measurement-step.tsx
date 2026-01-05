"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import type { Flat, DoorType } from "@/lib/types"

interface FlatMeasurementStepProps {
  buildingId: string
}

export function FlatMeasurementStep({ buildingId }: FlatMeasurementStepProps) {
  const { toast } = useToast()
  const [flats, setFlats] = useState<Flat[]>([])
  const [selectedFlat, setSelectedFlat] = useState<string | null>(null)
  const [newFlatNo, setNewFlatNo] = useState("")
  const [isAddingFlat, setIsAddingFlat] = useState(false)
  const [loading, setLoading] = useState(true)

  // Measurement states
  const [doorType, setDoorType] = useState<DoorType | null>(null)
  const [lengthInches, setLengthInches] = useState("")
  const [breadthInches, setBreadthInches] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchFlats()
  }, [buildingId])

  const fetchFlats = async () => {
    try {
      const response = await fetch(`/api/flat?buildingId=${buildingId}`)
      const data = await response.json()
      setFlats(data)
    } catch (error) {
      console.error("Error fetching flats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFlat = async () => {
    if (!newFlatNo.trim()) return

    try {
      const response = await fetch("/api/flat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flatNo: newFlatNo, buildingId }),
      })
      const newFlat = await response.json()
      setFlats([newFlat, ...flats])
      setNewFlatNo("")
      setIsAddingFlat(false)
      setSelectedFlat(newFlat._id)
    } catch (error) {
      console.error("Error creating flat:", error)
      toast({
        title: "Error",
        description: "Failed to add flat",
        variant: "destructive",
      })
    }
  }

  const handleSaveMeasurement = async () => {
    if (!selectedFlat || !doorType || !lengthInches || !breadthInches) return

    setSaving(true)
    try {
      const response = await fetch("/api/measurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flatId: selectedFlat,
          doorType,
          lengthInches: Number(lengthInches),
          breadthInches: Number(breadthInches),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Measurement saved successfully",
        })
        setDoorType(null)
        setLengthInches("")
        setBreadthInches("")
      } else {
        throw new Error("Failed to save measurement")
      }
    } catch (error) {
      console.error("Error saving measurement:", error)
      toast({
        title: "Error",
        description: "Failed to save measurement",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Select Flat & Add Measurements</h2>
        <p className="text-sm text-muted-foreground">Choose a flat, then select door type and enter measurements</p>
      </div>

      {/* Flat Selection */}
      <Card className="p-4 space-y-4">
        <Label>Select Flat</Label>
        {flats.length > 0 && (
          <div className="grid gap-2">
            {flats.map((flat) => (
              <Card
                key={flat._id}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                  selectedFlat === flat._id ? "bg-primary/10 border-primary" : ""
                }`}
                onClick={() => setSelectedFlat(flat._id)}
              >
                <div className="font-medium text-foreground">Flat {flat.flatNo}</div>
              </Card>
            ))}
          </div>
        )}

        {!isAddingFlat ? (
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsAddingFlat(true)}>
            Add New Flat
          </Button>
        ) : (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <Label htmlFor="flatNo">Flat Number</Label>
              <Input
                id="flatNo"
                value={newFlatNo}
                onChange={(e) => setNewFlatNo(e.target.value)}
                placeholder="Enter flat number"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddFlat} className="flex-1">
                Add Flat
              </Button>
              <Button variant="outline" onClick={() => setIsAddingFlat(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Door Type Selection - Only visible when flat is selected */}
      {selectedFlat && (
        <Card className="p-4 space-y-4">
          <Label>Door Type</Label>
          <RadioGroup value={doorType || ""} onValueChange={(value) => setDoorType(value as DoorType)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BEDROOM" id="bedroom" />
              <Label htmlFor="bedroom" className="cursor-pointer">
                Bedroom Door
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BATHROOM" id="bathroom" />
              <Label htmlFor="bathroom" className="cursor-pointer">
                Bathroom Door
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="MAIN_ENTRY" id="main" />
              <Label htmlFor="main" className="cursor-pointer">
                Main Entry Door
              </Label>
            </div>
          </RadioGroup>
        </Card>
      )}

      {/* Measurement Inputs - Only visible when door type is selected */}
      {selectedFlat && doorType && (
        <Card className="p-4 space-y-4">
          <Label>Door Measurements</Label>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="length">Height (inches)</Label>
              <Input
                id="length"
                type="number"
                value={lengthInches}
                onChange={(e) => setLengthInches(e.target.value)}
                placeholder="Enter height"
              />
            </div>
            <div>
              <Label htmlFor="breadth">Width (inches)</Label>
              <Input
                id="breadth"
                type="number"
                value={breadthInches}
                onChange={(e) => setBreadthInches(e.target.value)}
                placeholder="Enter width"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveMeasurement}
            disabled={!lengthInches || !breadthInches || saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Measurement"}
          </Button>
        </Card>
      )}
    </div>
  )
}
