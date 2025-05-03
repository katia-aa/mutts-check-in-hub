
import React from "react";
import CheckInForm from "@/components/CheckInForm";
import CheckInLayout from "@/components/CheckInLayout";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TicketHolder = () => {
  return (
    <CheckInLayout
      step={1}
      title="Welcome Back, Ticket Holder!"
      subtitle="Let's verify your registration 🐾"
    >
      <div className="space-y-6">
        <CheckInForm isGuest={false} />

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-mutts-primary hover:text-mutts-primary/80 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to check-in options
          </Link>
        </div>
      </div>
    </CheckInLayout>
  );
};

export default TicketHolder;
