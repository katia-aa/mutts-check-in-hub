import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CheckInLayout from "@/components/CheckInLayout";

const Index = () => {
  return (
    <CheckInLayout
      step={0}
      title="Mutts Assemble: Your Check-in Awaits!"
      subtitle="Welcome to the pawty! Choose how you'd like to check in"
    >
      <div className="space-y-6">
        {/* Ticket Holder Option */}
        <div className="p-6 bg-white rounded-xl border border-mutts-primary/20 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-xl font-bold text-mutts-primary">
              🐾 I bought my own ticket
            </h3>
          </div>
          <Button
            asChild
            className="w-full h-12 text-lg font-medium bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl transition-all"
          >
            <Link to="/ticket-holder">I'm the Ticket Holder</Link>
          </Button>
        </div>

        {/* Guest Option */}
        <div className="p-6 bg-white rounded-xl border border-mutts-secondary/20 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-xl font-bold text-mutts-secondary">
              🎉 A friend bought my ticket
            </h3>
          </div>
          <Button
            asChild
            className="w-full h-12 text-lg font-medium bg-mutts-secondary hover:bg-mutts-secondary/90 rounded-xl transition-all"
          >
            <Link to="/guest-check-in">Check in as Guest</Link>
          </Button>
        </div>
      </div>
    </CheckInLayout>
  );
};

export default Index;
