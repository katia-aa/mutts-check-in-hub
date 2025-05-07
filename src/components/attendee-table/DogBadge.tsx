
import { Dog } from "lucide-react";

interface DogBadgeProps {
  count: number;
}

const DogBadge = ({ count }: DogBadgeProps) => {
  if (count === 0) {
    return <span className="text-gray-400">None</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Dog className="w-4 h-4 text-gray-500" />
      <span className="font-medium">{count}</span>
    </div>
  );
};

export default DogBadge;
