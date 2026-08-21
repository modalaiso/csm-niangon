import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "Politique de confidentialité | CSM Niangon",
};

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout title="Politique de confidentialité" lastUpdated="21 août 2026">
      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">1. Responsable du traitement</h2>
        <p className="text-muted-foreground">
          CSM Niangon, Abidjan, Yopougon Niangon, Côte d&apos;Ivoire, est responsable du
          traitement des données à caractère personnel décrites dans la présente politique.
          Pour toute question relative à vos données, vous pouvez nous contacter à l&apos;adresse
          {" "}mobioisrael@hotmail.com.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">2. Données que nous collectons</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Données de compte</strong> : nom, prénom, nom
            d&apos;utilisateur, email, classe, matricule (facultatif), photo de profil, bio.
          </li>
          <li>
            <strong className="text-foreground">Contenu publié</strong> : publications,
            commentaires, réponses, likes, réactions.
          </li>
          <li>
            <strong className="text-foreground">Statistiques de vues</strong> : un compteur de
            vues par publication est tenu à partir de votre identifiant de compte (si connecté)
            ou de votre adresse IP (si non connecté), afin d&apos;éviter les doubles comptages.
          </li>
          <li>
            <strong className="text-foreground">Mesure d&apos;audience</strong> (uniquement avec
            votre consentement) : pages visitées, référent, type d&apos;appareil, et un
            identifiant de session anonyme stocké dans votre navigateur.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">3. Cookies et traceurs</h2>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[500px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Finalité</th>
                <th className="py-2">Soumis à consentement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="py-2 pr-4">Cookies de session Supabase</td>
                <td className="py-2 pr-4">Maintenir votre connexion à votre compte</td>
                <td className="py-2">Non (strictement nécessaire)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">csm_cookie_consent</td>
                <td className="py-2 pr-4">Mémoriser votre choix concernant les cookies</td>
                <td className="py-2">Non (strictement nécessaire)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">csm_visit_sid</td>
                <td className="py-2 pr-4">Identifiant de session anonyme, mesure d&apos;audience interne</td>
                <td className="py-2">Oui</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Vercel Analytics</td>
                <td className="py-2 pr-4">Statistiques de fréquentation agrégées</td>
                <td className="py-2">Oui</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-muted-foreground">
          Vous pouvez modifier votre choix à tout moment via le lien &laquo;&nbsp;Gérer les
          cookies&nbsp;&raquo; en pied de page.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">4. Finalités et bases légales</h2>
        <p className="text-muted-foreground">
          Vos données sont traitées pour : la gestion de votre compte et de vos publications,
          la modération des contenus, l&apos;affichage des statistiques de vues, la mesure
          d&apos;audience (avec votre consentement), et la sécurité du service (par exemple, la
          vérification que votre mot de passe n&apos;a pas déjà fait l&apos;objet d&apos;une fuite
          de données connue, avant la création de votre compte).
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">5. Destinataires des données</h2>
        <p className="text-muted-foreground">
          Vos données sont accessibles à l&apos;équipe CSM Niangon habilitée (modérateurs,
          administrateurs) dans le cadre de leurs fonctions, ainsi qu&apos;à nos
          sous-traitants techniques : Vercel Inc. (hébergement) et Supabase Inc.
          (authentification, base de données, stockage de fichiers). Vos données ne sont ni
          vendues, ni cédées à des fins commerciales à des tiers.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">6. Durée de conservation</h2>
        <p className="text-muted-foreground">
          Les données de compte sont conservées tant que votre compte est actif, et supprimées
          à votre demande (page Profil). Les journaux de navigation utilisés pour la mesure
          d&apos;audience sont conservés 13 mois maximum.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">7. Utilisateurs mineurs</h2>
        <p className="text-muted-foreground">
          Le site s&apos;adresse à la communauté scolaire du CSM Niangon, susceptible
          d&apos;inclure des élèves mineurs. Nous invitons les parents et tuteurs à accompagner
          leurs enfants dans l&apos;utilisation du site et à nous contacter à
          {" "}mobioisrael@hotmail.com pour toute demande relative aux données d&apos;un
          mineur dont ils ont la responsabilité.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">8. Vos droits</h2>
        <p className="text-muted-foreground">
          Conformément à la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la
          protection des données à caractère personnel, vous disposez d&apos;un droit
          d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition sur vos données.
          Vous pouvez exercer ces droits directement depuis votre{" "}
          <Link href="/profile" className="text-primary hover:underline">page de profil</Link>,
          {" "}ou en nous contactant à mobioisrael@hotmail.com. En cas de réponse insuffisante,
          vous pouvez saisir l&apos;Autorité de Régulation des Télécommunications/TIC de Côte
          d&apos;Ivoire (ARTCI), autorité de protection des données personnelles en Côte
          d&apos;Ivoire.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">9. Modification de cette politique</h2>
        <p className="text-muted-foreground">
          Cette politique peut être mise à jour. La date de dernière mise à jour figure en
          haut de cette page.
        </p>
      </section>
    </LegalPageLayout>
  );
}