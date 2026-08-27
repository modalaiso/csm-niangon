"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnnouncementDurationSelectProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
}

const DURATION_OPTIONS = [
  { label: "24 heures", value: "1d", hours: 24 },
  { label: "3 jours", value: "3d", hours: 72 },
  { label: "1 semaine", value: "7d", hours: 168 },
  { label: "1 mois", value: "30d", hours: 720 },
  { label: "Date personnalisée", value: "custom", hours: null },
  { label: "Sans limite", value: "none", hours: null },
] as const;

export function AnnouncementDurationSelect(
  props: Readonly<AnnouncementDurationSelectProps>,
) {
  const [mode, setMode] = useState<string>(props.value ? "custom" : "none");

  const handleModeChange = (nextMode: string) => {
    setMode(nextMode);
    const option = DURATION_OPTIONS.find((o) => o.value === nextMode);
    if (!option) return;

    if (option.value === "none") {
      props.onChange(null);
    } else if (option.value === "custom") {
      props.onChange(props.value);
    } else if (option.hours) {
      const expires = new Date();
      expires.setHours(expires.getHours() + option.hours);
      props.onChange(expires);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="announcement-duration">
        {props.label ?? "Durée de vie de l'annonce"}
      </Label>
      <Select value={mode} onValueChange={handleModeChange}>
        <SelectTrigger id="announcement-duration">
          <SelectValue placeholder="Choisir une durée" />
        </SelectTrigger>
        <SelectContent>
          {DURATION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mode === "custom" && (
        <Input
          type="datetime-local"
          value={
            props.value
              ? new Date(
                  props.value.getTime() -
                    props.value.getTimezoneOffset() * 60000,
                )
                  .toISOString()
                  .slice(0, 16)
              : ""
          }
          onChange={(e) =>
            props.onChange(e.target.value ? new Date(e.target.value) : null)
          }
        />
      )}

      {mode !== "custom" && mode !== "none" && props.value && (
        <p className="text-xs text-muted-foreground">
          Expire le{" "}
          {props.value.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
