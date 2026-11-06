import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PostBody from "@/components/PostBody";
import Video from "@/components/Video";
import { getPost, posts } from "@/constants/posts";
import { fullDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => posts.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  // Writing and tech. work open with their thumbnail, plain, right under the facts.
  // If the thumbnail is a video's still, the video itself moves up to take its place.
  const isWork = post.category !== "blog";
  const cover = isWork && post.cover !== false ? post.cover ?? post.image : undefined;
  const coverVideo = cover ? post.blocks.find((b) => b.type === "video" && b.poster === post.image) : undefined;
  const blocks = coverVideo ? post.blocks.filter((b) => b !== coverVideo) : post.blocks;

  return (
    <>
      <main>
        <article className="wrap article">
          <h1 className="article-title">{post.title}</h1>
          <p className="article-meta"><time dateTime={post.date}>{fullDate(post.date)}</time></p>
          {post.facts && (
            <ul className="facts">
              {post.facts.map((f) => (
                <li key={f.label}><strong>{f.label}</strong><span dangerouslySetInnerHTML={{ __html: f.value }} /></li>
              ))}
            </ul>
          )}
          {coverVideo?.type === "video" ? (
            <figure className="cover">
              <Video id={coverVideo.youtubeId} title={coverVideo.caption || post.title} poster={coverVideo.poster} />
              {coverVideo.caption && <figcaption>{coverVideo.caption}</figcaption>}
            </figure>
          ) : cover ? (
            <figure className={cover.endsWith(".png") ? "cover fig--cutout" : "cover fig--plain"}>
              <img src={cover} alt="" />
            </figure>
          ) : null}
          {isWork && blocks[0]?.type === "p" ? (
            // the opening paragraph is the summary; a rule sets it off from the rest
            <>
              <PostBody blocks={blocks.slice(0, 1)} />
              <hr className="summary-rule" />
              <PostBody blocks={blocks.slice(1)} />
            </>
          ) : (
            <PostBody blocks={blocks} />
          )}
          <p className="back">
            {post.back.map((l, i) => (
              <span key={l.href}>{i > 0 && " · "}<a href={l.href}>{l.label}</a></span>
            ))}
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
