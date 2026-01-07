"use client"

import { useState, useEffect } from "react"
import { Ruler, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteStep } from "@/components/site-step"
import { BuildingStep } from "@/components/building-step"
import { FlatMeasurementStep } from "@/components/flat-measurement-step"
import { ReportStep } from "@/components/report-step"
import { Breadcrumb } from "@/components/breadcrumb"

type Step = "welcome" | "site" | "building" | "flat-measurement" | "report"

export default function Home() {
  const [step, setStep] = useState<Step>("welcome")
  const [siteId, setSiteId] = useState<string | null>(null)
  const [buildingId, setBuildingId] = useState<string | null>(null)
  const [siteName, setSiteName] = useState<string>("")
  const [buildingName, setBuildingName] = useState<string>("")
  const [flatName, setFlatName] = useState<string>("")

  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     navigator.serviceWorker
  //       .register("/sw.js")
  //       .then((registration) => {
  //         console.log("Service Worker registered:", registration)
  //       })
  //       .catch((error) => {
  //         console.log("Service Worker registration failed:", error)
  //       })
  //   }
  // }, [])

  useEffect(() => {
    const handlePopState = () => {
      // Prevent default browser behavior and navigate using app logic
      window.history.pushState(null, "", window.location.href)
      handleBack()
    }

    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [step])

  const handleSiteSelect = (id: string) => {
    if (!id) {
      setStep("site")
      setSiteId(null)
      setBuildingId(null)
      setSiteName("")
      setBuildingName("")
      setFlatName("")
      return
    }
    setSiteId(id)
    // Fetch site name for breadcrumb
    fetch(`/api/site?id=${id}`)
      .then((res) => res.json())
      .then((data) => setSiteName(data.name || ""))
      .catch(() => setSiteName(""))
    setStep("building")
  }

  const handleBuildingSelect = (id: string) => {
    if (!id) {
      setBuildingId(null)
      setBuildingName("")
      setFlatName("")
      setStep("building")
      return
    }
    setBuildingId(id)
    // Fetch building name for breadcrumb
    fetch(`/api/building?id=${id}`)
      .then((res) => res.json())
      .then((data) => setBuildingName(data.name || ""))
      .catch(() => setBuildingName(""))
    setStep("flat-measurement")
  }

  const handleBack = () => {
    if (step === "building") {
      setStep("site")
      setBuildingId(null)
    } else if (step === "flat-measurement") {
      setStep("building")
    } else if (step === "report") {
      setStep("welcome")
    }
  }

  const handleReset = () => {
    setStep("site")
    setSiteId(null)
    setBuildingId(null)
  }

  const handleGoToReport = () => {
    setStep("report")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Ruler className="h-5 w-5 text-primary-foreground" onClick={() => setStep("welcome")} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Door Measurement</h1>
                <p className="text-xs text-muted-foreground">Door Size Data Collection</p>
              </div>
            </div>
            {step !== "welcome" && step !== "site" && (
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {step === "site" && (
              <Button variant="outline" size="sm" onClick={() => setStep("welcome")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </div>
      </header>

      <Breadcrumb
        siteName={siteName}
        siteId={siteId}
        buildingName={buildingName}
        buildingId={buildingId}
        flatName={flatName}
        currentStep={step}
      />

      <main className="mx-auto max-w-4xl px-4 py-6">
        {step === "welcome" && (
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Ruler className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Welcome !!!</h3>
              <h2 className="text-2xl font-bold text-foreground mb-2">Kailash Wood Arts</h2>
              <p className="text-muted-foreground">Collect accurate door measurements</p>
            </div>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button size="lg" onClick={() => setStep("site")} className="w-full">
                Start
              </Button>
              <Button size="lg" variant="outline" onClick={handleGoToReport} className="w-full bg-transparent">
                Generate Report
              </Button>
            </div>
          </div>
        )}

        {step === "site" && <SiteStep onSelect={handleSiteSelect} />}
        {step === "building" && siteId && <BuildingStep siteId={siteId} onSelect={handleBuildingSelect} />}
        {step === "flat-measurement" && buildingId && <FlatMeasurementStep buildingId={buildingId} setFlatName={setFlatName} />}
        {step === "report" && <ReportStep />}
      </main>
    </div>
  )
}
