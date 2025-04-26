
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

const CheckInForm = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle check-in logic here
    console.log('Checking in with email:', email);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 bg-white/90 border-teal-200 focus:border-teal-400 focus:ring-teal-400"
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 text-lg font-medium bg-teal-500 hover:bg-teal-600 transition-colors"
      >
        <Mail className="w-5 h-5 mr-2" />
        Start Check-In
      </Button>
    </form>
  );
};

export default CheckInForm;
