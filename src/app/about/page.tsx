import { ArrowUpRight, Clock, Mail, MapPin, Phone, Quote } from "lucide-react";
import Link from "next/link";
import { getAboutContent } from "@/app/actions/about";
import { AboutIcon } from "@/components/about/about-icon";
import { Avatar } from "@/components/ui/avatar";
import { renderPostContent } from "@/lib/render-post-content";

export const metadata = {
  title: "À propos de nous | CSM Niangon",
  description:
    "Découvrez le CSM Niangon : notre histoire, nos valeurs et notre équipe.",
};

export const revalidate = 300;

function SectionHeading(
  props: Readonly<{
    eyebrow?: string;
    title: string;
    light?: boolean;
    center?: boolean;
  }>,
) {
  return (
    <div className={props.center ? "text-center" : undefined}>
      {props.eyebrow && (
        <p
          className={`text-xs font-semibold uppercase tracking-widest ${
            props.light ? "text-white/80" : "text-primary"
          }`}
        >
          {props.eyebrow}
        </p>
      )}
      <span
        className={`mt-2 block h-0.5 w-10 bg-secondary ${props.center ? "mx-auto" : ""}`}
      />
      <h2
        className={`mt-3 text-2xl font-bold sm:text-3xl ${
          props.light ? "text-white" : "text-foreground"
        }`}
      >
        {props.title}
      </h2>
    </div>
  );
}

export default async function AboutPage() {
  const about = await getAboutContent();
  const { hero, presentation, director, contact } = about;
  const hasDirector = director.name.trim() || director.message.trim();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={hero.image || "/bg.png"}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/35" />
        </div>
        <div className="container flex min-h-[420px] flex-col items-center justify-center px-4 py-20 text-center text-white md:min-h-[520px]">
          {hero.eyebrow && (
            <span className="rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              {hero.eyebrow}
            </span>
          )}
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold uppercase leading-tight sm:text-4xl md:text-5xl">
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p className="mt-4 max-w-2xl text-sm text-white/90 sm:text-base">
              {hero.subtitle}
            </p>
          )}
          {hero.ctaLabel && hero.ctaHref && (
            <Link
              href={hero.ctaHref}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
            >
              {hero.ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Chiffres clés */}
      {about.stats.length > 0 && (
        <section className="bg-primary text-white">
          <div className="container grid grid-cols-2 gap-y-6 px-4 py-8 md:grid-cols-4">
            {about.stats.map((stat, i) => (
              <div
                key={`${stat.label}-${i}`}
                className="text-center md:border-l md:border-white/25 md:first:border-l-0"
              >
                <p className="text-3xl font-extrabold sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/85 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Présentation */}
      <section className="container grid items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <SectionHeading
            eyebrow={presentation.eyebrow}
            title={presentation.title}
          />
          <div className="mt-6">{renderPostContent(presentation.body)}</div>
        </div>
        {presentation.image && (
          <div className="overflow-hidden rounded-[2rem] border-4 border-primary/70 shadow-lg">
            <img
              src={presentation.image}
              alt={presentation.title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        )}
      </section>

      {/* Valeurs */}
      {about.values.length > 0 && (
        <section className="relative isolate overflow-hidden bg-primary/95 py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.25),transparent_50%)]"
          />
          <div className="container px-4">
            <SectionHeading
              eyebrow="Nos valeurs"
              title="Ce qui nous caractérise"
              light
              center
            />
            <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {about.values.map((value, i) => (
                <article
                  key={`${value.title}-${i}`}
                  className="rounded-3xl bg-background p-6 text-center shadow-xl"
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary text-primary">
                    <AboutIcon name={value.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-primary">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mot du directeur */}
      {hasDirector && (
        <section className="container px-4 py-14 md:py-20">
          <div className="grid overflow-hidden rounded-3xl border border-border bg-muted/40 md:grid-cols-[320px_1fr]">
            <div className="relative bg-muted">
              {director.photo ? (
                <img
                  src={director.photo}
                  alt={director.name}
                  className="h-full max-h-[420px] w-full object-cover md:max-h-none"
                />
              ) : (
                <div className="flex h-64 items-center justify-center md:h-full">
                  <Avatar
                    nom={director.name}
                    prenom=""
                    username={director.name || "D"}
                    avatar={null}
                    className="h-28 w-28"
                    textClassName="text-4xl"
                  />
                </div>
              )}
            </div>
            <div className="p-6 sm:p-10">
              <Quote className="h-8 w-8 text-secondary" aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-primary">
                Le mot du directeur
              </p>
              <div className="mt-4">{renderPostContent(director.message)}</div>
              <p className="mt-6 font-bold text-foreground">{director.name}</p>
              <p className="text-sm text-muted-foreground">{director.role}</p>
            </div>
          </div>
        </section>
      )}

      {/* Équipe */}
      {about.team.length > 0 && (
        <section className="border-y border-border bg-muted/40 py-14">
          <div className="container px-4">
            <SectionHeading
              eyebrow="Notre équipe"
              title="Responsables d'établissement"
              center
            />
            <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {about.team.map((member, i) => (
                <li key={`${member.name}-${i}`} className="text-center">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full ring-2 ring-primary/30">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Avatar
                        nom={member.name}
                        prenom=""
                        username={member.name || "?"}
                        avatar={null}
                        className="h-24 w-24"
                        textClassName="text-2xl"
                      />
                    )}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Partenaires */}
      {about.partners.length > 0 && (
        <section className="container px-4 py-14">
          <SectionHeading
            eyebrow="Nos partenaires"
            title="Ils nous font confiance"
          />
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {about.partners.map((partner, i) => {
              const inner = partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-16 w-auto object-contain"
                />
              ) : (
                <span className="text-sm font-semibold text-foreground">
                  {partner.name}
                </span>
              );
              return (
                <li key={`${partner.name}-${i}`}>
                  {partner.url ? (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-28 items-center justify-center rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-2xl border border-border bg-background p-4">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Contact & horaires */}
      <section
        id="contact"
        className="border-t border-border bg-muted/40 py-14"
      >
        <div className="container grid gap-6 px-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-6">
            <SectionHeading title="Nous joindre" />
            <ul className="mt-6 space-y-4 text-sm">
              {contact.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-foreground">{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="text-foreground hover:underline"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-foreground hover:underline"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
            {contact.mapUrl && (
              <a
                href={contact.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Ouvrir dans Maps
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>

          {about.hours.length > 0 && (
            <div className="rounded-3xl border border-border bg-background p-6">
              <SectionHeading title="Horaires d'ouverture" />
              <ul className="mt-6 divide-y divide-border text-sm">
                {about.hours.map((row, i) => (
                  <li
                    key={`${row.label}-${i}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      {row.label}
                    </span>
                    <span className="font-semibold text-foreground">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
