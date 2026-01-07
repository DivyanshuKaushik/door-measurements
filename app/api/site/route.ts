import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Site } from "@/lib/models/Site"
import { Building } from "@/lib/models/Building"
import { Flat } from "@/lib/models/Flat"
import { Measurement } from "@/lib/models/Measurement"

export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const site = await Site.findById(id)
      if (!site) {
        return NextResponse.json({ error: "Site not found" }, { status: 404 })
      }
      return NextResponse.json(site)
    }

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")

    if (!siteId) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 })
    }

    await connectDB()

    // Delete all measurements and flats associated with buildings in this site
    const buildings = await Building.find({ siteId })
    for (const building of buildings) {
      const flats = await Flat.find({ buildingId: building._id })
      for (const flat of flats) {
        await Measurement.deleteMany({ flatId: flat._id })
      }
      await Flat.deleteMany({ buildingId: building._id })
    }

    // Delete all buildings in this site
    await Building.deleteMany({ siteId })

    // Delete the site
    const site = await Site.findByIdAndDelete(siteId)

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Site and all related data deleted successfully" })
  } catch (error) {
    console.error("Error deleting site:", error)
    return NextResponse.json({ error: "Failed to delete site" }, { status: 500 })
  }
}
