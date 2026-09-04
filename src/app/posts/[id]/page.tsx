import { ArrowLeft, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostComments } from "@/app/actions/comments";
import { getLikeInfo } from "@/app/actions/likes";
import { getPostById, getRelatedPosts } from "@/app/actions/posts";
import { CommentSection } from "@/components/posts/comment-section";
import { LikeButton } from "@/components/posts/like-button";
import { PostGallery } from "@/components/posts/post-gallery";
import { ShareButton } from "@/components/posts/share-button";
import { Avatar } from "@/components/ui/avatar";
import { renderPostContent } from "@/lib/render-post-content";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  ACTU: { label: "Actu", className: "bg-blue-600" },
  ARTICLE: { label: "Article", className: "bg-emerald-500" },
  INFO: { label: "Info", className: "bg-amber-500" },
  ANNONCE: { label: "Annonce", className: "bg-rose-500" },
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata(props: Readonly<PostPageProps>) {
  const resolvedParams = await props.params;
  const post = await getPostById(resolvedParams.id);
  if (!post) {
    return { title: "Publication introuvable | CSM Niangon" };
  }

  const shareImage = post.thumbnail || "/miniature.png";

  return {
    title: `${post.title} | CSM Niangon`,
    description: post.summary,
    openGraph: {
      title: `${post.title} | CSM Niangon`,
      description: post.summary,
      type: "article",
      url: `/posts/${post.id}`,
      images: [
        {
          url: shareImage,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | CSM Niangon`,
      description: post.summary,
      images: [shareImage],
    },
  };
}

export default async function PostPage(props: Readonly<PostPageProps>) {
  const resolvedParams = await props.params;
  const post = await getPostById(resolvedParams.id);

  if (!post) {
    notFound();
  }

  const [relatedPosts, likeInfo, threads] = await Promise.all([
    getRelatedPosts(post.id, post.type, 4),
    getLikeInfo(post.id),
    getPostComments(post.id),
  ]);

  const badge = TYPE_BADGES[post.type] ?? {
    label: post.type,
    className: "bg-gray-500",
  };

  // Galerie complète du post (jusqu'à 15 images uploadées).
  // Fallback thumbnail/mediaUrl uniquement pour les posts créés avant
  // l'introduction du champ "images" (compatibilité ascendante).
  const images =
    post.images && post.images.length > 0
      ? post.images
      : [post.thumbnail, post.mediaUrl].filter((url): url is string =>
          Boolean(url),
        );

  const rawContent =
    post.content && post.content.trim().length > 0
      ? post.content
      : post.summary;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="container max-w-3xl px-4 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <article className="mt-6">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${badge.className}`}
          >
            {badge.label}
          </span>

          <h1 className="mt-4 text-2xl font-bold leading-tight text-slate-900 sm:text-2xl md:text-3xl uppercase">
            {post.title}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {post.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <Avatar
                username={post.author.username}
                avatar={post.author.avatar}
                nom={post.author.nom}
                prenom={post.author.prenom}
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {post.author.prenom} {post.author.nom}
                </p>
                <p className="text-xs text-slate-500">
                  @{post.author.username}
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              {post.publishedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.views}
              </span>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mt-6">
              <PostGallery images={images} alt={post.title} />
            </div>
          )}

          <div className="mt-8">{renderPostContent(rawContent)}</div>

          {/*post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )*/}

          <div className="mt-6 flex items-center gap-2 border-t border-slate-200 pt-5">
            <LikeButton
              postId={post.id}
              initialCount={likeInfo.count}
              initialLiked={likeInfo.likedByUser}
            />
            <ShareButton
              postId={post.id}
              type={post.type}
              title={post.title}
              summary={post.summary}
              thumbnail={post.thumbnail}
            />
          </div>

          <CommentSection postId={post.id} threads={threads} />
        </article>
      </div>

      {/* Autres publications */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-10">
        <div className="container max-w-5xl">
          <h2 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
            Autres publications
          </h2>

          {relatedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-slate-300 py-12 text-center">
              <p className="text-sm font-medium text-slate-500">
                Aucune autre publication pour l'instant
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPosts.map((related) => {
                const relatedBadge = TYPE_BADGES[related.type] ?? {
                  label: related.type,
                  className: "bg-gray-500",
                };
                return (
                  <Link
                    key={related.id}
                    href={`/posts/${related.id}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-primary/40"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                      {related.thumbnail ? (
                        <img
                          src={related.thumbnail}
                          alt={related.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                          Pas d'image
                        </div>
                      )}
                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${relatedBadge.className}`}
                      >
                        {relatedBadge.label}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-bold text-slate-900 uppercase">
                        {related.title}
                      </h3>
                      <p className="line-clamp-3 text-xs text-slate-600">
                        {related.summary}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
