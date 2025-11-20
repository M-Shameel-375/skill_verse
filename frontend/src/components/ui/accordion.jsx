import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/helpers';

const AccordionContext = createContext();

const Accordion = ({ children, type = 'single', collapsible = false, defaultValue, className, ...props }) => {
  const [openItems, setOpenItems] = useState(
    defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
  );

  const toggleItem = (value) => {
    if (type === 'single') {
      setOpenItems((prev) =>
        prev.includes(value) && collapsible ? [] : [value]
      );
    } else {
      setOpenItems((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({ value, children, className, ...props }) => {
  return (
    <div className={cn('border rounded-lg', className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value });
        }
        return child;
      })}
    </div>
  );
};

const AccordionTrigger = ({ value, children, className, ...props }) => {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      onClick={() => toggleItem(value)}
      className={cn(
        'flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-accent [&[data-state=open]>svg]:rotate-180',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  );
};

const AccordionContent = ({ value, children, className, ...props }) => {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div
      className={cn('overflow-hidden text-sm transition-all', className)}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      <div className="p-4 pt-0">{children}</div>
    </div>
  );
};

Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'AccordionItem';
AccordionTrigger.displayName = 'AccordionTrigger';
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
