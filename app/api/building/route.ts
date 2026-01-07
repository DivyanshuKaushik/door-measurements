import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Building } from "@/lib/models/Building"
import { Flat } from "@/lib/models/Flat"
import { Measurement } from "@/lib/models/Measurement"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")
    const id = searchParams.get("id")
    await connectDB()
    if (id) {
      const building = await Building.findById(id)
      if (!building) {
        return NextResponse.json({ error: "Building not found" }, { status: 404 })
      }
      return NextResponse.json(building)
    }
    const query = siteId ? { siteId } : {}
    const buildings = await Building.find(query).sort({ createdAt: -1 })
    return NextResponse.json(buildings)
  } catch (error) {
    console.error("Error fetching buildings:", error)
    return NextResponse.json({ error: "Failed to fetch buildings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, siteId } = body

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!siteId) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 })
    }

    await connectDB()
    const building = await Building.create({ name: name.trim(), siteId })
    return NextResponse.json(building, { status: 201 })
  } catch (error) {
    console.error("Error creating building:", error)
    return NextResponse.json({ error: "Failed to create building" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get("buildingId")

    if (!buildingId) {
      return NextResponse.json({ error: "Building ID is required" }, { status: 400 })
    }

    await connectDB()

    // Delete all measurements associated with flats in this building
    const flats = await Flat.find({ buildingId })
    for (const flat of flats) {
      await Measurement.deleteMany({ flatId: flat._id })
    }

    // Delete all flats in this building
    await Flat.deleteMany({ buildingId })

    // Delete the building
    const building = await Building.findByIdAndDelete(buildingId)

    if (!building) {
      return NextResponse.json({ error: "Building not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Building and all related data deleted successfully" })
  } catch (error) {
    console.error("Error deleting building:", error)
    return NextResponse.json({ error: "Failed to delete building" }, { status: 500 })
  }
}
