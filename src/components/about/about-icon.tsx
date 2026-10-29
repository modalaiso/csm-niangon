import {
  BookOpen,
  Church,
  Heart,
  Lightbulb,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import type { AboutIconName } from "@/lib/about";

const ICONS = {
  church: Church,
  lightbulb: Lightbulb,
  star: Star,
  heart: Heart,
  book: BookOpen,
  users: Users,
  shield: ShieldCheck,
  trophy: Trophy,
} satisfies Record<AboutIconName, typeof Star>;

export function AboutIcon(
  props: Readonly<{ name: AboutIconName; className?: string }>,
) {
  const Icon = ICONS[props.name] ?? Star;
  return <Icon className={props.className} aria-hidden="true" />;
}
