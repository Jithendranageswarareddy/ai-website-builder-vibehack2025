import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Ready to Build Your Dream App?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of founders who have launched successful products without writing a single line of code.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 my-12">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-sm text-white/80">Advanced AI generates optimized code for you</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-sm text-white/80">Deploy in minutes, not months</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Enterprise Ready</h3>
                <p className="text-sm text-white/80">Secure, scalable, and production-ready</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Link to="/builder">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 text-lg px-8 py-4 h-auto group">
                Start Building Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-white/70">
              Free forever • No credit card required • Deploy instantly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};