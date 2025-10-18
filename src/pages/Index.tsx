import React from "react";
import CheckInForm from "@/components/CheckInForm";
import CheckInLayout from "@/components/CheckInLayout";

const Index = () => {
  return (
    <CheckInLayout
      step={1}
      title="💾 Boot Up!"
      subtitle="Let's get you checked in 🐾"
      totalSteps={2}
    >
      <div className="space-y-6">
        <CheckInForm />
      </div>
    </CheckInLayout>
  );
};

export default Index;
