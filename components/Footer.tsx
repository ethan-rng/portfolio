import Link from "next/link";
import { footer } from "@/constants/site";
import { hackWesternUrl } from "@/lib/hackwestern";

export default async function Footer({ wide = false }: { wide?: boolean }) {
  const hw = await hackWesternUrl();
  return (
    <footer className={wide ? "footer footer--wide" : "footer"}>
      <span>
        {footer.socials.map((s, i) => (
          <span key={s.href}>{i > 0 && " / "}<a href={s.href}>{s.label}</a></span>
        ))}
      </span>
      <Link href={footer.archive.href}>{footer.archive.label}</Link>
      <p className="footer-credit">
        inspired by <a href={footer.inspiredBy.daoho.href}>{footer.inspiredBy.daoho.label}</a> and{" "}
        <a href={hw}>{footer.inspiredBy.hackWestern}</a>
      </p>
    </footer>
  );
}
