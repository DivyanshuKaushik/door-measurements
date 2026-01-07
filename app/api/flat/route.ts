import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Flat } from "@/lib/models/Flat"
import { Measurement } from "@/lib/models/Measurement"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get("buildingId")
    const id = searchParams.get("id")

    await connectDB()

    if (id) {
      const flat = await Flat.findById(id)
      if (!flat) {
        return NextResponse.json({ error: "Flat not found" }, { status: 404 })
      }
      return NextResponse.json(flat)
    }
    const query = buildingId ? { buildingId } : {}
    const flats = await Flat.find(query).sort({ createdAt: -1 })
    return NextResponse.json(flats)
  } catch (error) {
    console.error("Error fetching flats:", error)
    return NextResponse.json({ error: "Failed to fetch flats" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { flatNo, buildingId } = body

    if (!flatNo || flatNo.trim() === "") {
      return NextResponse.json({ error: "Flat number is required" }, { status: 400 })
    }

    if (!buildingId) {
      return NextResponse.json({ error: "Building ID is required" }, { status: 400 })
    }

    await connectDB()
    const flat = await Flat.create({ flatNo: flatNo.trim(), buildingId })
    return NextResponse.json(flat, { status: 201 })
  } catch (error) {
    console.error("Error creating flat:", error)
    return NextResponse.json({ error: "Failed to create flat" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const flatId = searchParams.get("flatId")

    if (!flatId) {
      return NextResponse.json({ error: "Flat ID is required" }, { status: 400 })
    }

    await connectDB()

    // Delete all measurements associated with this flat
    await Measurement.deleteMany({ flatId })

    // Delete the flat
    const flat = await Flat.findByIdAndDelete(flatId)

    if (!flat) {
      return NextResponse.json({ error: "Flat not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Flat and all related measurements deleted successfully" })
  } catch (error) {
    console.error("Error deleting flat:", error)
    return NextResponse.json({ error: "Failed to delete flat" }, { status: 500 })
  }
}
