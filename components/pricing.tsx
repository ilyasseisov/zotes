"use client";

import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Pricing() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-muted-foreground">
          Choose the plan that&apos;s right for you and get started today.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {/* Basic Plan */}
        <Card className="flex flex-col border-border shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">Basic</CardTitle>
            <CardDescription className="mt-2 text-sm">
              Perfect for individuals and small projects
            </CardDescription>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $9
              <span className="ml-1 text-xl font-medium text-muted-foreground">
                /month
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Up to 5 projects</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Up to 10GB storage</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>24/7 email support</span>
              </li>
            </ul>
            <Separator className="my-6" />
            <div className="text-sm text-muted-foreground">
              <p>Cancel anytime. No questions asked.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              Get Started
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative flex flex-col border-border shadow-sm transition-all hover:shadow-md">
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <Badge className="px-3 py-1 text-xs" variant="default">
              Most Popular
            </Badge>
          </div>
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription className="mt-2 text-sm">
              For teams and growing businesses
            </CardDescription>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $29
              <span className="ml-1 text-xl font-medium text-muted-foreground">
                /month
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Up to 100GB storage</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Team collaboration tools</span>
              </li>
            </ul>
            <Separator className="my-6" />
            <div className="text-sm text-muted-foreground">
              <p>30-day money-back guarantee</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Get Started</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
