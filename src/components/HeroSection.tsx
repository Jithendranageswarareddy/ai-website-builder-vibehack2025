import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Code2, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-subtle overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-ai rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-primary rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/10 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered No-Code Platform</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Build Full-Stack Apps
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Without Code</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[500px] leading-relaxed">
                Design visually, generate production-ready code, and deploy complete web applications with AI assistance. Perfect for non-technical founders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/builder">
                <Button size="lg" className="btn-hero group">
                  Start Building Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="btn-ghost-ai">
                <Code2 className="mr-2 w-4 h-4" />
                View Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">AI Assistant Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Deploy in Minutes</span>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-glow">
              <img
                src={heroImage}
                alt="AI-powered website builder interface"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating UI elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-float border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium">Code Generated</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 animate-float border" style={{animationDelay: '1s'}}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium">AI Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};