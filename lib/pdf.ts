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
  isAccurate?: boolean
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
  const rowHeight = 20 // increased for better padding

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
    const colPadding = 5
    const col1 = columnX + colPadding
    const col2 = showBuildingColumn ? columnX + 50 : columnX + 65
    const col3 = showBuildingColumn ? columnX + 115 : columnX + 135
    const col4 = showBuildingColumn ? columnX + 190 : columnX + 205

    // Draw header background
    page.drawRectangle({
      x: columnX,
      y: yPos - rowHeight + 5,
      width: columnWidth,
      height: rowHeight,
      color: rgb(0.95, 0.95, 0.95),
    })

    // Draw header border
    page.drawRectangle({
      x: columnX,
      y: yPos - rowHeight + 5,
      width: columnWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    })

    const textY = yPos - 10
    if (showBuildingColumn) {
      page.drawText("Building", { x: col1, y: textY, size: 8, font: boldFont })
      page.drawText("Flat", { x: col2, y: textY, size: 8, font: boldFont })
    } else {
      page.drawText("Flat No", { x: col1, y: textY, size: 8, font: boldFont })
    }
    page.drawText("Height (in)", { x: col3, y: textY, size: 8, font: boldFont })
    page.drawText("Width (in)", { x: col4, y: textY, size: 8, font: boldFont })

    return yPos - rowHeight
  }

  const drawRow = (page: any, yPos: number, columnX: number, data: MeasurementData) => {
    const colPadding = 5
    const col1 = columnX + colPadding
    const col2 = showBuildingColumn ? columnX + 50 : columnX + 65
    const col3 = showBuildingColumn ? columnX + 115 : columnX + 135
    const col4 = showBuildingColumn ? columnX + 190 : columnX + 205

    // Draw cell border
    page.drawRectangle({
      x: columnX,
      y: yPos,
      width: columnWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    })

    const textY = yPos + 6
    if (showBuildingColumn) {
      page.drawText(data.buildingName || "", { x: col1, y: textY, size: 8, font })
      page.drawText(data.flatNo, { x: col2, y: textY, size: 8, font })
      page.drawText(data.lengthInches.toFixed(1), { x: col3, y: textY, size: 8, font })
      page.drawText(data.breadthInches.toFixed(1), { x: col4, y: textY, size: 8, font })
    } else {
      page.drawText(data.flatNo, { x: col1, y: textY, size: 8, font })
      page.drawText(data.lengthInches.toFixed(1), { x: col3, y: textY, size: 8, font })
      page.drawText(data.breadthInches.toFixed(1), { x: col4, y: textY, size: 8, font })
    }
  }

  for (const section of doorSections) {
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
    let yPosition = pageHeight - margin
    let pageNumber = 1
    let currentColumn: "left" | "right" = "left"
    let leftHeaderDrawn = false
    let rightHeaderDrawn = false
    let pageStartY = yPosition

    // Header
    currentPage.drawText("Door Measurement Report", {
      x: margin,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    yPosition -= 25

    currentPage.drawText(`Report Type: ${data.isAccurate ? 'Accurate Calculated)' : "Default"}`, {
      x: margin,
      y: yPosition,
      size: 9,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 15

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
              y: leftYPosition - 10,
              size: 14,
              font: boldFont,
              color: rgb(0.15, 0.15, 0.15),
            })
            leftYPosition -= 35
            rightYPosition = leftYPosition
            pageStartY = leftYPosition

            leftYPosition = drawTableHeader(currentPage, leftYPosition, leftColumnX)
            leftHeaderDrawn = true
          }

          drawRow(currentPage, leftYPosition - rowHeight, leftColumnX, measurement)
          leftYPosition -= rowHeight
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
              y: rightYPosition - 10,
              size: 14,
              font: boldFont,
              color: rgb(0.15, 0.15, 0.15),
            })
            rightYPosition -= 35
            leftYPosition = rightYPosition
            pageStartY = rightYPosition

            rightYPosition = drawTableHeader(currentPage, rightYPosition, rightColumnX)
            rightHeaderDrawn = true
          }

          drawRow(currentPage, rightYPosition - rowHeight, rightColumnX, measurement)
          rightYPosition -= rowHeight
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
