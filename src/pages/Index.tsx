
import CheckInForm from "@/components/CheckInForm";
import CheckInLayout from "@/components/CheckInLayout";

const Index = () => {
  return (
    <CheckInLayout 
      step={1}
      title="Woof! Welcome!"
      subtitle="Enter your email to check in for the Mutts in the 6ix Mid Week Event 🐾"
    >
      <CheckInForm />
    </CheckInLayout>
  );
};

export default Index;
