
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AdminHeaderProps {
  onSync: () => void;
  isLoading: boolean;
}

const AdminHeader = ({ onSync, isLoading }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-mutts-primary">Admin Check-In Dashboard</h1>
      <Button 
        onClick={onSync}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? "Syncing..." : "Sync Eventbrite"}
      </Button>
    </div>
  );
};

export default AdminHeader;
