import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

interface MeasurementData {
  flatNo: string
  buildingName?: string
  lengthInches: number
  breadthInches: number
}

interface PDFData {
  siteName: string
  buildingNames: string[]
  bedroom: MeasurementData[]
  bathroom: MeasurementData[]
  mainEntry: MeasurementData[]
}

export async function generatePDF(data: PDFData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595
  const pageHeight = 842
  const margin = 50
  const lineHeight = 20

  const totalBedroomCount = data.bedroom.length
  const totalBathroomCount = data.bathroom.length
  const totalMainEntryCount = data.mainEntry.length
  const grandTotal = totalBedroomCount + totalBathroomCount + totalMainEntryCount

  const doorSections = [
    { title: "Bedroom Doors", data: data.bedroom, count: totalBedroomCount },
    { title: "Bathroom Doors", data: data.bathroom, count: totalBathroomCount },
    { title: "Main Entry Doors", data: data.mainEntry, count: totalMainEntryCount },
  ]

  const showBuildingColumn = data.buildingNames.length > 1

  for (const section of doorSections) {
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    let yPosition = pageHeight - margin

    // Header
    page.drawText("Door Measurement Report", {
      x: margin,
      y: yPosition,
      size: 22,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    yPosition -= 30

    // Site info
    page.drawText(`Site: ${data.siteName}`, {
      x: margin,
      y: yPosition,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= lineHeight

    const buildingText =
      data.buildingNames.length === 1
        ? `Building: ${data.buildingNames[0]}`
        : `Buildings: All (${data.buildingNames.length})`
    page.drawText(buildingText, {
      x: margin,
      y: yPosition,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= lineHeight

    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 35

    // Section title
    page.drawText(section.title, {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.15),
    })
    yPosition -= 30

    const col1 = margin
    const col2 = showBuildingColumn ? margin + 120 : margin + 200
    const col3 = showBuildingColumn ? margin + 280 : margin + 350
    const col4 = showBuildingColumn ? margin + 420 : null

    if (showBuildingColumn) {
      page.drawText("Building", { x: col1, y: yPosition, size: 11, font: boldFont })
      page.drawText("Flat No", { x: col2, y: yPosition, size: 11, font: boldFont })
    } else {
      page.drawText("Flat No", { x: col1, y: yPosition, size: 11, font: boldFont })
    }
    page.drawText("Length (in)", { x: col3, y: yPosition, size: 11, font: boldFont })
    if (col4) {
      page.drawText("Breadth (in)", { x: col4, y: yPosition, size: 11, font: boldFont })
    } else {
      page.drawText("Breadth (in)", { x: col3 + 150, y: yPosition, size: 11, font: boldFont })
    }

    yPosition -= 5
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: pageWidth - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    })
    yPosition -= 20

    // Data rows
    if (section.data.length === 0) {
      page.drawText("No measurements recorded", {
        x: margin,
        y: yPosition,
        size: 11,
        font,
        color: rgb(0.5, 0.5, 0.5),
      })
    } else {
      for (const measurement of section.data) {
        if (yPosition < margin + 80) {
          break
        }

        if (showBuildingColumn) {
          page.drawText(measurement.buildingName || "", { x: col1, y: yPosition, size: 10, font })
          page.drawText(measurement.flatNo, { x: col2, y: yPosition, size: 10, font })
          page.drawText(measurement.lengthInches.toFixed(1), { x: col3, y: yPosition, size: 10, font })
          page.drawText(measurement.breadthInches.toFixed(1), { x: col4!, y: yPosition, size: 10, font })
        } else {
          page.drawText(measurement.flatNo, { x: col1, y: yPosition, size: 10, font })
          page.drawText(measurement.lengthInches.toFixed(1), { x: col3, y: yPosition, size: 10, font })
          page.drawText(measurement.breadthInches.toFixed(1), { x: col3 + 150, y: yPosition, size: 10, font })
        }

        yPosition -= lineHeight
      }
    }

    const footerY = margin + 20

    page.drawText(`${section.title} Count: ${section.count}`, {
      x: margin,
      y: footerY,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })

    if (section === doorSections[doorSections.length - 1]) {
      // Only on last page
      page.drawText(`Total Doors: ${grandTotal}`, {
        x: pageWidth - margin - 120,
        y: footerY,
        size: 10,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      })
    }
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
