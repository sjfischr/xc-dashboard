"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface ReportData {
  team: string;
  meet: string;
  date: string;
  score: number | null;
  packGap: number | null;
  rivals: Array<{
    opponent: string;
    averageTimeGapSeconds: number | null;
    scoreDifference: number | null;
  }>;
  topImprovers: Array<{
    athlete: string;
    improvement: number;
    latest: number;
  }>;
  trendData: Array<{
    meet: string;
    date: string;
    score: number | null;
    averageTop5TimeSeconds: number | null;
    packGapSeconds: number | null;
  }>;
}

interface DownloadButtonsProps {
  reportData: ReportData;
}

function formatTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const wholeSeconds = Math.floor(secs);
  let tenths = Math.round((secs - wholeSeconds) * 10);

  let displayMinutes = minutes;
  let displaySeconds = wholeSeconds;

  if (tenths === 10) {
    tenths = 0;
    displaySeconds += 1;
    if (displaySeconds === 60) {
      displaySeconds = 0;
      displayMinutes += 1;
    }
  }

  const paddedSeconds = String(displaySeconds).padStart(2, "0");
  const decimal = tenths > 0 ? `.${tenths}` : "";
  return `${displayMinutes}:${paddedSeconds}${decimal}`;
}

export function DownloadButtons({ reportData }: DownloadButtonsProps) {
  const handleDownloadHTML = () => {
    const htmlContent = generateHTMLReport(reportData);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coach-summary-${reportData.date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    // Open print dialog - browser's built-in PDF export
    window.print();
  };

  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={handleDownloadHTML}>
        <FileText className="mr-2 h-4 w-4" />
        HTML
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
        <Download className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}

function generateHTMLReport(data: ReportData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coach Summary Report - ${data.team} - ${data.meet}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    h1 {
      color: #1a1a1a;
      margin-bottom: 10px;
      font-size: 32px;
    }
    h2 {
      color: #2563eb;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 24px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    h3 {
      color: #374151;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .meta {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      background: #f9fafb;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .metric-sub {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 4px;
    }
    .section {
      margin: 30px 0;
    }
    .item {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin: 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fafafa;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 10px;
    }
    .badge-loss {
      background: #fee2e2;
      color: #991b1b;
    }
    .badge-improve {
      background: #d1fae5;
      color: #065f46;
    }
    .insights {
      list-style: none;
      padding: 0;
    }
    .insights li {
      padding: 8px 0;
      color: #4b5563;
    }
    .trend-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .trend-table th,
    .trend-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .trend-table th {
      background: #f3f4f6;
      font-weight: 600;
      color: #374151;
    }
    .trend-table tr:hover {
      background: #f9fafb;
    }
  </style>
</head>
<body>
  <h1>Coach Summary Report</h1>
  <p class="meta">${data.team} · ${data.meet} · ${data.date}</p>

  <h2>Executive Summary</h2>
  
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-label">Team Score</div>
      <div class="metric-value">${data.score ?? "No Score"}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Pack Gap (1-5)</div>
      <div class="metric-value">${data.packGap !== null ? data.packGap.toFixed(1) + "s" : "—"}</div>
      <div class="metric-sub">${
        data.packGap !== null && data.packGap < 30
          ? "Excellent"
          : data.packGap !== null && data.packGap < 60
            ? "Good"
            : "Needs Work"
      }</div>
    </div>
  </div>

  ${
    data.rivals.length > 0
      ? `
  <div class="section">
    <h3>Teams That Beat Us (${data.rivals.length})</h3>
    ${data.rivals
      .map(
        (rival) => `
    <div class="item">
      <div>
        <span class="badge badge-loss">LOSS</span>
        <strong>${rival.opponent}</strong>
      </div>
      <div>
        ${rival.scoreDifference !== null ? `Score Δ: +${rival.scoreDifference} · ` : ""}
        ${rival.averageTimeGapSeconds !== null ? `Time Δ: +${Math.abs(rival.averageTimeGapSeconds).toFixed(1)}s` : ""}
      </div>
    </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    data.topImprovers.length > 0
      ? `
  <div class="section">
    <h3>Biggest Improvers vs Previous Meet</h3>
    ${data.topImprovers
      .map(
        (athlete) => `
    <div class="item">
      <div>
        <span class="badge badge-improve">↑</span>
        <strong>${athlete.athlete}</strong>
      </div>
      <div>
        <span style="color: #065f46; font-weight: bold;">-${athlete.improvement.toFixed(1)}s</span>
        · ${formatTime(athlete.latest)}
      </div>
    </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    data.trendData.length >= 2
      ? `
  <h2>Season Trends</h2>
  <table class="trend-table">
    <thead>
      <tr>
        <th>Meet</th>
        <th>Date</th>
        <th>Score</th>
        <th>Avg Top-5</th>
        <th>Pack Gap</th>
      </tr>
    </thead>
    <tbody>
      ${data.trendData
        .map(
          (trend) => `
      <tr>
        <td>${trend.meet}</td>
        <td>${trend.date}</td>
        <td>${trend.score ?? "—"}</td>
        <td>${formatTime(trend.averageTop5TimeSeconds)}</td>
        <td>${trend.packGapSeconds !== null ? trend.packGapSeconds.toFixed(1) + "s" : "—"}</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  `
      : ""
  }

  <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px;">
    Generated on ${new Date().toLocaleDateString()} · XC Dashboard
  </footer>
</body>
</html>`;
}
