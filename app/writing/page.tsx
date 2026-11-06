import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PostList from "@/components/PostList";
import { pages } from "@/constants/pages";
import { postsIn } from "@/constants/posts";

export const metadata: Metadata = { title: "Writing" };

export default function Writing() {
  return (
    <>
      <main>
        <header className="wrap pagehead">
          <h1>{pages.writing.command}</h1>
          <p>{pages.writing.intro}</p>
        </header>
        <section className="wrap section">
          <PostList posts={postsIn("writing")} dateFormat="month" variant="cards" ascii />
        </section>
      </main>
      <Footer />
    </>
  );
}
