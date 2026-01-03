import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Building } from "@/lib/models/Building"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")

    await connectDB()
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
