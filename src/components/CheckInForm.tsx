
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CheckInFormProps {
  isGuest: boolean;
}

const CheckInForm = ({ isGuest }: CheckInFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Regular ticket holder flow
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Hmm, that doesn't look right",
          description: "Please use the email from your Eventbrite registration.",
        });
        return;
      }

      toast({
        title: "Tail-wagging news!",
        description: "We found your registration. Let's continue!",
      });
      navigate(`/sign-waiver?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <Input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
        required
        disabled={isLoading}
      />

      <Button 
        type="submit" 
        className="w-full h-12 text-lg font-medium bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl transition-all"
        disabled={isLoading}
      >
        <Mail className="w-5 h-5 mr-2" />
        {isLoading ? "Checking..." : "Start Check-In"}
      </Button>
    </form>
  );
};

export default CheckInForm;
