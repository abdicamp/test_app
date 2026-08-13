/** Editable website content — Cloud Agent should mainly update this file. */
export type NavItem = {
  label: string;
  href: string;
};

export type SiteContent = {
  brand: string;
  nav: NavItem[];
  heroTitle: string;
  heroBody: string;
  ctaLabel: string;
  ctaHref: string;
  themeToggleLight: string;
  themeToggleDark: string;
  sections: { id: string; title: string; body: string }[];
};

export const siteContent: SiteContent = {
  brand: "TEST APP",
  nav: [
    { label: "Home", href: "#home" },
    { label: "Product", href: "#product" },
    { label: "About", href: "#about" },
  ],
  heroTitle: "Website + AI chatroom dalam satu tempat.",
  heroBody:
    "Ketik perintah di panel chat. Cursor Cloud Agent akan mengedit source repo ini, push ke main, lalu Vercel me-refresh website.",
  ctaLabel: "Lihat chat",
  ctaHref: "#chat",
  themeToggleLight: "Mode terang",
  themeToggleDark: "Mode gelap",
  sections: [
    {
      id: "product",
      title: "Product",
      body: "Jelajahi produk kami — solusi yang dirancang untuk kebutuhan Anda.",
    },
    {
      id: "about",
      title: "About",
      body: "Ini adalah situs demo. Konten di halaman ini bisa diubah lewat perintah human di chatroom.",
    },
  ],
};
