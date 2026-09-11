"use client";

import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const options: Array<{
  value: Theme;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    label: "Clair",
    description: "Interface lumineuse",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Sombre",
    description: "Interface plus douce le soir",
    icon: Moon,
  },
  {
    value: "system",
    label: "Automatique",
    description: "Suit les réglages de votre appareil",
    icon: Laptop,
  },
];

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle(
    "dark",
    theme === "dark" || (theme === "system" && prefersDark),
  );
}

export function ThemePreference() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("csm-theme");
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const chooseTheme = (value: Theme) => {
    localStorage.setItem("csm-theme", value);
    setTheme(value);
    applyTheme(value);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Thème de l'application">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => chooseTheme(option.value)}
            className={cn(
              "relative flex min-h-32 flex-col items-start rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "mb-5 flex h-10 w-10 items-center justify-center rounded-xl",
                isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-foreground">{option.label}</span>
            <span className="mt-1 text-xs leading-5 text-muted-foreground">{option.description}</span>
            {isSelected && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Sélectionné</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
