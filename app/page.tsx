import Link from "next/link";
import DecodeName from "@/components/DecodeName";
import HeroFlow from "@/components/HeroFlow";
import Kicker from "@/components/Kicker";
import { education, experience, hero, heroPhotos } from "@/constants/hero";
import { heroLinks } from "@/constants/site";
import type { TimelineRow } from "@/constants/types";

/** A minimal list: one line per row, "year  org  role". */
function Rows({ rows, stacked = false }: { rows: TimelineRow[]; stacked?: boolean }) {
  // stacked: the role drops under the org, for a narrow column
  return (
    <ul className={stacked ? "rows rows--stacked" : "rows"}>
      {rows.map((r) => (
        <li key={`${r.when}-${r.org}-${r.detail ?? r.role}`}>
          <span className={r.when === "next" ? "row-when row-when--next" : "row-when"}>{r.when}</span>
          <strong className="row-org">{r.href ? <Link href={r.href}>{r.org}</Link> : r.org}</strong>
          <span className="row-role">{r.role}</span>
        </li>
      ))}
    </ul>
  );
}

/** Home is one screen: the photo fills it, and everything sits in a band that fades up from the bottom. */
export default function Home() {
  return (
    <main>
      <HeroFlow photos={heroPhotos}>
        {/* viewfinder detail; the frame and photo controls come from HeroFlow */}
        <p className="vf-rec" aria-hidden="true">rec</p>
        <div className="hero-band">
          <section className="band-group band-group--intro">
            <Kicker text={hero.kicker} reply={hero.easterEgg} />
            <DecodeName text={hero.greeting} />
            <p className="hero-intro" dangerouslySetInnerHTML={{ __html: hero.intro }} />
            <p className="band-links">
              {heroLinks.map((l, i) => (
                <span key={l.href}>{i > 0 && " / "}<a href={l.href}>{l.label}</a></span>
              ))}
            </p>
          </section>
          <section className="band-group">
            <h2 className="label">experience</h2>
            <Rows rows={experience} />
          </section>
          <section className="band-group">
            <h2 className="label">education</h2>
            <Rows rows={education} stacked />
          </section>
        </div>
      </HeroFlow>
    </main>
  );
}
