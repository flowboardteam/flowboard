import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Check } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  const trustIndicators = ["No upfront fees", "Cancel anytime", "24/7 support"];

  // Safe navigation function
  const navigateToSignup = () => {
    const url = "/signup";
    window.location.href = url;
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50 text-gray-900">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-[-10rem] left-[-10rem] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 animate-blob" />
        <div className="absolute bottom-[-8rem] right-[-8rem] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="relative rounded-[2rem] p-px overflow-hidden shadow-lg"
          >
            {/* Glowing Border */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 opacity-30 blur-xl" />

            {/* Inner Content */}
            <div className="relative bg-white rounded-[2rem] p-8 md:p-12 lg:p-16 text-center border border-gray-200">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-5 py-2 mb-8 border border-purple-200">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
                  Join 10,000+ top professionals
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6">
                Ready to build your{" "}
                <span className="text-gradient">high-velocity team?</span>
              </h2>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-10">
                Whether you're looking to hire elite global talent or find your
                next opportunity, Flowboard connects you with the world's best.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => navigateToSignup()}
                  variant="custom-gradient"
                  size="xl"
                  className="w-full sm:w-auto font-semibold h-14 px-10"
                >
                  Hire Top Talent Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => navigateToSignup()}
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto font-semibold h-14 px-10 border-gray-300 text-gray-900 hover:bg-gray-100"
                >
                  Join as Talent
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mt-12 pt-8 border-t border-gray-200">
                {trustIndicators.map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
