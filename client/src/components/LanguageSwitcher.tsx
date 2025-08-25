import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { getCurrentLocale, getAvailableLocales, setLocale } = useTranslation();
  
  const currentLocale = getCurrentLocale();
  const availableLocales = getAvailableLocales();
  
  const handleLocaleChange = (locale: string) => {
    setLocale(locale as any);
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={currentLocale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {availableLocales.map((locale) => (
            <SelectItem key={locale.code} value={locale.code}>
              {locale.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;