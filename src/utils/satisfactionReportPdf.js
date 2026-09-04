import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCollegeDateTime } from './dateTime.js';

/**
 * Generates and downloads an institutional-grade PDF Student Satisfaction Report.
 *
 * @param {object} params
 * @param {string} params.periodLabel - e.g. "Today", "Last 7 Days", "Last 30 Days", "Custom Range"
 * @param {string} params.startDate - YYYY-MM-DD
 * @param {string} params.endDate - YYYY-MM-DD
 * @param {object} params.metrics - { avgRating, totalRatings, satisfactionRate, positiveRatings, lowRatings, feedbackCount, status }
 * @param {Array} params.mealStats - [{ category, name, avgRating, totalRatings, satisfactionRate, feedbackCount }]
 * @param {Array} params.lowRatedMeals - [{ name, category, avgRating, count }]
 * @param {Array} params.topMeals - [{ name, category, avgRating, count }]
 * @param {Array} params.feedbackThemes - [{ name, count }]
 * @param {Array} params.recentFeedback - [{ rating, comment, mealName, date }]
 * @param {number} params.complaintsCount - Total complaints in period
 * @param {string} params.generatedBy - User name or role
 */
export const generateSatisfactionPdf = ({
  periodLabel = 'Today',
  startDate,
  endDate,
  metrics = {},
  mealStats = [],
  lowRatedMeals = [],
  topMeals = [],
  feedbackThemes = [],
  recentFeedback = [],
  complaintsCount = 0,
  generatedBy = 'Authorized Staff'
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let cursorY = margin;

  const EMERALD = [5, 150, 105];
  const DARK_SLATE = [15, 23, 42];
  const MUTED_SLATE = [100, 116, 139];
  const LIGHT_BG = [248, 250, 252];
  const BORDER_COLOR = [226, 232, 240];

  // ── HEADER BANNER ──────────────────────────────────────────────────────────
  doc.setFillColor(...EMERALD);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MESSMATES • ABES ENGINEERING COLLEGE', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('STUDENT SATISFACTION & DINING EXPERIENCE REPORT', margin, 18);

  doc.setFontSize(8);
  doc.text('Institutional Dining Quality Oversight System • Ghaziabad, UP', margin, 24);

  cursorY = 35;

  // ── METADATA BAR ───────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 18, 2, 2, 'FD');

  const generatedTime = formatCollegeDateTime(new Date());
  const dateRangeStr = startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_SLATE);
  doc.text('Report Period:', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${periodLabel} (${dateRangeStr})`, margin + 28, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Generated At:', margin + 4, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(generatedTime, margin + 28, cursorY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Target Population:', pageWidth / 2 + 10, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('Hostel Residents (~3,000 Students)', pageWidth / 2 + 40, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Authorized By:', pageWidth / 2 + 10, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(generatedBy, pageWidth / 2 + 40, cursorY + 12);

  cursorY += 24;

  // ── SECTION 1: EXECUTIVE SUMMARY ───────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK_SLATE);
  doc.text('1. EXECUTIVE SATISFACTION SUMMARY', margin, cursorY);
  cursorY += 4;

  const cardWidth = (pageWidth - margin * 2 - 12) / 5;
  const cardHeight = 18;
  const statCards = [
    { label: 'Satisfaction Rate', val: metrics.satisfactionRate !== null ? `${metrics.satisfactionRate}%` : 'N/A', sub: metrics.status || 'Good' },
    { label: 'Average Rating', val: metrics.avgRating !== null ? `${metrics.avgRating} / 5` : 'N/A', sub: 'Star Rating' },
    { label: 'Total Ratings', val: String(metrics.totalRatings || 0), sub: 'Submissions' },
    { label: 'Feedback Notes', val: String(metrics.feedbackCount || 0), sub: 'Comments' },
    { label: 'Complaints', val: String(complaintsCount || 0), sub: 'Logged' }
  ];

  statCards.forEach((c, idx) => {
    const x = margin + idx * (cardWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER_COLOR);
    doc.roundedRect(x, cursorY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...EMERALD);
    doc.text(c.val, x + cardWidth / 2, cursorY + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...DARK_SLATE);
    doc.text(c.label, x + cardWidth / 2, cursorY + 11.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED_SLATE);
    doc.text(c.sub, x + cardWidth / 2, cursorY + 15.5, { align: 'center' });
  });

  cursorY += cardHeight + 7;

  // ── SECTION 2: MEAL-WISE PERFORMANCE ───────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK_SLATE);
  doc.text('2. MEAL-WISE PERFORMANCE ANALYSIS', margin, cursorY);
  cursorY += 3;

  const mealTableBody = (mealStats || []).map(m => [
    m.category,
    m.name || 'Standard Menu',
    m.avgRating !== null ? `${m.avgRating} ★` : 'No ratings',
    String(m.totalRatings || 0),
    m.satisfactionRate !== null ? `${m.satisfactionRate}%` : 'N/A',
    String(m.feedbackCount || 0)
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Meal Category', 'Representative Dishes', 'Avg Rating', 'Ratings Count', 'Satisfaction Rate', 'Feedback Count']],
    body: mealTableBody.length > 0 ? mealTableBody : [['No data', 'No ratings submitted for this period', '-', '0', '-', '0']],
    theme: 'grid',
    headStyles: {
      fillColor: EMERALD,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: DARK_SLATE
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 26 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 7;

  // ── SECTION 3: HIGHLIGHTS & AREAS NEEDING ATTENTION ────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK_SLATE);
  doc.text('3. KEY DISH HIGHLIGHTS', margin, cursorY);
  cursorY += 3;

  const topItems = (topMeals || []).slice(0, 3).map(m => `${m.name} (${m.avgRating}★, ${m.count} votes)`).join('  •  ') || 'None recorded yet';
  const lowItems = (lowRatedMeals || []).slice(0, 3).map(m => `${m.name} (${m.avgRating}★, ${m.count} votes)`).join('  •  ') || 'None requiring immediate action';

  const highlightsBody = [
    ['Top Performing Dishes', topItems],
    ['Areas Needing Attention', lowItems]
  ];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    body: highlightsBody,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, textColor: DARK_SLATE },
      1: { cellWidth: 'auto', textColor: DARK_SLATE }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 6;

  // ── SECTION 4: FEEDBACK THEMES ─────────────────────────────────────────────
  if (feedbackThemes && feedbackThemes.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...DARK_SLATE);
    doc.text('4. RECURRING STUDENT FEEDBACK THEMES', margin, cursorY);
    cursorY += 3;

    const themeRows = feedbackThemes.map(t => [t.name, `${t.count} student mention${t.count === 1 ? '' : 's'}`]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Theme Category', 'Frequency']],
      body: themeRows,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: DARK_SLATE },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      }
    });

    cursorY = doc.lastAutoTable.finalY + 6;
  }

  // ── SECTION 5: PRIVACY-SAFE RECENT FEEDBACK ────────────────────────────────
  if (recentFeedback && recentFeedback.length > 0) {
    // Check if we need a new page
    if (cursorY > pageHeight - 50) {
      doc.addPage();
      cursorY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...DARK_SLATE);
    doc.text('5. RECENT STUDENT FEEDBACK (PRIVACY-SAFE)', margin, cursorY);
    cursorY += 3;

    const feedbackRows = recentFeedback.slice(0, 5).map(f => [
      `${f.rating} ★`,
      `"${f.comment || 'No comment'}"`,
      f.mealName || 'General',
      'Anonymous Student'
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Rating', 'Feedback Comment', 'Meal', 'Source']],
      body: feedbackRows,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: DARK_SLATE },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 18, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35 },
        3: { cellWidth: 32, fontStyle: 'italic', textColor: MUTED_SLATE }
      }
    });

    cursorY = doc.lastAutoTable.finalY + 6;
  }

  // ── SECTION 6: METHODOLOGY ─────────────────────────────────────────────────
  if (cursorY > pageHeight - 40) {
    doc.addPage();
    cursorY = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_SLATE);
  doc.text('METHODOLOGY & RATING THRESHOLDS', margin, cursorY);
  cursorY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED_SLATE);
  const methodText =
    '• Satisfaction Rate is defined as the percentage of valid meal ratings receiving 4 or 5 stars:\n' +
    '  Satisfaction Rate = (Number of 4★ and 5★ ratings) ÷ (Total valid ratings) × 100%.\n' +
    '• Institutional Thresholds: Excellent (90–100%), Good (75–89%), Needs Attention (50–74%), Critical (<50%).\n' +
    '• Data Source: Authentic student submissions recorded via MessMates platform. Student identities are protected by student anonymity standards.\n' +
    '• Timestamps and date windows are calculated strictly in Asia/Kolkata (Indian Standard Time).';
  doc.text(methodText, margin, cursorY);

  // ── FOOTERS ON ALL PAGES ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER_COLOR);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED_SLATE);
    doc.text('MessMates • Know Your Meal Before You Eat It • ABES Engineering College', margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // ── DOWNLOAD ───────────────────────────────────────────────────────────────
  const filename = startDate === endDate
    ? `MessMates_Student_Satisfaction_Report_${startDate}.pdf`
    : `MessMates_Student_Satisfaction_Report_${startDate}_to_${endDate}.pdf`;

  doc.save(filename);
  return filename;
};
