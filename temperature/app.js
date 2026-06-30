"use strict";

const els = {
  csvInput: document.getElementById("csvInput"),
  exportButton: document.getElementById("exportButton"),
  clearNamesButton: document.getElementById("clearNamesButton"),
  statusPanel: document.getElementById("statusPanel"),
  startTime: document.getElementById("startTime"),
  endTime: document.getElementById("endTime"),
  duration: document.getElementById("duration"),
  channelCount: document.getElementById("channelCount"),
  channelInputs: document.getElementById("channelInputs"),
  recordCount: document.getElementById("recordCount"),
  summaryBody: document.getElementById("summaryBody"),
  chartCanvas: document.getElementById("chartCanvas")
};

const COLORS = [
  "#147c72", "#b44d2a", "#3267a8", "#7f5aa2", "#6a842c",
  "#b67812", "#2d8bb8", "#a83b63", "#4e6e2d", "#6d5b44",
  "#008578", "#d25f39", "#225ea8", "#9367b4", "#7f8f25",
  "#c88d13", "#1897bd", "#b84b78", "#5f7e36", "#83694e",
  "#0f6b62", "#9f4526", "#2d5b8e", "#6f4f91", "#5c7329",
  "#a66d00", "#267fa1", "#963457", "#405f28"
];

let report = null;

els.csvInput.addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    setStatus("Reading CSV.", file.name);
    const text = await file.text();
    report = parseHiokiCsv(text, file.name);
    renderReport();
    setStatus("CSV imported.", `${report.records.length.toLocaleString()} records and ${report.channels.length} temperature channels are ready.`);
  } catch (error) {
    report = null;
    renderReport();
    setStatus("Import failed.", error.message, "error");
  }
});

els.exportButton.addEventListener("click", () => {
  if (!report) return;
  try {
    updateLabelsFromInputs();
    drawChart(els.chartCanvas, report, { forPdf: false });
    const pages = buildPdfPageCanvases(report);
    const pdfBytes = createImagePdf(pages);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "result.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setStatus("PDF exported.", "Saved as result.pdf.");
  } catch (error) {
    setStatus("Export failed.", error.message, "error");
  }
});

els.clearNamesButton.addEventListener("click", () => {
  if (!report) return;
  report.channels.forEach((channel) => {
    channel.label = channel.sourceHeader;
  });
  renderChannelInputs();
  renderSummaryTable();
  drawChart(els.chartCanvas, report, { forPdf: false });
});

window.addEventListener("resize", () => {
  if (report) drawChart(els.chartCanvas, report, { forPdf: false });
});

drawEmptyChart();

function parseHiokiCsv(text, fileName) {
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ""));
  if (rows.length < 13) {
    throw new Error("CSV does not contain the expected LR8450 header and data rows.");
  }

  const triggerRow = rows[2] || [];
  const triggerText = triggerRow[1] || "";
  const startDate = parseTriggerTime(triggerText);
  const headerRow = rows[11] || [];
  if ((headerRow[0] || "").trim().toLowerCase() !== "time") {
    throw new Error("Row 12 must start with a Time column.");
  }

  const usefulHeaders = headerRow.slice(1, -1).map((header) => header.trim()).filter(Boolean);
  if (!usefulHeaders.length) {
    throw new Error("No temperature channels were found between Time and the last ignored column.");
  }
  if (usefulHeaders.length >= 30) {
    throw new Error("The CSV has 30 or more useful temperature columns, which is outside the requirement.");
  }

  const records = [];
  for (let i = 12; i < rows.length; i += 1) {
    const row = rows[i];
    const timeSeconds = parseNumber(row[0]);
    if (!Number.isFinite(timeSeconds)) continue;
    const values = usefulHeaders.map((_, index) => parseNumber(row[index + 1]));
    records.push({ timeSeconds, values });
  }

  if (!records.length) {
    throw new Error("No temperature records were found after row 12.");
  }

  const channels = usefulHeaders.map((sourceHeader, index) => {
    const series = records.map((record) => record.values[index]).filter(Number.isFinite);
    if (!series.length) {
      throw new Error(`${sourceHeader} does not contain numeric temperature data.`);
    }
    return {
      sourceHeader,
      label: sourceHeader,
      start: firstFinite(records.map((record) => record.values[index])),
      end: lastFinite(records.map((record) => record.values[index])),
      max: maxFinite(series)
    };
  });

  const lastTime = records[records.length - 1].timeSeconds;
  return {
    fileName,
    startDate,
    endDate: new Date(startDate.getTime() + lastTime * 1000),
    durationSeconds: Math.trunc(lastTime),
    records,
    channels
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        i += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function parseTriggerTime(value) {
  const match = String(value).trim().replace(/^'/, "").match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/);
  if (!match) {
    throw new Error("Row 3 does not contain a valid trigger time.");
  }

  const [, yy, month, day, hour, minute, second, ms = "0"] = match;
  const fullYear = 2000 + Number(yy);
  const milliseconds = Number(ms.padEnd(3, "0").slice(0, 3));
  return new Date(fullYear, Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), milliseconds);
}

function parseNumber(value) {
  if (value == null) return NaN;
  const normalized = String(value).trim().replace(/^'/, "");
  if (!normalized) return NaN;
  return Number(normalized);
}

function firstFinite(values) {
  return values.find(Number.isFinite);
}

function lastFinite(values) {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    if (Number.isFinite(values[i])) return values[i];
  }
  return NaN;
}

function minFinite(values) {
  let min = Infinity;
  values.forEach((value) => {
    if (Number.isFinite(value) && value < min) min = value;
  });
  return min;
}

function maxFinite(values) {
  let max = -Infinity;
  values.forEach((value) => {
    if (Number.isFinite(value) && value > max) max = value;
  });
  return max;
}

function renderReport() {
  const hasReport = Boolean(report);
  els.exportButton.disabled = !hasReport;
  els.clearNamesButton.disabled = !hasReport;

  if (!hasReport) {
    els.startTime.textContent = "-";
    els.endTime.textContent = "-";
    els.duration.textContent = "-";
    els.channelCount.textContent = "-";
    els.recordCount.textContent = "0 records";
    els.channelInputs.className = "channel-list empty-state";
    els.channelInputs.textContent = "Import a CSV file to map channel headers to test locations.";
    els.summaryBody.innerHTML = "<tr><td colspan=\"4\" class=\"table-empty\">No CSV imported.</td></tr>";
    drawEmptyChart();
    return;
  }

  els.startTime.textContent = formatDateMinute(report.startDate);
  els.endTime.textContent = formatDateMinute(report.endDate);
  els.duration.textContent = formatDuration(report.durationSeconds);
  els.channelCount.textContent = String(report.channels.length);
  els.recordCount.textContent = `${report.records.length.toLocaleString()} records`;
  renderChannelInputs();
  renderSummaryTable();
  drawChart(els.chartCanvas, report, { forPdf: false });
}

function renderChannelInputs() {
  els.channelInputs.className = "channel-list";
  els.channelInputs.innerHTML = "";
  report.channels.forEach((channel, index) => {
    const field = document.createElement("div");
    field.className = "channel-field";
    const label = document.createElement("label");
    label.htmlFor = `channel-${index}`;
    label.textContent = channel.sourceHeader;
    const input = document.createElement("input");
    input.id = `channel-${index}`;
    input.type = "text";
    input.value = channel.label === channel.sourceHeader ? "" : channel.label;
    input.placeholder = channel.sourceHeader;
    input.dataset.index = String(index);
    input.addEventListener("input", () => {
      updateLabelsFromInputs();
      renderSummaryTable();
      drawChart(els.chartCanvas, report, { forPdf: false });
    });
    field.append(label, input);
    els.channelInputs.appendChild(field);
  });
}

function updateLabelsFromInputs() {
  const inputs = els.channelInputs.querySelectorAll("input[data-index]");
  inputs.forEach((input) => {
    const index = Number(input.dataset.index);
    const value = input.value.trim();
    report.channels[index].label = value || report.channels[index].sourceHeader;
  });
}

function renderSummaryTable() {
  els.summaryBody.innerHTML = "";
  report.channels.forEach((channel) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td title="${escapeHtml(channel.label)}">${escapeHtml(channel.label)}</td>
      <td>${formatTemperature(channel.start)}</td>
      <td>${formatTemperature(channel.end)}</td>
      <td>${formatTemperature(channel.max)}</td>
    `;
    els.summaryBody.appendChild(row);
  });
}

function setStatus(title, detail, type = "") {
  els.statusPanel.className = `status-panel ${type}`.trim();
  els.statusPanel.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span>`;
}

function formatDateMinute(date) {
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatDuration(totalSeconds) {
  let seconds = Math.max(0, Math.trunc(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  if (hours > 0) return `${hours}h${minutes}m${seconds}s`;
  if (minutes > 0) return `${minutes}m${seconds}s`;
  return `${seconds}s`;
}

function formatTemperature(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)} °C` : "-";
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function drawEmptyChart() {
  const canvas = els.chartCanvas;
  fitCanvasToDisplay(canvas);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#60717c";
  ctx.font = `${Math.round(canvas.width / 42)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("Import a CSV to preview the temperature curve.", canvas.width / 2, canvas.height / 2);
}

function drawChart(canvas, data, options = {}) {
  if (!options.forPdf) fitCanvasToDisplay(canvas);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const pad = options.forPdf
    ? { left: 70, right: 30, top: 34, bottom: 70 }
    : { left: 76, right: 30, top: 34, bottom: 64 };
  const plot = {
    x: pad.left,
    y: pad.top,
    w: width - pad.left - pad.right,
    h: height - pad.top - pad.bottom
  };

  const times = data.records.map((record) => record.timeSeconds);
  const xMin = minFinite(times);
  const xMax = maxFinite(times);
  const allTemps = [];
  data.records.forEach((record) => {
    record.values.forEach((value) => {
      if (Number.isFinite(value)) allTemps.push(value);
    });
  });
  const rawYMin = minFinite(allTemps);
  const rawYMax = maxFinite(allTemps);
  const yPad = Math.max(2, (rawYMax - rawYMin) * 0.08);
  const yMin = Math.floor(rawYMin - yPad);
  const yMax = Math.ceil(rawYMax + yPad);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d9e2e6";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#44545d";
  ctx.font = `${options.forPdf ? 13 : Math.max(11, Math.round(width / 112))}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 5; i += 1) {
    const t = xMin + ((xMax - xMin) * i) / 5;
    const x = scale(t, xMin, xMax, plot.x, plot.x + plot.w);
    ctx.beginPath();
    ctx.moveTo(x, plot.y);
    ctx.lineTo(x, plot.y + plot.h);
    ctx.stroke();
    ctx.fillText(String(Math.round(t)), x, plot.y + plot.h + 24);
  }

  ctx.textAlign = "right";
  for (let i = 0; i <= 5; i += 1) {
    const temp = yMin + ((yMax - yMin) * i) / 5;
    const y = scale(temp, yMin, yMax, plot.y + plot.h, plot.y);
    ctx.beginPath();
    ctx.moveTo(plot.x, y);
    ctx.lineTo(plot.x + plot.w, y);
    ctx.stroke();
    ctx.fillText(temp.toFixed(0), plot.x - 12, y);
  }

  ctx.strokeStyle = "#26343b";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);

  data.channels.forEach((channel, channelIndex) => {
    const points = sampleRecords(data.records, 900).map((record) => {
      const temp = record.values[channelIndex];
      if (!Number.isFinite(temp)) return null;
      return {
        x: scale(record.timeSeconds, xMin, xMax, plot.x, plot.x + plot.w),
        y: scale(temp, yMin, yMax, plot.y + plot.h, plot.y)
      };
    }).filter(Boolean);
    if (points.length < 2) return;

    ctx.strokeStyle = COLORS[channelIndex % COLORS.length];
    ctx.lineWidth = options.forPdf ? 1.6 : 1.8;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i += 1) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();

    ctx.fillStyle = COLORS[channelIndex % COLORS.length];
    const step = Math.max(1, Math.floor(points.length / 32));
    for (let i = 0; i < points.length; i += step) {
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, options.forPdf ? 1.7 : 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  drawLegend(ctx, data.channels, plot, options.forPdf);

  ctx.fillStyle = "#1c252c";
  ctx.textAlign = "center";
  ctx.font = `${options.forPdf ? 14 : 12}px system-ui, sans-serif`;
  ctx.fillText("Time (s)", plot.x + plot.w / 2, height - 20);
  ctx.save();
  ctx.translate(18, plot.y + plot.h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Temperature (°C)", 0, 0);
  ctx.restore();
}

function drawLegend(ctx, channels, plot, forPdf) {
  const xStart = plot.x + 8;
  let x = xStart;
  let y = plot.y + 12;
  const rowHeight = forPdf ? 16 : 15;
  const maxX = plot.x + plot.w - 90;
  ctx.font = `${forPdf ? 10 : 10}px system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  channels.forEach((channel, index) => {
    const name = channel.label.length > 18 ? `${channel.label.slice(0, 17)}...` : channel.label;
    const textWidth = ctx.measureText(name).width;
    const itemWidth = textWidth + 28;
    if (x + itemWidth > maxX) {
      x = xStart;
      y += rowHeight;
    }
    if (y > plot.y + Math.min(94, plot.h * 0.25)) return;

    ctx.fillStyle = COLORS[index % COLORS.length];
    ctx.fillRect(x, y - 4, 14, 8);
    ctx.fillStyle = "#34454e";
    ctx.fillText(name, x + 20, y);
    x += itemWidth + 8;
  });
}

function sampleRecords(records, maxPoints) {
  if (records.length <= maxPoints) return records;
  const sampled = [];
  const step = (records.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i += 1) {
    sampled.push(records[Math.round(i * step)]);
  }
  return sampled;
}

function fitCanvasToDisplay(canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleFactor = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width * scaleFactor));
  const height = Math.max(240, Math.floor(rect.height * scaleFactor));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function scale(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return (outMin + outMax) / 2;
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

function buildPdfPageCanvases(data) {
  const pages = [
    drawSummaryPage(data),
    drawChartPage(data)
  ];
  return pages;
}

function drawSummaryPage(data) {
  const canvas = createPdfCanvas();
  const ctx = canvas.getContext("2d");
  paintPdfBackground(ctx, canvas);

  drawPdfTitle(ctx, "Temperature Test Report", data.fileName);

  const metaY = 160;
  drawInfoBox(ctx, 56, metaY, 270, 86, "Start", formatDateMinute(data.startDate));
  drawInfoBox(ctx, 342, metaY, 270, 86, "End", formatDateMinute(data.endDate));
  drawInfoBox(ctx, 628, metaY, 250, 86, "Duration", formatDuration(data.durationSeconds));
  drawInfoBox(ctx, 894, metaY, 290, 86, "Channels", String(data.channels.length));

  ctx.fillStyle = "#1c252c";
  ctx.font = "bold 26px Arial, sans-serif";
  ctx.fillText("Temperature Summary", 56, 314);

  const startY = 346;
  const table = {
    x: 56,
    y: startY,
    w: 1128,
    rowH: 34,
    cols: [476, 214, 214, 214]
  };
  drawTableHeader(ctx, table, ["Header", "Start", "End", "Max"]);

  data.channels.forEach((channel, index) => {
    const y = table.y + table.rowH * (index + 1);
    drawPdfTableRow(ctx, table, y, [
      channel.label,
      formatTemperature(channel.start),
      formatTemperature(channel.end),
      formatTemperature(channel.max)
    ], index);
  });

  drawPageFooter(ctx, canvas, 1, 2);
  return canvas;
}

function drawChartPage(data) {
  const canvas = createPdfCanvas();
  const ctx = canvas.getContext("2d");
  paintPdfBackground(ctx, canvas);
  drawPdfTitle(ctx, "Temperature Curve", `${formatDateMinute(data.startDate)} to ${formatDateMinute(data.endDate)}`);

  const chartCanvas = document.createElement("canvas");
  chartCanvas.width = 1128;
  chartCanvas.height = 780;
  drawChart(chartCanvas, data, { forPdf: true });
  ctx.drawImage(chartCanvas, 56, 156, 1128, 780);

  ctx.fillStyle = "#60717c";
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText(`${data.records.length.toLocaleString()} records. Last column ignored. Temperatures shown in Celsius.`, 56, 980);

  drawPageFooter(ctx, canvas, 2, 2);
  return canvas;
}

function createPdfCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  return canvas;
}

function paintPdfBackground(ctx, canvas) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#eef3f5";
  ctx.fillRect(0, 0, canvas.width, 112);
  ctx.fillStyle = "#147c72";
  ctx.fillRect(0, 0, 14, canvas.height);
}

function drawPdfTitle(ctx, title, subtitle) {
  ctx.fillStyle = "#1c252c";
  ctx.font = "bold 38px Arial, sans-serif";
  ctx.fillText(title, 56, 66);
  ctx.fillStyle = "#60717c";
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText(subtitle, 56, 96);
}

function drawInfoBox(ctx, x, y, w, h, label, value) {
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ccd8de";
  ctx.lineWidth = 1;
  roundedRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#60717c";
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.fillText(label.toUpperCase(), x + 18, y + 28);
  ctx.fillStyle = "#1c252c";
  ctx.font = "bold 23px Arial, sans-serif";
  ctx.fillText(value, x + 18, y + 62);
}

function drawTableHeader(ctx, table, labels) {
  ctx.fillStyle = "#eef3f5";
  ctx.fillRect(table.x, table.y, table.w, table.rowH);
  ctx.strokeStyle = "#ccd8de";
  ctx.strokeRect(table.x, table.y, table.w, table.rowH);
  ctx.fillStyle = "#33454f";
  ctx.font = "bold 17px Arial, sans-serif";
  let x = table.x;
  labels.forEach((label, index) => {
    const colW = table.cols[index];
    ctx.fillText(label, x + 12, table.y + 23);
    x += colW;
  });
}

function drawPdfTableRow(ctx, table, y, values, index) {
  ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#f8fafb";
  ctx.fillRect(table.x, y, table.w, table.rowH);
  ctx.strokeStyle = "#dce5e9";
  ctx.beginPath();
  ctx.moveTo(table.x, y + table.rowH);
  ctx.lineTo(table.x + table.w, y + table.rowH);
  ctx.stroke();

  ctx.fillStyle = "#1c252c";
  ctx.font = "16px Arial, sans-serif";
  let x = table.x;
  values.forEach((value, colIndex) => {
    const colW = table.cols[colIndex];
    const text = colIndex === 0 ? fitText(ctx, value, colW - 24) : value;
    ctx.fillText(text, x + 12, y + 23);
    x += colW;
  });
}

function drawPageFooter(ctx, canvas, page, total) {
  ctx.fillStyle = "#60717c";
  ctx.font = "16px Arial, sans-serif";
  ctx.fillText(`Page ${page} of ${total}`, 56, canvas.height - 44);
  ctx.textAlign = "right";
  ctx.fillText("Generated by Temperature Report Exporter", canvas.width - 56, canvas.height - 44);
  ctx.textAlign = "left";
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let output = String(text);
  while (output.length > 3 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function createImagePdf(pageCanvases) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const objects = [];
  const pages = [];

  const catalogId = reserveObject(objects);
  const pagesId = reserveObject(objects);

  pageCanvases.forEach((canvas) => {
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const jpegBytes = dataUrlToBytes(jpegDataUrl);
    const imageId = addStreamObject(objects, {
      Type: "/XObject",
      Subtype: "/Image",
      Width: canvas.width,
      Height: canvas.height,
      ColorSpace: "/DeviceRGB",
      BitsPerComponent: 8,
      Filter: "/DCTDecode"
    }, jpegBytes);

    const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
    const contentId = addStreamObject(objects, {}, asciiBytes(content));
    const pageId = addObject(objects, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pages.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pages.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  return serializePdf(objects);
}

function reserveObject(objects) {
  objects.push(null);
  return objects.length;
}

function addObject(objects, body) {
  objects.push(body);
  return objects.length;
}

function addStreamObject(objects, dictionary, bytes) {
  const dict = Object.entries(dictionary).map(([key, value]) => `/${key} ${value}`).join(" ");
  const header = `<< ${dict}${dict ? " " : ""}/Length ${bytes.length} >>\nstream\n`;
  const footer = "\nendstream";
  objects.push({ header: asciiBytes(header), body: bytes, footer: asciiBytes(footer) });
  return objects.length;
}

function serializePdf(objects) {
  const chunks = [asciiBytes("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
  const offsets = [0];
  let length = chunks[0].length;

  objects.forEach((object, index) => {
    offsets.push(length);
    const prefix = asciiBytes(`${index + 1} 0 obj\n`);
    const suffix = asciiBytes("\nendobj\n");
    chunks.push(prefix);
    length += prefix.length;
    if (typeof object === "string") {
      const bytes = asciiBytes(object);
      chunks.push(bytes);
      length += bytes.length;
    } else {
      chunks.push(object.header, object.body, object.footer);
      length += object.header.length + object.body.length + object.footer.length;
    }
    chunks.push(suffix);
    length += suffix.length;
  });

  const xrefOffset = length;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  offsets.slice(1).forEach((offset) => {
    xrefLines.push(`${String(offset).padStart(10, "0")} 00000 n `);
  });
  const trailer = `${xrefLines.join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(asciiBytes(trailer));
  length += trailer.length;

  const output = new Uint8Array(length);
  let position = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, position);
    position += chunk.length;
  });
  return output;
}

function asciiBytes(value) {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    bytes[i] = value.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
