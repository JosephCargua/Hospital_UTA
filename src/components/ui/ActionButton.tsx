import { LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  icon: LucideIcon;
}

const ActionButton = ({ onClick, label, icon: Icon }: ActionButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      className="bg-[#0b1d33] hover:bg-slate-800 text-white gap-2 rounded-xl px-4 h-11 font-semibold transition-all active:scale-95 shadow-sm border border-transparent"
    >
      <Icon size={16} />
      <span>{label}</span>
    </Button>
  );
};

export default ActionButton;
