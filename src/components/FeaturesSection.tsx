import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Brain, Database, Rocket, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Visual Canvas Builder",
    description: "Drag and drop components to design your app visually. No design skills required.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Brain,
    title: "AI Code Generation",
    description: "Our AI generates production-ready React, Node.js, and database code automatically.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Database,
    title: "Backend & Database",
    description: "Create APIs, authentication flows, and database schemas with simple prompts.",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description: "Deploy your full-stack application to production with a single click.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Built-in authentication, role management, and security best practices.",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: Zap,
    title: "Real-time Preview",
    description: "See your changes instantly with live preview and collaborative editing.",
    gradient: "from-yellow-500 to-orange-500"
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything You Need to Build
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Modern Web Apps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to deployment in minutes. Our AI-powered platform handles the technical complexity
            so you can focus on your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-border/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};