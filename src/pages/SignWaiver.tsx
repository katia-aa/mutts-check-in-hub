
import CheckInLayout from "@/components/CheckInLayout";
import SignaturePad from "@/components/SignaturePad";

const SignWaiver = () => {
  return (
    <CheckInLayout 
      step={2}
      title="Pawsome! Let's Sign"
      subtitle="Quick paw print needed to confirm you understand the woof rules"
    >
      <SignaturePad />
    </CheckInLayout>
  );
};

export default SignWaiver;
