import PDFDocument from 'pdfkit';
import Activity from '../models/Activity.js';
import PackingItem from '../models/PackingItem.js';
import { generateDayList } from '../utils/dateUtils.js';

export const exportTripItineraryPdf = async (req, res, next) => {
  try {
    const trip = req.trip; // populated by authorizeTrip middleware
    const dayList = generateDayList(trip.startDate, trip.endDate);
    const activities = await Activity.find({ tripId: trip._id }).sort({ dayNumber: 1, order: 1 });
    const packingItems = await PackingItem.find({ tripId: trip._id }).sort({ isPacked: -1, label: 1 });

    const totalPlannedCost = activities.reduce((sum, act) => sum + (act.cost || 0), 0);
    const remainingBudget = (trip.budget || 0) - totalPlannedCost;

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: `${trip.title} - Itinerary`,
        Author: 'TripMate Travel Planner',
      },
    });

    const filename = `${trip.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Itinerary.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header Styling
    doc.rect(40, 40, doc.page.width - 80, 75).fill('#234638');

    doc
      .fillColor('#FFFFFF')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('TripMate', 55, 55);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#A8B8A0')
      .text('TRAVEL ITINERARY & EXPENSE SUMMARY', 55, 82);

    doc.moveDown(3);

    // Trip Info Banner
    const startY = 130;
    doc
      .fillColor('#252525')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(trip.title, 40, startY);

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#46745f')
      .text(`Destination: ${trip.destination}`, 40, startY + 26);

    const startStr = new Date(trip.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const endStr = new Date(trip.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });

    doc
      .fontSize(11)
      .fillColor('#666666')
      .text(`Dates: ${startStr} - ${endStr} (${dayList.length} Days)`, 40, startY + 44);

    // Budget Summary Box
    const budgetBoxY = startY + 68;
    doc.rect(40, budgetBoxY, doc.page.width - 80, 50).fillAndStroke('#F8F7F2', '#E7D8C5');

    doc
      .fillColor('#234638')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`BUDGET: ${trip.currency} ${trip.budget?.toLocaleString() || 0}`, 55, budgetBoxY + 14);

    doc
      .fillColor('#252525')
      .text(`PLANNED COSTS: ${trip.currency} ${totalPlannedCost.toLocaleString()}`, 220, budgetBoxY + 14);

    doc
      .fillColor(remainingBudget >= 0 ? '#234638' : '#B91C1C')
      .text(`REMAINING: ${trip.currency} ${remainingBudget.toLocaleString()}`, 400, budgetBoxY + 14);

    doc.moveDown(5);

    let currentY = budgetBoxY + 70;

    // Itinerary Section
    doc
      .fillColor('#234638')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('DAY-BY-DAY ITINERARY', 40, currentY);

    currentY += 24;

    for (const day of dayList) {
      if (currentY > doc.page.height - 120) {
        doc.addPage();
        currentY = 40;
      }

      // Day Header
      doc.rect(40, currentY, doc.page.width - 80, 24).fill('#E7D8C5');
      doc
        .fillColor('#234638')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Day ${day.dayNumber} — ${day.formattedDate}`, 48, currentY + 6);

      currentY += 32;

      const dayActivities = activities.filter((a) => a.dayNumber === day.dayNumber);

      if (dayActivities.length === 0) {
        doc
          .fillColor('#888888')
          .fontSize(10)
          .font('Helvetica-Oblique')
          .text('No scheduled activities for this day.', 50, currentY);
        currentY += 20;
      } else {
        for (const act of dayActivities) {
          if (currentY > doc.page.height - 80) {
            doc.addPage();
            currentY = 40;
          }

          const timeLabel = act.time ? `[${act.time}] ` : '';
          doc
            .fillColor('#252525')
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(`${timeLabel}${act.title}`, 50, currentY);

          const costStr = act.cost > 0 ? `(${trip.currency} ${act.cost})` : '';
          doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#46745f')
            .text(`Category: ${act.category} ${costStr}`, 50, currentY + 14);

          if (act.location?.name) {
            doc
              .fontSize(9)
              .fillColor('#666666')
              .text(`Location: ${act.location.name}`, 50, currentY + 26);
            currentY += 12;
          }

          if (act.notes) {
            doc
              .fontSize(9)
              .font('Helvetica-Oblique')
              .fillColor('#777777')
              .text(`Note: ${act.notes}`, 50, currentY + 26);
            currentY += 12;
          }

          currentY += 32;
        }
      }
      currentY += 10;
    }

    // Packing checklist section
    if (packingItems.length > 0) {
      if (currentY > doc.page.height - 140) {
        doc.addPage();
        currentY = 40;
      }

      doc
        .fillColor('#234638')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PACKING CHECKLIST', 40, currentY);

      currentY += 24;

      for (const item of packingItems) {
        if (currentY > doc.page.height - 40) {
          doc.addPage();
          currentY = 40;
        }
        const checkMark = item.isPacked ? '[X]' : '[  ]';
        doc
          .fillColor(item.isPacked ? '#234638' : '#444444')
          .fontSize(10)
          .font('Helvetica')
          .text(`${checkMark}  ${item.label} (${item.category || 'General'})`, 50, currentY);

        currentY += 18;
      }
    }

    // Footer with generation timestamp
    doc
      .fontSize(8)
      .fillColor('#999999')
      .text(
        `Generated by TripMate on ${new Date().toLocaleDateString('en-US')} • Have a safe and memorable journey!`,
        40,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 80 }
      );

    doc.end();
  } catch (error) {
    next(error);
  }
};
