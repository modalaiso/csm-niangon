import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "Mentions légales | CSM Niangon",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout title="Mentions légales" lastUpdated="21 août 2026">
      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          1. Éditeur du site
        </h2>
        <p className="text-muted-foreground">
          Le présent site est édité par{" "}
          <strong className="text-foreground">CSM Niangon</strong> (
          <span className="italic text-amber-700">
            forme juridique à préciser — association loi 1901 / club sportif
            enregistré, etc.
          </span>
          ), dont le siège est situé à Abidjan, Yopougon Niangon, Côte d'Ivoire.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Email de contact : csm.niangon@yahoo.fr</li>
          <li>Contact protection des données : mobioisrael@hotmail.com</li>
          <li>
            Directeur de la publication :{" "}
            <span className="italic text-amber-700">
              [nom du représentant légal à compléter]
            </span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          2. Hébergement
        </h2>
        <p className="text-muted-foreground">
          Le site (application et code) est hébergé par :
        </p>
        <p className="mt-1 text-muted-foreground">
          Vercel Inc.
          <br />
          340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
          <br />
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            vercel.com
          </a>
        </p>
        <p className="mt-3 text-muted-foreground">
          L'authentification des comptes et le stockage des fichiers (images,
          avatars) sont assurés par :
        </p>
        <p className="mt-1 text-muted-foreground">
          Supabase Inc.
          <br />
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            supabase.com
          </a>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          3. Propriété intellectuelle
        </h2>
        <p className="text-muted-foreground">
          L'ensemble des éléments du site (textes, logo, mise en page, code) est
          protégé par le droit d'auteur et demeure la propriété de CSM Niangon
          ou de ses contributeurs, sauf mention contraire. Toute reproduction ou
          représentation, totale ou partielle, sans autorisation préalable est
          interdite.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          4. Responsabilité
        </h2>
        <p className="text-muted-foreground">
          CSM Niangon met tout en œuvre pour assurer l'exactitude des
          informations publiées, mais ne saurait être tenu responsable des
          erreurs, omissions ou de l'indisponibilité temporaire du service.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          5. Droit applicable
        </h2>
        <p className="text-muted-foreground">
          Les présentes mentions légales sont soumises au droit ivoirien. En cas
          de litige, et à défaut de résolution amiable, les tribunaux compétents
          d'Abidjan seront seuls saisis, sauf disposition légale contraire.
        </p>
      </section>
    </LegalPageLayout>
  );
}
