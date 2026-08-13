import { ChatRoom } from "@/components/ChatRoom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteContent } from "@/content/site";

export default function HomePage() {
  return (
    <div className="page">
      <header className="top">
        <div className="brand">{siteContent.brand}</div>
        <div className="top-actions">
          <nav>
            {siteContent.nav.map((item) => (
              <a key={item.href + item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <h1>{siteContent.heroTitle}</h1>
          <p>{siteContent.heroBody}</p>
          <a className="cta" href={siteContent.ctaHref}>
            {siteContent.ctaLabel}
          </a>
        </section>

        {siteContent.sections.map((section) => (
          <section key={section.id} id={section.id} className="block">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}

        <div className="chat-wrap">
          <ChatRoom />
        </div>
      </main>

      <style>{`
        .page {
          min-height: 100vh;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 24px 6vw 8px;
        }
        .brand {
          font-size: 24px;
          letter-spacing: 0.12em;
          font-weight: 700;
        }
        .top-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        nav {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        nav a {
          text-decoration: none;
          color: var(--teal);
          font-weight: 600;
          font-size: 14px;
        }
        main {
          padding: 24px 6vw 64px;
          display: grid;
          gap: 28px;
        }
        .hero h1 {
          margin: 0;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          max-width: 14ch;
        }
        .hero p,
        .block p {
          color: var(--ink-soft);
          max-width: 38rem;
          line-height: 1.55;
        }
        .cta {
          display: inline-block;
          margin-top: 8px;
          background: var(--coral);
          color: white;
          text-decoration: none;
          font-weight: 700;
          padding: 12px 18px;
          border-radius: 14px;
        }
        .block h2 {
          margin: 0 0 8px;
          font-size: 1.6rem;
        }
        .chat-wrap {
          margin-top: 8px;
        }
        @media (min-width: 980px) {
          main {
            grid-template-columns: 1.05fr 0.95fr;
            align-items: start;
          }
          .hero,
          .block {
            grid-column: 1;
          }
          .chat-wrap {
            grid-column: 2;
            grid-row: 1 / span 8;
            position: sticky;
            top: 18px;
          }
        }
      `}</style>
    </div>
  );
}
