import Link from "next/link";
import { footer } from "@/constants/site";

export default function Footer({ wide = false }: { wide?: boolean }) {
  return (
    <footer className={wide ? "footer footer--wide" : "footer"}>
      <span>
        {footer.socials.map((s, i) => (
          <span key={s.href}>{i > 0 && " / "}<a href={s.href}>{s.label}</a></span>
        ))}
      </span>
      <Link href={footer.archive.href}>{footer.archive.label}</Link>
    </footer>
  );
}
