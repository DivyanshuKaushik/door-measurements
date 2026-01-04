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
    const { name, spocName, spocNumber } = body

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await connectDB()
    const site = await Site.create({
      name: name.trim(),
      spocName: spocName?.trim(),
      spocNumber: spocNumber?.trim(),
    })
    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error("Error creating site:", error)
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { siteId, spocName, spocNumber } = body

    if (!siteId) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 })
    }

    await connectDB()
    const site = await Site.findByIdAndUpdate(
      siteId,
      { spocName: spocName?.trim(), spocNumber: spocNumber?.trim() },
      { new: true },
    )

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error("Error updating site:", error)
    return NextResponse.json({ error: "Failed to update site" }, { status: 500 })
  }
}
