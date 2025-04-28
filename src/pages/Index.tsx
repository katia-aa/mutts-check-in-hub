
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
            <Link to="/guest-check-in" className="inline-flex items-center gap-1 bg-mutts-primary text-white px-3 py-1 rounded-md font-semibold hover:bg-mutts-primary/90 transition-colors">
              check in separately
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </p>
        </div>
      </div>
    </CheckInLayout>
  );
};

export default Index;
