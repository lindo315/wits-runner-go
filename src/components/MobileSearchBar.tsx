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
    <div className="bg-gradient-to-r from-primary to-blue-600 px-4 pb-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
        />
      </div>
    </div>
  );
};