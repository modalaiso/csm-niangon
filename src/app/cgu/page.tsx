import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "Conditions Générales d'Utilisation | CSM Niangon",
};

export default function CGUPage() {
  return (
    <LegalPageLayout
      title="Conditions Générales d'Utilisation"
      lastUpdated="21 août 2026"
    >
      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">1. Objet</h2>
        <p className="text-muted-foreground">
          Les présentes Conditions Générales d'Utilisation (CGU) régissent
          l'accès et l'usage de la plateforme CSM Niangon, dédiée à la diffusion
          d'actualités, d'articles et d'informations de la communauté. En créant
          un compte ou en utilisant le site, vous acceptez sans réserve les
          présentes CGU.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          2. Accès au service
        </h2>
        <p className="text-muted-foreground">
          La consultation des publications est libre. La création d'un compte
          est nécessaire pour aimer, commenter ou personnaliser son profil.
          Certaines fonctionnalités (rédaction, modération, administration) sont
          réservées aux comptes disposant d'un rôle spécifique (Rédacteur,
          Modérateur, Administrateur), attribué via une clé d'accès.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          3. Comptes utilisateurs
        </h2>
        <p className="text-muted-foreground">
          Vous vous engagez à fournir des informations exactes lors de
          l'inscription et à garder confidentiels vos identifiants de connexion.
          Vous êtes responsable de toute activité effectuée depuis votre compte.
          Vous pouvez à tout moment supprimer votre compte depuis votre page de
          profil.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          4. Contenus publiés par les utilisateurs
        </h2>
        <p className="text-muted-foreground">
          En publiant un commentaire, vous vous engagez à ne pas diffuser de
          contenu illicite, injurieux, diffamatoire, discriminatoire, ou portant
          atteinte aux droits d'un tiers. CSM Niangon se réserve le droit de
          masquer ou supprimer tout contenu contrevenant à ces règles, avec ou
          sans préavis.
        </p>
        <p className="mt-2 text-muted-foreground">
          Certains contenus sont vérifiés automatiquement à la publication au
          moyen d'une liste de mots-clés surveillés : selon la nature du contenu
          détecté, un commentaire peut être automatiquement masqué en attente de
          revue par un modérateur, ou ne pas être publié.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          5. Propriété des contenus
        </h2>
        <p className="text-muted-foreground">
          Les publications éditoriales (actus, articles, infos, annonces)
          restent la propriété de CSM Niangon et de leurs auteurs. Les
          commentaires restent la propriété de leurs auteurs, qui accordent à
          CSM Niangon le droit de les afficher sur la plateforme.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          6. Suspension et suppression de compte
        </h2>
        <p className="text-muted-foreground">
          En cas de non-respect des présentes CGU, CSM Niangon se réserve le
          droit de suspendre ou de supprimer un compte, après signalement et
          vérification par un modérateur ou un administrateur.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          7. Modification des CGU
        </h2>
        <p className="text-muted-foreground">
          CSM Niangon peut modifier les présentes CGU à tout moment. Les
          utilisateurs seront informés de toute modification substantielle. La
          poursuite de l'utilisation du site après modification vaut acceptation
          des nouvelles CGU.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold text-foreground">
          8. Droit applicable
        </h2>
        <p className="text-muted-foreground">
          Les présentes CGU sont soumises au droit ivoirien.
        </p>
      </section>
    </LegalPageLayout>
  );
}
