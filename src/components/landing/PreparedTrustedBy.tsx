export function PreparedTrustedBy() {
  const logos = [
    { name: "Walmart", url: "/images/logos/walmart.jpg" },
    { name: "Y Combinator", url: "/images/logos/yc.png" },
    { name: "Pika", url: "/images/logos/pika.jpg" },
    { name: "Dropbox", url: "/images/logos/dropbox.jpg" },
    { name: "Microsoft", url: "/images/logos/microsoft.jpg" },
    { name: "Amazon", url: "/images/logos/amazon.png" },
    { name: "Moniepoint", url: "/images/logos/moniepoint.jpg" },
    { name: "Paystack", url: "/images/logos/paystack.png" },
    { name: "Scale", url: "/images/logos/scale.png" },
    { name: "Sterling", url: "/images/logos/sterling.jpg" },
    { name: "Patricia", url: "/images/logos/patricia.png" },
    { name: "OPay", url: "/images/logos/opay.jpg" },
    { name: "Jumia", url: "/images/logos/jumia.jpg" },
    { name: "Meta", url: "/images/logos/meta.jpg" },
    { name: "NVIDIA", url: "/images/logos/nvidia.jpg" }
  ];

  return (
    <section className="relative w-full py-20 bg-transparent z-20">
      <div className="flex justify-center w-full mb-12">
        <span className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase px-6">Trusted By</span>
      </div>
      <div className="w-full relative flex overflow-hidden group">
        <div className="animate-scroll-logos flex items-center gap-20 lg:gap-32 opacity-40 grayscale w-max">
           {[...logos, ...logos].map((logo, idx) => (
             <div key={idx} className="flex-shrink-0">
                <img 
                  src={logo.url} 
                  alt={logo.name} 
                  className="h-12 lg:h-16 w-auto object-contain transition-all hover:grayscale-0 hover:opacity-100 cursor-pointer mix-blend-multiply" 
                />
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
