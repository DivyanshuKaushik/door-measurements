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
  const margin = 40
  const lineHeight = 16
  const columnGap = 15

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

  const columnWidth = (pageWidth - 2 * margin - columnGap) / 2
  const leftColumnX = margin
  const rightColumnX = margin + columnWidth + columnGap

  // Helper function to draw table header in a column
  const drawTableHeader = (page: any, yPos: number, columnX: number) => {
    const col1 = columnX
    const col2 = showBuildingColumn ? columnX + 50 : columnX + 65
    const col3 = showBuildingColumn ? columnX + 115 : columnX + 135
    const col4 = showBuildingColumn ? columnX + 190 : columnX + 205

    if (showBuildingColumn) {
      page.drawText("Building", { x: col1, y: yPos, size: 8, font: boldFont })
      page.drawText("Flat", { x: col2, y: yPos, size: 8, font: boldFont })
    } else {
      page.drawText("Flat No", { x: col1, y: yPos, size: 8, font: boldFont })
    }
    page.drawText("Length (in)", { x: col3, y: yPos, size: 8, font: boldFont })
    page.drawText("Breadth (in)", { x: col4, y: yPos, size: 8, font: boldFont })

    const lineY = yPos - 3
    page.drawLine({
      start: { x: columnX, y: lineY },
      end: { x: columnX + columnWidth, y: lineY },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })

    return lineY - 15
  }

  for (const section of doorSections) {
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    let yPosition = pageHeight - margin
    let pageNumber = 1

    // Header
    currentPage.drawText("Door Measurement Report", {
      x: margin,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    yPosition -= 25

    // Site info
    currentPage.drawText(`Site: ${data.siteName}`, {
      x: margin,
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 15

    const buildingText =
      data.buildingNames.length === 1
        ? `Building: ${data.buildingNames[0]}`
        : `Buildings: All (${data.buildingNames.length})`
    currentPage.drawText(buildingText, {
      x: margin,
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 15

    currentPage.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 30

    // Section title
    currentPage.drawText(section.title, {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.15),
    })
    yPosition -= 25

    let leftYPosition = yPosition
    let rightYPosition = yPosition
    let currentColumn: "left" | "right" = "left"
    let leftHeaderDrawn = false
    let rightHeaderDrawn = false

    if (section.data.length === 0) {
      currentPage.drawText("No measurements recorded", {
        x: margin,
        y: yPosition,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      })
    } else {
      for (let i = 0; i < section.data.length; i++) {
        const measurement = section.data[i]

        // Determine which column to use
        if (currentColumn === "left") {
          if (!leftHeaderDrawn) {
            leftYPosition = drawTableHeader(currentPage, leftYPosition, leftColumnX)
            leftHeaderDrawn = true
          }

          // Check if we need a new page
          if (leftYPosition < margin + 60) {
            pageNumber++
            currentPage = pdfDoc.addPage([pageWidth, pageHeight])
            leftYPosition = pageHeight - margin
            rightYPosition = pageHeight - margin
            leftHeaderDrawn = false
            rightHeaderDrawn = false

            // Add continuation header
            currentPage.drawText(`${section.title} (continued)`, {
              x: margin,
              y: leftYPosition,
              size: 14,
              font: boldFont,
              color: rgb(0.15, 0.15, 0.15),
            })
            leftYPosition -= 25
            rightYPosition = leftYPosition

            leftYPosition = drawTableHeader(currentPage, leftYPosition, leftColumnX)
            leftHeaderDrawn = true
          }

          // Draw in left column
          const col1 = leftColumnX
          const col2 = showBuildingColumn ? leftColumnX + 50 : leftColumnX + 65
          const col3 = showBuildingColumn ? leftColumnX + 115 : leftColumnX + 135
          const col4 = showBuildingColumn ? leftColumnX + 190 : leftColumnX + 205

          if (showBuildingColumn) {
            currentPage.drawText(measurement.buildingName || "", { x: col1, y: leftYPosition, size: 8, font })
            currentPage.drawText(measurement.flatNo, { x: col2, y: leftYPosition, size: 8, font })
            currentPage.drawText(measurement.lengthInches.toFixed(1), { x: col3, y: leftYPosition, size: 8, font })
            currentPage.drawText(measurement.breadthInches.toFixed(1), { x: col4, y: leftYPosition, size: 8, font })
          } else {
            currentPage.drawText(measurement.flatNo, { x: col1, y: leftYPosition, size: 8, font })
            currentPage.drawText(measurement.lengthInches.toFixed(1), { x: col3, y: leftYPosition, size: 8, font })
            currentPage.drawText(measurement.breadthInches.toFixed(1), { x: col4, y: leftYPosition, size: 8, font })
          }

          leftYPosition -= lineHeight
          currentColumn = "right"
        } else {
          if (!rightHeaderDrawn) {
            rightYPosition = drawTableHeader(currentPage, rightYPosition, rightColumnX)
            rightHeaderDrawn = true
          }

          // Check if we need a new page
          if (rightYPosition < margin + 60) {
            pageNumber++
            currentPage = pdfDoc.addPage([pageWidth, pageHeight])
            leftYPosition = pageHeight - margin
            rightYPosition = pageHeight - margin
            leftHeaderDrawn = false
            rightHeaderDrawn = false

            // Add continuation header
            currentPage.drawText(`${section.title} (continued)`, {
              x: margin,
              y: rightYPosition,
              size: 14,
              font: boldFont,
              color: rgb(0.15, 0.15, 0.15),
            })
            rightYPosition -= 25
            leftYPosition = rightYPosition

            rightYPosition = drawTableHeader(currentPage, rightYPosition, rightColumnX)
            rightHeaderDrawn = true
          }

          // Draw in right column
          const col1 = rightColumnX
          const col2 = showBuildingColumn ? rightColumnX + 50 : rightColumnX + 65
          const col3 = showBuildingColumn ? rightColumnX + 115 : rightColumnX + 135
          const col4 = showBuildingColumn ? rightColumnX + 190 : rightColumnX + 205

          if (showBuildingColumn) {
            currentPage.drawText(measurement.buildingName || "", { x: col1, y: rightYPosition, size: 8, font })
            currentPage.drawText(measurement.flatNo, { x: col2, y: rightYPosition, size: 8, font })
            currentPage.drawText(measurement.lengthInches.toFixed(1), { x: col3, y: rightYPosition, size: 8, font })
            currentPage.drawText(measurement.breadthInches.toFixed(1), { x: col4, y: rightYPosition, size: 8, font })
          } else {
            currentPage.drawText(measurement.flatNo, { x: col1, y: rightYPosition, size: 8, font })
            currentPage.drawText(measurement.lengthInches.toFixed(1), { x: col3, y: rightYPosition, size: 8, font })
            currentPage.drawText(measurement.breadthInches.toFixed(1), { x: col4, y: rightYPosition, size: 8, font })
          }

          rightYPosition -= lineHeight
          currentColumn = "left"
        }
      }
    }

    const footerY = margin + 15

    currentPage.drawText(`${section.title} Count: ${section.count}`, {
      x: margin,
      y: footerY,
      size: 9,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })

    if (section === doorSections[doorSections.length - 1]) {
      currentPage.drawText(`Total Doors: ${grandTotal}`, {
        x: pageWidth - margin - 100,
        y: footerY,
        size: 9,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      })
    }
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
