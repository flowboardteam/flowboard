import { Twitter, Linkedin, Github, Instagram } from "lucide-react";

const footerLinks = {
  platform: {
    title: "Platform",
    links: [
      { label: "For Companies", href: "/client/login" },
      { label: "For Talent",    href: "/talent/login" },
      { label: "Pricing",       href: "#"             },
      { label: "Case Studies",  href: "#"             },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers",  href: "#" },
      { label: "Blog",     href: "#" },
      { label: "Press",    href: "#" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Help Center",    href: "/faq"  },
      { label: "Documentation",  href: "#"     },
      { label: "API",            href: "#"     },
      { label: "Status",         href: "#"     },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy",  href: "/privacy" },
      { label: "Terms of Service",href: "/terms"   },
      { label: "Cookie Policy",   href: "#"        },
      { label: "GDPR",            href: "#"        },
    ],
  },
};

const socialLinks = [
  { icon: Twitter,   href: "https://x.com/useflowboard",                          label: "Twitter"   },
  { icon: Linkedin,  href: "https://www.linkedin.com/company/flowboardteam/",      label: "LinkedIn"  },
  { icon: Github,    href: "https://github.com/flowboardteam",                     label: "GitHub"    },
  { icon: Instagram, href: "https://www.instagram.com/useflowboard",              label: "Instagram" },
];

// Bottom bar quick links
const bottomLinks = [
  { label: "Privacy",  href: "/privacy" },
  { label: "Terms",    href: "/terms"   },
  { label: "FAQ",      href: "/faq"     },
];

export function Footer() {
  const isExternal = (url: string) => url.startsWith("http");

  return (
    <footer className="bg-[#0D0F1A] text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-20 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-6 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <img src="/flowboardlogo.png" alt="FlowBoard Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-xl font-bold">Flowboard Team</span>
            </a>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Connecting companies with pre-vetted global talent. Build your dream team faster, smarter, better.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href}
                  target={isExternal(social.href) ? "_blank" : undefined}
                  rel={isExternal(social.href) ? "noopener noreferrer" : undefined}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-110"
                  aria-label={social.label}>
                  <social.icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-6 text-white">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}
                      target={isExternal(link.href) ? "_blank" : undefined}
                      rel={isExternal(link.href) ? "noopener noreferrer" : undefined}
                      className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 container mx-auto px-4 max-w-7xl">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Flowboard Team. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            {bottomLinks.map((item) => (
              <a key={item.label} href={item.href}
                className="text-sm text-gray-500 hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}