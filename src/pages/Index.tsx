
import CheckInForm from "@/components/CheckInForm";
import CheckInLayout from "@/components/CheckInLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [isGuest, setIsGuest] = useState(false);

  return (
    <CheckInLayout 
      step={1}
      title="Woof! Welcome!"
      subtitle={isGuest ? 
        "Enter your name and select who you're a guest of" : 
        "Enter your email to check in for the Mutts in the 6ix Mid Week Event 🐾"
      }
    >
      <div className="space-y-6">
        <div className="flex gap-2 justify-center">
          <Button
            variant={!isGuest ? "default" : "outline"}
            onClick={() => setIsGuest(false)}
            className="w-full"
          >
            Ticket Holder
          </Button>
          <Button
            variant={isGuest ? "default" : "outline"}
            onClick={() => setIsGuest(true)}
            className="w-full"
          >
            Guest
          </Button>
        </div>
        <CheckInForm isGuest={isGuest} />
      </div>
    </CheckInLayout>
  );
};

export default Index;
