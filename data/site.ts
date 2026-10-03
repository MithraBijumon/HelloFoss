export const siteConfig = {
  name: "Hello FOSS",
  tagline: "Pan-IIT Open Source Initiative",
  description:
    "A Pan-IIT open-source initiative bringing students together to build and contribute to real-world open-source projects.",
  url: "https://hellofoss.dev",
  registerUrl: "#",
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Mentors", href: "/mentors" },
    { label: "Timeline", href: "/timeline" },
    { label: "Rulebook", href: "/rulebook" },
    { label: "FAQ", href: "/faq" },
  ],
  footerLinks: [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Mentors", href: "/mentors" },
    { label: "Timeline", href: "/timeline" },
    { label: "Rulebook", href: "/rulebook" },
    { label: "FAQ", href: "/faq" },
    { label: "Register", href: "#" },
  ],
  social: {
    github: "",
    instagram: "",
    linkedin: "",
    discord: "https://discord.com/invite/gmqUSG5rX",
  },
} as const;
