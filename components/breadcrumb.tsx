"use client"

import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

interface BreadcrumbProps {
  siteName?: string
  siteId?: string | null
  buildingName?: string
  buildingId?: string | null
  flatName?: string
  flatId?: string | null
  currentStep: string
}

export function Breadcrumb({
  siteName,
  siteId,
  buildingName,
  buildingId,
  flatName,
  flatId,
  currentStep,
}: BreadcrumbProps) {
  const [buildingTitle, setBuildingTitle] = useState<string>("")
  const [flatTitle, setFlatTitle] = useState<string>("")

  useEffect(() => {
    if (buildingId && !buildingName) {
      fetch(`/api/building?id=${buildingId}`)
        .then((res) => res.json())
        .then((data) => setBuildingTitle(data.name || "Building"))
        .catch(() => setBuildingTitle("Building"))
    } else {
      setBuildingTitle(buildingName || "")
    }
  }, [buildingId, buildingName])

  useEffect(() => {
    if (flatName) {
      setFlatTitle(`Flat ${flatName}`)
    }
  }, [flatName])

  if (!siteName || currentStep === "welcome" || currentStep === "site" || currentStep === "report") {
    return null
  }

  return (
    <div className="border-b bg-muted/50">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{siteName}</span>
          {siteId && buildingTitle && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{buildingTitle}</span>
            </>
          )}
          {siteId && buildingId && flatTitle && currentStep === "flat-measurement" && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{flatTitle}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
