import Link from "next/link";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <main>
        <header className="wrap pagehead">
          <h1>cd: no such file or directory</h1>
          <p>That page doesn&apos;t exist. <Link href="/">Back home</Link>.</p>
        </header>
      </main>
      <Footer />
    </>
  );
}
