
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
}

const SearchBar = ({ searchTerm, onSearch }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        placeholder="Search by email or name..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-10 w-full max-w-md border-mutts-primary/20 focus:border-mutts-primary"
      />
    </div>
  );
};

export default SearchBar;
