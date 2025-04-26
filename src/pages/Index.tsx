
import CheckInForm from "@/components/CheckInForm";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100 px-4 py-12 font-[Inter]">
      <div className="w-full max-w-lg mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 animate-fade-in">
            Welcome to Check-In!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            To check in for Mutts in the 6ix Mid Week Event, please enter the email you used when purchasing your Eventbrite ticket.
          </p>
        </div>
        <CheckInForm />
      </div>
    </div>
  );
};

export default Index;
