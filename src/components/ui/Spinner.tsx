import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  message?: string;
}

export const Spinner = ({ message = "Cargando información médica..." }: SpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 w-full min-h-[200px]">
      {/* El icon de Lucide con la animación de rotación nativa de Tailwind */}
      <Loader2 className="h-8 w-8 animate-spin text-[#0b1d33]" />
      <p className="text-xs font-medium text-slate-500 tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
};
