import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Measurement, DoorType } from "@/lib/models/Measurement"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const flatId = searchParams.get("flatId")
    const doorType = searchParams.get("doorType")
    const buildingId = searchParams.get("buildingId")

    await connectDB()

    if (flatId && doorType) {
      const measurement = await Measurement.findOne({ flatId, doorType })
      return NextResponse.json(measurement ? [measurement] : [])
    }

    if (flatId) {
      const measurements = await Measurement.find({ flatId }).sort({ doorType: 1 })
      return NextResponse.json(measurements)
    }

    if (buildingId) {
      const measurements = await Measurement.find().populate({
        path: "flatId",
        match: { buildingId },
      })
      const filtered = measurements.filter((m) => m.flatId != null)
      return NextResponse.json(filtered)
    }

    const measurements = await Measurement.find().sort({ createdAt: -1 })
    return NextResponse.json(measurements)
  } catch (error) {
    console.error("Error fetching measurements:", error)
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { flatId, doorType, lengthInches, breadthInches } = body

    if (!flatId) {
      return NextResponse.json({ error: "Flat ID is required" }, { status: 400 })
    }

    if (!doorType || !Object.values(DoorType).includes(doorType)) {
      return NextResponse.json({ error: "Valid door type is required" }, { status: 400 })
    }

    if (lengthInches == null || lengthInches < 0) {
      return NextResponse.json({ error: "Valid length is required" }, { status: 400 })
    }

    if (breadthInches == null || breadthInches < 0) {
      return NextResponse.json({ error: "Valid breadth is required" }, { status: 400 })
    }

    await connectDB()

    const existing = await Measurement.findOne({ flatId, doorType })
    if (existing) {
      existing.lengthInches = lengthInches
      existing.breadthInches = breadthInches
      await existing.save()
      return NextResponse.json(existing)
    }

    const measurement = await Measurement.create({
      flatId,
      doorType,
      lengthInches,
      breadthInches,
    })
    return NextResponse.json(measurement, { status: 201 })
  } catch (error) {
    console.error("Error creating/updating measurement:", error)
    return NextResponse.json({ error: "Failed to save measurement" }, { status: 500 })
  }
}
