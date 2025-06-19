import { Button } from "@/components/ui/button";
import IMAGES from "@/constants/images";
import { ArrowRight, PenTool } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <PenTool className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Write down and organize your thoughts{" "}
            <span className="text-primary">effortlessly</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
            A clean, distraction-free tool that helps you stay focused and
            organized. Perfect for students, professionals, and anyone who
            values simplicity.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link href="#pricing">
                <span className="text-nowrap">Start Free</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Product Image */}
          <div className="relative mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <Image
                quality={100}
                width={1000}
                height={595}
                src={IMAGES.SCREENSHOT}
                alt="Clean note-taking interface showing organized thoughts and tasks"
                className="h-auto w-full rounded-xl border bg-background"
              />
              {/* Decorative elements */}
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-primary/5 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
