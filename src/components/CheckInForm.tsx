
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dummy data for valid emails
const VALID_EMAILS = [
  'barkylover@gmail.com',
  'floofqueen@yahoo.com',
  'pupperfan@hotmail.com',
  'waggytails@outlook.com',
  'dogmomlife@gmail.com'
];

const CheckInForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (VALID_EMAILS.includes(email.toLowerCase())) {
        toast({
          title: "Tail-wagging news!",
          description: "We found your registration. Let's continue!",
        });
        navigate('/sign-waiver');
      } else {
        toast({
          variant: "destructive",
          title: "Hmm, that doesn't look right",
          description: "Please use the email from your Eventbrite registration.",
        });
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
          required
          disabled={isLoading}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 text-lg font-medium bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl transition-all"
        disabled={isLoading}
      >
        <Mail className="w-5 h-5 mr-2" />
        {isLoading ? "Checking..." : "Start Check-In"}
      </Button>
      
      <p className="text-sm text-center text-gray-500 pt-2">
        Bringing a friend? They'll need to check in separately.
      </p>
    </form>
  );
};

export default CheckInForm;
