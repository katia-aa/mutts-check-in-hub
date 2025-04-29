
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
        
        <div className="text-center p-4 bg-mutts-primary/10 rounded-lg border border-mutts-primary/20 shadow-sm">
          <p className="text-mutts-primary font-medium mb-1">
            Bringing a furry friend's human along? 
          </p>
          <p className="text-gray-600">
            We know paperwork is ruff, but your guest needs to check in too! They can do so by clicking below:
          </p>
          <Link 
            to="/guest-check-in" 
            className="inline-block mt-3 px-4 py-2 bg-mutts-secondary text-white rounded-lg hover:bg-mutts-secondary/90 transition-colors"
          >
            Guest Check-In Here
          </Link>
        </div>
      </div>
    </CheckInLayout>
  );
};

export default Index;
