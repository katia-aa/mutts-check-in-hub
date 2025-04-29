
import { useState } from 'react';
import { Input } from "@/components/ui/input";

interface GuestSelectProps {
  hostEmail: string;
  onUpdate: (email: string) => void;
  disabled: boolean;
}

const GuestSelect = ({ hostEmail, onUpdate, disabled }: GuestSelectProps) => {
  return (
    <Input
      type="email"
      placeholder="Enter ticket holder's email"
      value={hostEmail}
      onChange={(e) => onUpdate(e.target.value)}
      className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
      disabled={disabled}
    />
  );
};

export default GuestSelect;
