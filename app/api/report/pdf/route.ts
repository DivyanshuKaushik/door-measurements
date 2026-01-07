import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Flat } from "@/lib/models/Flat"
import { Measurement } from "@/lib/models/Measurement"
import { Building } from "@/lib/models/Building"
import { Site } from "@/lib/models/Site"
import { generatePDF } from "@/lib/pdf"

function getAccurateMeasurement(num:number,toMinus:number){
  const decimal = parseInt(num.toString().split(".")?.[1] || "0");
  const accuracy = decimal - toMinus;
  if(accuracy < 0 ) return (Math.floor(num)-1) + ((8-Math.abs(accuracy))/10)
  return Math.floor(num) + (accuracy/10)
 }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { siteId, buildingId, isAccurate } = body

    if (!siteId) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 })
    }

    await connectDB()

    const site = await Site.findById(siteId)
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    let buildings
    if (buildingId && buildingId !== "ALL") {
      const building = await Building.findById(buildingId)
      if (!building) {
        return NextResponse.json({ error: "Building not found" }, { status: 404 })
      }
      buildings = [building]
    } else {
      buildings = await Building.find({ siteId })
    }

    if (buildings.length === 0) {
      return NextResponse.json({ error: "No buildings found for this site" }, { status: 404 })
    }

    const buildingIds = buildings.map((b) => b._id)
    const flats = await Flat.find({ buildingId: { $in: buildingIds } })
    const flatIds = flats.map((f) => f._id)

    const measurements = await Measurement.find({ flatId: { $in: flatIds } }).populate("flatId")

    const buildingLookup = new Map()
    for (const building of buildings) {
      buildingLookup.set(building._id.toString(), building.name)
    }

    const flatToBuildingMap = new Map()
    for (const flat of flats) {
      flatToBuildingMap.set(flat._id.toString(), buildingLookup.get(flat.buildingId.toString()))
    }

    const bedroom: Array<{ flatNo: string; buildingName?: string; lengthInches: number; breadthInches: number }> = []
    const bathroom: Array<{ flatNo: string; buildingName?: string; lengthInches: number; breadthInches: number }> = []
    const mainEntry: Array<{ flatNo: string; buildingName?: string; lengthInches: number; breadthInches: number }> = []

    for (const m of measurements) {
      const flat = m.flatId as { _id: string; flatNo: string }
      const buildingName = flatToBuildingMap.get(flat._id.toString())

      const lengthInches = isAccurate ? getAccurateMeasurement(m.lengthInches, 4) : m.lengthInches
      const breadthInches = isAccurate ? getAccurateMeasurement(m.breadthInches, 2) : m.breadthInches

      const data = {
        flatNo: flat.flatNo,
        buildingName: buildings.length > 1 ? buildingName : undefined,
        lengthInches,
        breadthInches,
      }

      if (m.doorType === "BEDROOM") bedroom.push(data)
      else if (m.doorType === "BATHROOM") bathroom.push(data)
      else if (m.doorType === "MAIN_ENTRY") mainEntry.push(data)
    }

    // Sort by building then flat number
    const sortFn = (a: (typeof bedroom)[0], b: (typeof bedroom)[0]) => {
      if (buildings.length > 1) {
        const buildingCompare = (a.buildingName || "").localeCompare(b.buildingName || "")
        if (buildingCompare !== 0) return buildingCompare
      }
      return a.flatNo.localeCompare(b.flatNo)
    }

    bedroom.sort(sortFn)
    bathroom.sort(sortFn)
    mainEntry.sort(sortFn)

    const pdfBytes = await generatePDF({
      siteName: site.name,
      buildingNames: buildings.map((b) => b.name),
      isAccurate: !!isAccurate,
      bedroom,
      bathroom,
      mainEntry,
    })

    const fileName =
      buildings.length === 1
        ? `door-measurements-${site.name}-${buildings[0].name}.pdf`
        : `door-measurements-${site.name}-all-buildings.pdf`

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
