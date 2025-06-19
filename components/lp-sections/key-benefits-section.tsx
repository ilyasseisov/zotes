import { Focus, FolderOpen, Zap } from "lucide-react";

export function KeyBenefitsSection() {
  const benefits = [
    {
      icon: Focus,
      title: "Stay Focused",
      description:
        "Clean, distraction-free interface keeps your mind on what matters most",
    },
    {
      icon: FolderOpen,
      title: "Get Organized",
      description:
        "Simple organization system makes finding your notes effortless",
    },
    {
      icon: Zap,
      title: "Start Instantly",
      description:
        "No setup required - jump in and start capturing your thoughts right away",
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Section Header */}
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose Our Note-Taking App?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
            Experience the power of simplicity with features designed to enhance
            your productivity
          </p>

          {/* Benefits Grid */}
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Icon */}
                  <div className="mb-6 rounded-full bg-primary/10 p-4 transition-colors duration-200 group-hover:bg-primary/20">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
