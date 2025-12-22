import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import dashboardImg from "@/assets/dashboard.png";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white 
      pt-[calc(5rem+20px)] lg:pt-[calc(8rem+32px)]
      pb-24 lg:pb-32">
      {/* Background Blobs & Grid */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-[-12rem] left-[-10rem] w-[520px] h-[520px] rounded-full bg-gradient-to-r from-[#6C5DD3]/30 via-[#9B51E0]/30 to-[#BB6BD9]/30 blur-3xl animate-blob" />
        <div className="absolute bottom-[-10rem] right-[-8rem] w-[420px] h-[420px] rounded-full bg-gradient-to-r from-[#4BC0F7]/25 via-[#3A6FF7]/25 to-[#6C5DD3]/25 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-[35%] left-[45%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-[#FF7EB3]/20 via-[#FF758C]/20 to-[#FF5C7C]/20 blur-3xl animate-blob animation-delay-4000" />

        {/* Soft grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Container */}
      <div className="container-custom relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider">
            Global Hiring Platform
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
            Scale your{" "}
            <span className="gradient-text">engineering</span> &{" "}
            <span className="gradient-text">business</span> teams globally
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 text-balance">
            Hire pre-vetted professionals from emerging markets. Build
            world-class teams faster — without the world-class overhead.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
            <Button className="gradient-primary text-white flex items-center gap-2 shadow-lg hover:brightness-110 transition h-12 px-8 w-full sm:w-auto">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              className="border-border flex items-center gap-2 hover:bg-muted transition h-12 px-8 w-full sm:w-[200px]"
            >
              <Play className="w-5 h-5" /> Watch Demo
            </Button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-md lg:max-w-lg h-96 lg:h-[28rem]">
            <img
              src={dashboardImg}
              alt="FlowBoard Dashboard"
              className="w-full h-full object-contain rounded-3xl shadow-2xl shadow-primary/20 transform rotate-[-6deg] hover:rotate-0 transition-all duration-500 ease-out"
            />

            {/* Floating accents */}
            <div className="absolute -top-10 -left-8 w-24 h-24 rounded-2xl bg-gradient-to-r from-primary/15 to-transparent blur-xl animate-fade-up" />
            <div className="absolute bottom-5 right-5 w-28 h-28 rounded-2xl bg-gradient-to-r from-secondary/20 to-transparent blur-xl animate-fade-up animation-delay-200" />
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
