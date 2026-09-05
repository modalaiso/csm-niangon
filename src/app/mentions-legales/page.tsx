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
          Le présent site internet est édité par une personne physique :
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <strong>Éditeur</strong> : <i>Mobio Israel</i>
          </li>
          <li>
            <strong>Adresse</strong> : <i>Abidjan, Côte d'Ivoire</i>
          </li>
          <li>
            <strong>Email de contact</strong> : <i>[contact@csm-niangon.com]</i>
          </li>
          <li>
            <strong>Contact protection des données</strong> :{" "}
            <i>[privacy@...]</i>
          </li>
          <li>
            <strong>Directeur de la publication</strong> :{" "}
            <i>[Nom du directeur]</i>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          2. Hébergement et Services Tiers
        </h2>
        <p className="text-muted-foreground">
          Le site est hébergé et s'appuie sur les infrastructures techniques des
          prestataires suivants :
        </p>
        <p className="mt-1 ml-1 text-muted-foreground">
          <strong>Vercel Inc.</strong> 440 N Barranca Ave #4133, Covina, CA
          91723, États-Unis
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
          L'authentification et le stockage des données sont assurés par :
        </p>
        <p className="mt-1 ml-1 text-muted-foreground">
          <strong>Supabase Inc.</strong> Camden, 3500 S Dupont Hwy, États-Unis
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
          L'ensemble des éléments du site (textes, logo, mise en page, éléments
          graphiques, photographies, code source) est protégé par le droit
          d'auteur et demeure la propriété de CSM Niangon ou de ses
          contributeurs, sauf mention contraire. <br />
          Toute reproduction ou représentation, totale ou partielle, sans
          autorisation préalable est interdite.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          4. Données personnelles et Confidentialité
        </h2>
        <p className="text-muted-foreground">
          Conformément à la législation relative à la protection des données à
          caractère personnel en Côte d'Ivoire (Loi n° 2013-450) :
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            Les informations collectées via le système d'authentification et les
            formulaires sont uniquement destinées à la gestion des comptes et au
            fonctionnement du site.
          </li>
          <li>
            Vous disposez d'un droit d'accès, de modification et de suppression
            de vos données personnelles.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          5. Limitation de responsabilité
        </h2>
        <p className="text-muted-foreground">
          L'Éditeur s'efforce de fournir des informations exactes et de
          maintenir le service disponible. Toutefois, il ne saurait être tenu
          responsable des erreurs, omissions, interruptions de service ou
          indisponibilités temporaires.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          6. Droit applicable et Juridiction compétente
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
