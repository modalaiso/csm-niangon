"use client";

import { useRef, useState } from "react";
import { Download, Printer, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleDocument } from "@/components/schedule/schedule-document";
import type { ClassScheduleData } from "@/app/actions/schedules";

interface ScheduleExportProps {
  schedule: ClassScheduleData;
}

export function ScheduleExport(props: Readonly<ScheduleExportProps>) {
  const printableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<"pdf" | "image" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captureCanvas = async () => {
    const node = printableRef.current;
    if (!node) return null;
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
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
        orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
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
        <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={handlePrint}>
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
          Télécharger l&apos;image
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-1.5 rounded-full text-white"
          disabled={isExporting !== null}
          onClick={handleDownloadPdf}
        >
          {isExporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Télécharger le PDF
        </Button>
      </div>

      {error && <p className="mb-3 text-sm text-destructive print:hidden">{error}</p>}

      <div id="schedule-print-area" ref={printableRef} className="rounded-2xl border border-border">
        <ScheduleDocument schedule={props.schedule} />
      </div>
    </div>
  );
}