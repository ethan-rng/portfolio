import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PostList from "@/components/PostList";
import Terminal from "@/components/Terminal";
import { archives } from "@/constants/archive";
import { pages } from "@/constants/pages";
import { postsIn } from "@/constants/posts";

export const metadata: Metadata = { title: "Blog" };

export default function Blog() {
  const posts = postsIn("blog");
  return (
    <>
      <main>
        <header className="wrap pagehead">
          <h1>{pages.blog.command}</h1>
          <p>{pages.blog.intro}</p>
        </header>
        <section className="wrap section">
          <Terminal
            title="~/blog"
            lines={[{ cmd: "cat motd", out: "photos, food, and things drawn in characters.\ntype help, or ls." }]}
            entries={posts.map((p) => ({ slug: p.slug, title: p.title, date: p.date }))}
            archives={archives}
          />
        </section>
        <section className="wrap section">
          <h2 className="label">posts</h2>
          <PostList posts={posts} variant="cards" />
        </section>
        {archives.length > 0 && (
          <section className="wrap section" id="archive">
            <h2 className="label">archive</h2>
            <ul className="archive">
              {archives.map((a) => (
                <li key={a.href}>
                  <a href={a.href}>{a.label}</a>
                  {a.note && <span className="dim"> {a.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
