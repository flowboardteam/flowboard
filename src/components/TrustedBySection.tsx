export function TrustedBySection() {
  const companies = [
    "Stripe",
    "Notion",
    "Figma",
    "Vercel",
    "Linear",
    "Raycast",
    "Framer",
    "Webflow",
  ];

  return (
    <section className="py-16 bg-surface-subtle dark:bg-[#181A27] border-y border-border">
      <div className="container-custom">
        <p className="text-center text-sm font-medium text-muted-foreground mb-10 uppercase tracking-wider">
          Trusted by innovative teams worldwide
        </p>

        {/* Scrolling logos container */}
        <div className="overflow-hidden relative">
          <div className="flex gap-12 animate-scroll-logos">
            {companies.concat(companies).map((company, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-all duration-300"
              >
                {/* Logo placeholder */}
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-sm font-bold text-muted-foreground">
                    {company[0]}
                  </span>
                </div>
                {/* Company name */}
                <span className="text-lg font-bold text-muted-foreground">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
