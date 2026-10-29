"use client";

import { ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState, useTransition } from "react";
import { saveAboutContent } from "@/app/actions/about";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ABOUT_ICON_LABELS,
  ABOUT_ICONS,
  type AboutContent,
  type AboutIconName,
} from "@/lib/about";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const BUCKET = "post-images";
const MAX_SIZE = 6 * 1024 * 1024;

/* ------------------------------ Briques UI ------------------------------ */

function Card(
  props: Readonly<{ title: string; hint?: string; children: ReactNode }>,
) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5">
      <h2 className="text-sm font-semibold text-foreground">{props.title}</h2>
      {props.hint && (
        <p className="mt-1 text-xs text-muted-foreground">{props.hint}</p>
      )}
      <div className="mt-4 space-y-4">{props.children}</div>
    </section>
  );
}

function Field(
  props: Readonly<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
    hint?: string;
  }>,
) {
  const id = `f-${props.label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{props.label}</Label>
      {props.multiline ? (
        <textarea
          id={id}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          rows={5}
          className="w-full resize-y rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      ) : (
        <Input
          id={id}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
        />
      )}
      {props.hint && (
        <p className="text-xs text-muted-foreground">{props.hint}</p>
      )}
    </div>
  );
}

function ImageField(
  props: Readonly<{
    label: string;
    value: string;
    onChange: (url: string) => void;
  }>,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/"))
      return setError("Veuillez choisir une image.");
    if (file.size > MAX_SIZE)
      return setError("Image trop lourde (6 Mo maximum).");

    setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `about/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });
      if (upErr) {
        console.error("Erreur upload:", upErr);
        setError("L'envoi a échoué. Réessayez.");
        return;
      }
      props.onChange(
        supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{props.label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {props.value ? (
            <img
              src={props.value}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              Aucune image
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="gap-1.5 rounded-full"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {props.value ? "Remplacer" : "Ajouter"}
        </Button>
        {props.value && (
          <button
            type="button"
            onClick={() => props.onChange("")}
            aria-label="Retirer l'image"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ListCard<T>(
  props: Readonly<{
    title: string;
    hint?: string;
    items: T[];
    max: number;
    addLabel: string;
    empty: T;
    onChange: (items: T[]) => void;
    render: (item: T, set: (patch: Partial<T>) => void) => ReactNode;
  }>,
) {
  const nextItemKey = useRef(0);
  const [itemKeys, setItemKeys] = useState(() =>
    props.items.map(() => nextItemKey.current++),
  );
  const setAt = (i: number, patch: Partial<T>) =>
    props.onChange(
      props.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    );

  return (
    <Card title={props.title} hint={props.hint}>
      {props.items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucun élément pour le moment.
        </p>
      )}
      {props.items.map((item, i) => (
        <div
          key={itemKeys[i]}
          className="relative rounded-2xl border border-border bg-muted/30 p-4"
        >
          <button
            type="button"
            onClick={() => {
              setItemKeys((keys) => keys.filter((_, idx) => idx !== i));
              props.onChange(props.items.filter((_, idx) => idx !== i));
            }}
            aria-label="Supprimer cet élément"
            className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="space-y-3 pr-8">
            {props.render(item, (p) => setAt(i, p))}
          </div>
        </div>
      ))}
      {props.items.length < props.max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setItemKeys((keys) => [...keys, nextItemKey.current++]);
            props.onChange([...props.items, props.empty]);
          }}
          className="gap-1.5 rounded-full"
        >
          <Plus className="h-4 w-4" />
          {props.addLabel}
        </Button>
      )}
    </Card>
  );
}

/* -------------------------------- Éditeur -------------------------------- */

const TABS = [
  { id: "intro", label: "Introduction" },
  { id: "about", label: "Présentation" },
  { id: "values", label: "Valeurs & équipe" },
  { id: "contact", label: "Contact & partenaires" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function AboutEditor(props: Readonly<{ initial: AboutContent }>) {
  const router = useRouter();
  const [c, setC] = useState<AboutContent>(props.initial);
  const [tab, setTab] = useState<TabId>("intro");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const patch = <K extends keyof AboutContent>(
    key: K,
    value: Partial<AboutContent[K]> | AboutContent[K],
  ) =>
    setC((prev) => ({
      ...prev,
      [key]: Array.isArray(value)
        ? value
        : { ...(prev[key] as object), ...(value as object) },
    }));

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await saveAboutContent(c);
      if ("error" in result) {
        if (result.error === "auth_required") return router.push("/login");
        setStatus({
          ok: false,
          msg:
            result.error === "invalid"
              ? "Certains champs sont trop longs ou invalides."
              : "Impossible d'enregistrer. Réessayez.",
        });
        return;
      }
      setStatus({ ok: true, msg: "Page enregistrée." });
      router.refresh();
    });
  };

  return (
    <div className="pb-24">
      <div className="mb-5 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {tab === "intro" && (
          <>
            <Card title="Bannière (hero)">
              <ImageField
                label="Image de fond"
                value={c.hero.image}
                onChange={(v) => patch("hero", { image: v })}
              />
              <Field
                label="Sur-titre"
                value={c.hero.eyebrow}
                onChange={(v) => patch("hero", { eyebrow: v })}
              />
              <Field
                label="Titre"
                value={c.hero.title}
                onChange={(v) => patch("hero", { title: v })}
              />
              <Field
                label="Sous-titre"
                value={c.hero.subtitle}
                onChange={(v) => patch("hero", { subtitle: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Texte du bouton"
                  value={c.hero.ctaLabel}
                  onChange={(v) => patch("hero", { ctaLabel: v })}
                />
                <Field
                  label="Lien du bouton"
                  value={c.hero.ctaHref}
                  onChange={(v) => patch("hero", { ctaHref: v })}
                  placeholder="#contact ou /actus"
                />
              </div>
            </Card>
            <ListCard
              title="Chiffres clés"
              hint="Affichés dans la bande colorée sous la bannière (6 maximum)."
              items={c.stats}
              max={6}
              addLabel="Ajouter un chiffre"
              empty={{ value: "", label: "" }}
              onChange={(v) => patch("stats", v)}
              render={(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Valeur"
                    value={item.value}
                    onChange={(v) => set({ value: v })}
                    placeholder="2 718"
                  />
                  <Field
                    label="Libellé"
                    value={item.label}
                    onChange={(v) => set({ label: v })}
                    placeholder="Élèves"
                  />
                </div>
              )}
            />
          </>
        )}

        {tab === "about" && (
          <>
            <Card
              title="Présentation de l'établissement"
              hint="Le texte accepte le Markdown (gras, listes, liens)."
            >
              <Field
                label="Sur-titre"
                value={c.presentation.eyebrow}
                onChange={(v) => patch("presentation", { eyebrow: v })}
              />
              <Field
                label="Titre"
                value={c.presentation.title}
                onChange={(v) => patch("presentation", { title: v })}
              />
              <Field
                label="Texte"
                multiline
                value={c.presentation.body}
                onChange={(v) => patch("presentation", { body: v })}
              />
              <ImageField
                label="Illustration"
                value={c.presentation.image}
                onChange={(v) => patch("presentation", { image: v })}
              />
            </Card>
            <Card title="Mot du directeur">
              <ImageField
                label="Photo"
                value={c.director.photo}
                onChange={(v) => patch("director", { photo: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nom"
                  value={c.director.name}
                  onChange={(v) => patch("director", { name: v })}
                />
                <Field
                  label="Fonction"
                  value={c.director.role}
                  onChange={(v) => patch("director", { role: v })}
                />
              </div>
              <Field
                label="Message"
                multiline
                value={c.director.message}
                onChange={(v) => patch("director", { message: v })}
              />
            </Card>
          </>
        )}

        {tab === "values" && (
          <>
            <ListCard
              title="Valeurs"
              hint="Cartes « Ce qui nous caractérise » (6 maximum)."
              items={c.values}
              max={6}
              addLabel="Ajouter une valeur"
              empty={{
                title: "",
                description: "",
                icon: "star" as AboutIconName,
              }}
              onChange={(v) => patch("values", v)}
              render={(item, set) => (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Titre"
                      value={item.title}
                      onChange={(v) => set({ title: v })}
                    />
                    <div className="space-y-1.5">
                      <Label>Icône</Label>
                      <Select
                        value={item.icon}
                        onValueChange={(v) => set({ icon: v as AboutIconName })}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ABOUT_ICONS.map((i) => (
                            <SelectItem key={i} value={i}>
                              {ABOUT_ICON_LABELS[i]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Field
                    label="Description"
                    multiline
                    value={item.description}
                    onChange={(v) => set({ description: v })}
                  />
                </>
              )}
            />
            <ListCard
              title="Équipe"
              hint="Responsables d'établissement (12 maximum)."
              items={c.team}
              max={12}
              addLabel="Ajouter un membre"
              empty={{ name: "", role: "", photo: "" }}
              onChange={(v) => patch("team", v)}
              render={(item, set) => (
                <>
                  <ImageField
                    label="Photo"
                    value={item.photo}
                    onChange={(v) => set({ photo: v })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Nom"
                      value={item.name}
                      onChange={(v) => set({ name: v })}
                    />
                    <Field
                      label="Fonction"
                      value={item.role}
                      onChange={(v) => set({ role: v })}
                    />
                  </div>
                </>
              )}
            />
          </>
        )}

        {tab === "contact" && (
          <>
            <Card title="Coordonnées">
              <Field
                label="Adresse"
                value={c.contact.address}
                onChange={(v) => patch("contact", { address: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Téléphone"
                  value={c.contact.phone}
                  onChange={(v) => patch("contact", { phone: v })}
                />
                <Field
                  label="Email"
                  value={c.contact.email}
                  onChange={(v) => patch("contact", { email: v })}
                />
              </div>
              <Field
                label="Lien Google Maps"
                value={c.contact.mapUrl}
                onChange={(v) => patch("contact", { mapUrl: v })}
              />
            </Card>
            <ListCard
              title="Horaires d'ouverture"
              items={c.hours}
              max={8}
              addLabel="Ajouter une ligne"
              empty={{ label: "", value: "" }}
              onChange={(v) => patch("hours", v)}
              render={(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Jours"
                    value={item.label}
                    onChange={(v) => set({ label: v })}
                    placeholder="Lundi - Vendredi"
                  />
                  <Field
                    label="Horaires"
                    value={item.value}
                    onChange={(v) => set({ value: v })}
                    placeholder="07h30 - 17h00"
                  />
                </div>
              )}
            />
            <ListCard
              title="Partenaires"
              items={c.partners}
              max={12}
              addLabel="Ajouter un partenaire"
              empty={{ name: "", url: "", logo: "" }}
              onChange={(v) => patch("partners", v)}
              render={(item, set) => (
                <>
                  <ImageField
                    label="Logo"
                    value={item.logo}
                    onChange={(v) => set({ logo: v })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Nom"
                      value={item.name}
                      onChange={(v) => set({ name: v })}
                    />
                    <Field
                      label="Site web"
                      value={item.url}
                      onChange={(v) => set({ url: v })}
                      placeholder="https://"
                    />
                  </div>
                </>
              )}
            />
          </>
        )}
      </div>

      {/* Barre d'enregistrement */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:left-60">
        <div className="flex items-center justify-end gap-3">
          {status && (
            <output
              className={cn(
                "text-sm",
                status.ok ? "text-primary" : "text-destructive",
              )}
            >
              {status.msg}
            </output>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="gap-1.5 rounded-full text-white"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
