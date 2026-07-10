import { getFeaturedPosts, getPublishedPosts } from "@/app/actions/posts";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { PostsExplorer } from "@/components/home/posts-explorer";

export default async function Home() {
  const [featuredPosts, posts] = await Promise.all([
    getFeaturedPosts(5),
    getPublishedPosts(40),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <HeroCarousel posts={featuredPosts} />
      <PostsExplorer posts={posts} />
    </main>
  );
}