import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PostList from "@/components/PostList";
import { pages } from "@/constants/pages";
import { postsIn } from "@/constants/posts";

export const metadata: Metadata = { title: "Tech. work" };

export default function Projects() {
  return (
    <>
      <main>
        <header className="wrap pagehead">
          <h1>{pages.projects.command}</h1>
          <p>{pages.projects.intro}</p>
        </header>
        <section className="wrap section">
          <PostList posts={postsIn("projects")} variant="cards" ascii />
        </section>
      </main>
      <Footer />
    </>
  );
}
