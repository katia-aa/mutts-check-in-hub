
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
        
        <p className="text-sm text-center text-gray-500 pt-2">
          Bringing a friend? They'll need to{" "}
          <Link to="/guest-check-in" className="text-mutts-primary hover:underline">
            check in separately
          </Link>
          .
        </p>
      </div>
    </CheckInLayout>
  );
};

export default Index;
