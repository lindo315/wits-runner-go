import { Search } from "lucide-react";

interface MobileSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const MobileSearchBar = ({ 
  placeholder = "Search orders...", 
  value, 
  onChange 
}: MobileSearchBarProps) => {
  return (
    <div className="bg-black px-4 pb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
    </div>
  );
};