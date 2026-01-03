import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Flat } from "@/lib/models/Flat"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get("buildingId")

    await connectDB()
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
