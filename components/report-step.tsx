"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Site, Building } from "@/lib/types"

export function ReportStep() {
  const { toast } = useToast()
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchSites()
  }, [])

  useEffect(() => {
    if (selectedSite) {
      fetchBuildings(selectedSite)
    }
  }, [selectedSite])

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

  const fetchBuildings = async (siteId: string) => {
    try {
      const response = await fetch(`/api/building?siteId=${siteId}`)
      const data = await response.json()
      setBuildings(data)
      setSelectedBuilding(null)
    } catch (error) {
      console.error("Error fetching buildings:", error)
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedSite) {
      toast({
        title: "Error",
        description: "Please select a site",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    try {
      const response = await fetch("/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: selectedSite,
          buildingId: selectedBuilding || "ALL",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `door-measurements-report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Report generated successfully",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Generate Report</h2>
        <p className="text-sm text-muted-foreground">Select a site and optionally a specific building</p>
      </div>

      {/* Site Selection */}
      <Card className="p-4 space-y-4">
        <Label>Select Site</Label>
        {sites.length > 0 ? (
          <div className="grid gap-2">
            {sites.map((site) => (
              <Card
                key={site._id}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                  selectedSite === site._id ? "bg-primary/10 border-primary" : ""
                }`}
                onClick={() => setSelectedSite(site._id)}
              >
                <div className="font-medium text-foreground">{site.name}</div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No sites available</div>
        )}
      </Card>

      {/* Building Selection */}
      {selectedSite && buildings.length > 0 && (
        <Card className="p-4 space-y-4">
          <Label>Select Building (Optional)</Label>
          <div className="grid gap-2">
            <Card
              className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                selectedBuilding === null ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => setSelectedBuilding(null)}
            >
              <div className="font-medium text-foreground">All Buildings</div>
            </Card>
            {buildings.map((building) => (
              <Card
                key={building._id}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                  selectedBuilding === building._id ? "bg-primary/10 border-primary" : ""
                }`}
                onClick={() => setSelectedBuilding(building._id)}
              >
                <div className="font-medium text-foreground">{building.name}</div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Generate Button */}
      <Button onClick={handleGenerateReport} disabled={!selectedSite || generating} className="w-full" size="lg">
        <FileDown className="h-5 w-5 mr-2" />
        {generating ? "Generating..." : "Generate PDF Report"}
      </Button>
    </div>
  )
}
