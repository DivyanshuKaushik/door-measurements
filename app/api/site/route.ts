import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Site } from "@/lib/models/Site"

export async function GET(request: Request) {
  try {
    await connectDB()

    const sites = await Site.find({}).sort({ createdAt: -1 })
    return NextResponse.json(sites)
  } catch (error) {
    console.error("Error fetching sites:", error)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await connectDB()
    const site = await Site.create({ name: name.trim() })
    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error("Error creating site:", error)
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 })
  }
}
