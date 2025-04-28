
import CheckInForm from "@/components/CheckInForm";
import CheckInLayout from "@/components/CheckInLayout";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <CheckInLayout 
      step={1}
      title="Woof! Welcome!"
      subtitle="Enter your email to check in for the Mutts in the 6ix Mid Week Event 🐾"
    >
      <div className="space-y-6">
        <CheckInForm isGuest={false} />
        
        <div className="text-center p-3 bg-mutts-primary/10 rounded-lg border border-mutts-primary/20 shadow-sm">
          <p className="text-mutts-primary font-medium">
            Bringing a friend? They'll need to{" "}
            <Link to="/guest-check-in" className="text-mutts-secondary font-medium hover:underline cursor-pointer transition-colors">
              check in separately
            </Link>.
          </p>
        </div>
      </div>
    </CheckInLayout>
  );
};

export default Index;
