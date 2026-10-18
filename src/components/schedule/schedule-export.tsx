"use client";

import { Download, Image as ImageIcon, Loader2, Printer } from "lucide-react";
import { useRef, useState } from "react";
import type { ClassScheduleData } from "@/app/actions/schedules";
import { ScheduleDocument } from "@/components/schedule/schedule-document";
import { Button } from "@/components/ui/button";

const COLOR_PROPERTIES = [
  "background-color",
  "border-bottom-color",
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "caret-color",
  "color",
  "column-rule-color",
  "outline-color",
  "text-decoration-color",
  "text-emphasis-color",
  "text-shadow",
  "box-shadow",
];

const EXPORT_WIDTH = 1188;
const EXPORT_HEIGHT = 840;

function toRgbColor(value: string, context: CanvasRenderingContext2D): string {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = "rgba(1, 2, 3, 1)";
  const sentinel = context.fillStyle;
  context.fillStyle = value;
  if (context.fillStyle === sentinel) {
    throw new Error(`Unsupported CSS color in schedule export: ${value}`);
  }
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
}

function normalizeModernColors(
  value: string,
  context: CanvasRenderingContext2D,
): string {
  const modernColorFunction = /(?:oklch|oklab|lab|lch|color-mix|color|hwb)\(/gi;
  let normalized = "";
  let cursor = 0;
  let match = modernColorFunction.exec(value);

  while (match) {
    const functionStart = match.index;
    let depth = 1;
    let functionEnd = functionStart + match[0].length;
    while (functionEnd < value.length && depth > 0) {
      if (value[functionEnd] === "(") depth += 1;
      if (value[functionEnd] === ")") depth -= 1;
      functionEnd += 1;
    }
    if (depth !== 0) {
      throw new Error(`Invalid CSS color in schedule export: ${value}`);
    }

    normalized += value.slice(cursor, functionStart);
    normalized += toRgbColor(value.slice(functionStart, functionEnd), context);
    cursor = functionEnd;
    modernColorFunction.lastIndex = functionEnd;
    match = modernColorFunction.exec(value);
  }

  return normalized ? normalized + value.slice(cursor) : value;
}

interface ScheduleExportProps {
  schedule: ClassScheduleData;
}

export function ScheduleExport(props: Readonly<ScheduleExportProps>) {
  const printableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<"pdf" | "image" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captureCanvas = async () => {
    const node = printableRef.current;
    if (!node) throw new Error("Schedule export element is unavailable.");
    const { default: html2canvas } = await import("html2canvas");
    node.classList.add("schedule-export-mode");
    try {
      return await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
        windowWidth: EXPORT_WIDTH,
        windowHeight: EXPORT_HEIGHT,
        onclone: (_document, clonedNode) => {
          const originalElements = [
            node,
            ...node.querySelectorAll<HTMLElement>("*"),
          ];
          const clonedElements = [
            clonedNode,
            ...clonedNode.querySelectorAll<HTMLElement>("*"),
          ];
          const colorCanvas = document.createElement("canvas");
          colorCanvas.width = 1;
          colorCanvas.height = 1;
          const context = colorCanvas.getContext("2d");
          if (!context) {
            throw new Error("Canvas is unavailable for schedule export.");
          }

          originalElements.forEach((element, index) => {
            const clonedElement = clonedElements[index];
            if (!clonedElement) return;
            const computedStyle = window.getComputedStyle(element);
            for (const property of COLOR_PROPERTIES) {
              const value = computedStyle.getPropertyValue(property);
              if (value) {
                clonedElement.style.setProperty(
                  property,
                  normalizeModernColors(value, context),
                );
              }
            }
          });

          clonedNode.style.setProperty("box-sizing", "border-box");
          clonedNode.style.setProperty("width", `${EXPORT_WIDTH}px`);
          clonedNode.style.setProperty("height", `${EXPORT_HEIGHT}px`);
          clonedNode.style.setProperty("max-width", "none");
          clonedNode.style.setProperty("border", "0");
          clonedNode.style.setProperty("border-radius", "0");
          clonedNode.style.setProperty("overflow", "hidden");

          const documentNode =
            clonedNode.firstElementChild as HTMLElement | null;
          if (!documentNode) {
            throw new Error("Schedule document is unavailable for export.");
          }
          documentNode.style.setProperty("box-sizing", "border-box");
          documentNode.style.setProperty("display", "flex");
          documentNode.style.setProperty("flex-direction", "column");
          documentNode.style.setProperty("width", "100%");
          documentNode.style.setProperty("height", "100%");
          documentNode.style.setProperty("padding", "32px");
          documentNode.style.setProperty("border-radius", "0");

          const header = documentNode.firstElementChild as HTMLElement | null;
          header?.style.setProperty("margin-bottom", "16px");
          const logo = header?.querySelector("img");
          logo?.style.setProperty("width", "56px");
          logo?.style.setProperty("height", "56px");

          const grid = documentNode.querySelector<HTMLElement>(
            ".schedule-grid-document",
          );
          if (!grid) {
            throw new Error("Schedule grid is unavailable for export.");
          }
          grid.style.setProperty("display", "block");
          grid.style.setProperty("flex", "1 1 auto");
          grid.style.setProperty("min-height", "0");
          grid.style.setProperty("overflow", "hidden");

          const table = grid.querySelector("table");
          if (!table) {
            throw new Error("Schedule table is unavailable for export.");
          }
          table.style.setProperty("width", "100%");
          table.style.setProperty("height", "100%");
          table.style.setProperty("table-layout", "fixed");
          for (const cell of table.querySelectorAll<HTMLElement>("th, td")) {
            cell.style.setProperty("padding", "6px 8px");
            cell.style.setProperty("border-width", "1px");
          }

          const mobileDocument = documentNode.querySelector<HTMLElement>(
            ".schedule-mobile-document",
          );
          mobileDocument?.style.setProperty("display", "none");
        },
      });
    } finally {
      node.classList.remove("schedule-export-mode");
    }
  };

  const fileBaseName = `emploi-du-temps-${props.schedule.className}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");

  const handleDownloadImage = async () => {
    setError(null);
    setIsExporting("image");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${fileBaseName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Erreur lors de l'export en image:", err);
      setError("Impossible de générer l'image. Réessayez.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadPdf = async () => {
    setError(null);
    setIsExporting("pdf");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const { jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210, undefined, "FAST");
      pdf.save(`${fileBaseName}.pdf`);
    } catch (err) {
      console.error("Erreur lors de l'export en PDF:", err);
      setError("Impossible de générer le PDF. Réessayez.");
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2 print:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Imprimer
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full"
          disabled={isExporting !== null}
          onClick={handleDownloadImage}
        >
          {isExporting === "image" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          Télécharger l'image
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-1.5 rounded-full text-white"
          disabled={isExporting !== null}
          onClick={handleDownloadPdf}
        >
          {isExporting === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Télécharger le PDF
        </Button>
      </div>

      {error && (
        <p className="mb-3 text-sm text-destructive print:hidden">{error}</p>
      )}

      <div
        id="schedule-print-area"
        ref={printableRef}
        className="rounded-2xl border border-border"
      >
        <ScheduleDocument schedule={props.schedule} />
      </div>
    </div>
  );
}
