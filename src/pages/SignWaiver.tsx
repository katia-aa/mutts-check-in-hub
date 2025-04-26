
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignaturePad from "@/components/SignaturePad";

const SignWaiver = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100 px-4 py-12 font-[Inter]">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-4xl font-bold text-gray-800">
            Step 1: Sign the Waiver
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignaturePad />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignWaiver;
