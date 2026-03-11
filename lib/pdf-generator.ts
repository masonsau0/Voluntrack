import { UserApplication } from "./firebase/dashboard"
import { UserProfile } from "@/lib/firebase/auth"

/**
 * Generates and downloads a PDF summary of completed volunteer hours.
 * @param userProfile The current user's profile containing their name.
 * @param completedOpportunities Array of UserApplication objects filtered to status === "completed".
 */
export const generateVolunteerPDF = async (
  userProfile: UserProfile | null,
  completedOpportunities: UserApplication[]
) => {
  // Dynamically import client-only libraries to prevent SSR crashes
  const { default: jsPDF } = await import("jspdf")
  await import("jspdf-autotable")

  // Initialize document
  const doc = new jsPDF()
  
  // Format Date
  const today = new Date()
  const dateString = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  
  // Calculate total hours
  const totalHours = completedOpportunities.reduce(
    (sum, opp) => sum + (Number(opp.hours) || 0),
    0
  )

  // Configure user name
  const firstName = userProfile?.firstName || "Volunteer"
  const lastName = userProfile?.lastName || ""
  const fullName = `${firstName} ${lastName}`.trim()

  // 1. Header Section
  doc.setFontSize(22)
  doc.setTextColor(33, 37, 41) // Dark Slate
  doc.text("Voluntrack", 14, 22)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139) // Slate-500
  doc.text("Official Volunteer Record", 14, 28)

  // Right-aligned Name and Date
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42) // Slate-900
  doc.text(fullName, 196, 22, { align: "right" })
  
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139) 
  doc.text(dateString, 196, 28, { align: "right" })

  // 2. Summary Section
  doc.setLineWidth(0.5)
  doc.setDrawColor(226, 232, 240) // Slate-200
  doc.line(14, 35, 196, 35)

  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text("Summary of Verified Service", 14, 45)

  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105) // Slate-600
  doc.text(`Total Organizations: ${completedOpportunities.length}`, 14, 52)
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(2, 132, 199) // Sky-600 color for total hours
  doc.text(`Total Verified Hours: ${totalHours}`, 14, 58)
  
  // Reset font for table
  doc.setFont("helvetica", "normal")

  // 3. Table Data Preparation
  const tableColumn = [
    "Opportunity",
    "Organization",
    "Hours",
    "Date",
  ]

  const tableRows = completedOpportunities.map((opp) => {
    return [
      opp.title,
      opp.organization || "N/A",
      opp.hours,
      opp.date || "N/A",
    ]
  })

  // 4. Draw Table
  // @ts-expect-error - jspdf-autotable adds autoTable to the prototype, but TS type defs often miss it without complex augmentation
  doc.autoTable({
    startY: 65,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246], // Blue-500
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    columnStyles: {
      0: { cellWidth: 50 }, // Title
      1: { cellWidth: 50 }, // Org
      2: { cellWidth: 20 }, // Hours
      3: { cellWidth: 35 }, // Date
    },
    margin: { top: 65, left: 14, right: 14 },
    didDrawPage: (data: any) => {
      // Add footer with page numbers
      // @ts-expect-error
      const str = `Page ${doc.internal.getNumberOfPages()}`
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        str,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      )
    },
  })

  // 5. Signature Section
  // @ts-expect-error
  const finalY = doc.lastAutoTable.finalY + 30 
  
  // Only add signature if there's enough room on the page; otherwise, add a new page (autoTable usually leaves some margin, but just in case)
  if (finalY > doc.internal.pageSize.height - 40) {
    doc.addPage()
    // @ts-expect-error
    doc.setY(30)
  }

  const signatureY = finalY > doc.internal.pageSize.height - 40 ? 40 : finalY

  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text("Verified by:", 14, signatureY)
  
  doc.setLineWidth(0.5)
  doc.setDrawColor(148, 163, 184) // Slate-400
  doc.line(35, signatureY, 120, signatureY)
  
  doc.setFontSize(8)
  doc.text("(Signature / Official Stamp)", 45, signatureY + 5)

  // 6. Save the PDF
  const filename = `Volunteer_History_${firstName.replace(/\s+/g, "_")}.pdf`
  doc.save(filename)
}
