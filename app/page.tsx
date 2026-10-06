import Link from "next/link"

const works = [
  {
    eyebrow: "ORIGINAL // PLAYABLE",
    title: "NEON//DEBT",
    year: "A Nex original",
    description: "One bad contract. One stolen mind. A very small amount of professional judgement.",
    href: "/neon-debt",
    action: "ENTER SECTOR 9",
    tone: "neon",
  },
  {
    eyebrow: "PUBLIC DOMAIN // PLAYABLE",
    title: "Dr Jekyll & Mr Hyde",
    year: "Robert Louis Stevenson · 1886",
    description: "A respectable door. A violent stranger. A secret London would prefer left behind it.",
    href: "/jekyll-hyde",
    action: "OPEN THE CASE",
    tone: "jekyll",
  },
  {
    eyebrow: "PUBLIC DOMAIN // PLANNED",
    title: "The Count of Monte Cristo",
    year: "Alexandre Dumas · 1844",
    description: "Betrayal, imprisonment, reinvention and a revenge patient enough to become an art.",
    href: "#",
    action: "IN THE ARCHIVE",
    tone: "monte",
  },
]

export default function Home() {
  return (
    <main className="library">
      <section className="masthead">
        <div className="mast-copy">
          <p className="kicker">THE OPEN SHELF // INTERACTIVE FICTION</p>
          <h1>Old stories.<br/><em>New choices.</em></h1>
          <p className="lede">A growing collection of text-based games: original experiments and new interactive adaptations of works that have outlived their copyright.</p>
        </div>
        <div className="bookplate" aria-hidden="true">
          <span>EST.</span><strong>2026</strong><span>READ · CHOOSE · REGRET</span>
        </div>
      </section>

      <div className="rule"><span>VOLUME I</span><i/></div>

      <section className="shelf" aria-label="Interactive fiction collection">
        {works.map((work, i) => (
          <article className={"work " + work.tone} key={work.title}>
            <div className="work-number">0{i + 1}</div>
            <div className="work-copy">
              <p className="eyebrow">{work.eyebrow}</p>
              <h2>{work.title}</h2>
              <p className="year">{work.year}</p>
              <p className="description">{work.description}</p>
              {work.href !== "#" ? (
                <Link className="enter" href={work.href}>{work.action}<span>→</span></Link>
              ) : (
                <span className="enter disabled">{work.action}</span>
              )}
            </div>
            <div className="sigil" aria-hidden="true">
              {work.tone === "neon" ? "⌁" : work.tone === "jekyll" ? "⅋" : "♜"}
            </div>
          </article>
        ))}
      </section>

      <footer className="library-footer">
        <p>THE OPEN SHELF</p>
        <p>Built as an experiment in human direction and machine-assisted development.</p>
      </footer>
    </main>
  )
}
