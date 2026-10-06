import { useState, useEffect } from 'react';
import { Loader2, LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string | number; label: string }[]; // Para el ComboBox / Select
}

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass?: string;
  submitButtonText?: string;
  submitButtonColorClass?: string;
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSave: (values: Record<string, any>) => Promise<boolean>;
}

const GenericModal = ({
  isOpen,
  onClose,
  title,
  description,
  icon: IconComponent,
  iconColorClass = "text-[#0b1d33] bg-[#0b1d33]/5 border-[#0b1d33]/10",
  submitButtonText = "Guardar Cambios",
  submitButtonColorClass = "bg-[#0b1d33] hover:bg-slate-800 text-white",
  fields,
  initialValues = {},
  onSave
}: GenericModalProps) => {
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincroniza los valores iniciales cada vez que se abre el modal (por ejemplo, al editar)
  useEffect(() => {
    if (isOpen) {
      const defaultValues: Record<string, any> = {};
      fields.forEach(field => {
        defaultValues[field.name] = initialValues[field.name] !== undefined ? initialValues[field.name] : '';
      });
      setFormState(defaultValues);
    }
  }, [isOpen, initialValues, fields]);

  const handleInputChange = (name: string, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSave(formState);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95%] sm:w-full rounded-2xl p-6 bg-white border-none shadow-2xl">
        
        <DialogHeader className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${iconColorClass}`}>
            <IconComponent size={20} />
          </div>
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs sm:text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={`g-${field.name}`} className="text-xs font-bold uppercase text-slate-600">
                {field.label}
              </Label>

              {field.type === 'text' && (
                <Input
                  id={`g-${field.name}`}
                  value={formState[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  className="rounded-xl bg-slate-50 border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:font-mono disabled:text-xs disabled:cursor-not-allowed"
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  id={`g-${field.name}`}
                  value={formState[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-xs min-h-[90px] focus:ring-2 focus:ring-[#0b1d33] outline-none"
                />
              )}

              {field.type === 'select' && (
                <select
                  id={`g-${field.name}`}
                  value={formState[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={field.disabled}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-[#0b1d33] h-10 outline-none"
                >
                  <option value="">{field.placeholder || "Seleccione una opción..."}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Área de Control Inferior */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-1/3 rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className={`w-2/3 font-bold rounded-xl shadow-lg ${submitButtonColorClass}`}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : submitButtonText}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
};

export default GenericModal;
