import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: any) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helper,
  options = [],
  placeholder = 'Select an option...',
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
  id,
  name,
  className = '',
  searchable,
  clearable = false,
  size = 'md',
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  // Uncontrolled vs Controlled state
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | number>(
    defaultValue !== undefined ? defaultValue : ''
  );
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Auto-enable search if there are more than 6 options
  const shouldShowSearch = searchable !== undefined ? searchable : options.length > 6;

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchLabel = opt.label?.toLowerCase().includes(q);
    const matchSubtitle = opt.subtitle?.toLowerCase().includes(q);
    const matchDesc = opt.description?.toLowerCase().includes(q);
    const matchVal = String(opt.value).toLowerCase().includes(q);
    return matchLabel || matchSubtitle || matchDesc || matchVal;
  });

  const selectedOption = options.find((opt) => String(opt.value) === String(currentValue));

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && e.target && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(
        selectedOption
          ? filteredOptions.findIndex((opt) => String(opt.value) === String(selectedOption.value))
          : 0
      );
      if (shouldShowSearch) {
        // Small delay to ensure panel transition has started
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, shouldShowSearch]);

  // Handle option selection
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (!isControlled) {
      setInternalValue(option.value);
    }

    if (onChange) {
      // Fire synthetic event for full backwards-compatibility with HTML <select> handlers
      const syntheticEvent = {
        target: {
          name: name || selectId,
          value: option.value,
        },
        currentTarget: {
          name: name || selectId,
          value: option.value,
        },
        type: 'change',
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent as any);
    }

    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setInternalValue('');
    }
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || selectId,
          value: '',
        },
        currentTarget: {
          name: name || selectId,
          value: '',
        },
        type: 'change',
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent as any);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        scrollOptionIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        scrollOptionIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const scrollOptionIntoView = (index: number) => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  };

  // Sizing styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[34px]',
    md: 'px-3.5 py-2.5 text-sm rounded-xl min-h-[42px]',
    lg: 'px-4 py-3 text-base rounded-xl min-h-[48px]',
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label
          id={`${selectId}-label`}
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5 select-none"
        >
          {label} {required && <span className="text-[#651C32] font-bold">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${selectId}-label` : undefined}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between text-left bg-white transition-all duration-200 border shadow-subtle ${
          sizeClasses[size]
        } ${
          error
            ? 'border-[#B94B4B] ring-1 ring-[#B94B4B]'
            : isOpen
            ? 'border-[#651C32] ring-2 ring-[#651C32]/15'
            : 'border-[#EAE3DE] hover:border-[#8B4055]/60'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-[#FAF8F3]' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="flex-shrink-0 text-[#651C32] transition-colors">
                  {selectedOption.icon}
                </span>
              )}
              <span className="truncate font-medium text-[#292326]">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="flex-shrink-0 text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#FAF8F3] text-[#82777A] border border-[#EAE3DE]">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="truncate text-[#82777A]">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={handleClear}
              className="p-1 rounded-md text-[#82777A] hover:text-[#651C32] hover:bg-[#FAF8F3] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#82777A] transition-transform duration-200 ease-out ${
              isOpen ? 'rotate-180 text-[#651C32]' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Selection Panel */}
      {isOpen && (
        <div
          role="presentation"
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-[#EAE3DE] shadow-xl shadow-[#431322]/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top"
        >
          {/* Optional In-Dropdown Search Filter */}
          {shouldShowSearch && (
            <div className="p-2 border-b border-[#EAE3DE] bg-[#FAF8F3]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#82777A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type to filter..."
                  className="w-full bg-white border border-[#EAE3DE] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#292326] placeholder-[#82777A] focus:outline-none focus:border-[#651C32] focus:ring-1 focus:ring-[#651C32]"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-60 overflow-y-auto p-1.5 space-y-1 focus:outline-none scrollbar-thin"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-[#82777A] italic">
                No matching options found
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = String(option.value) === String(currentValue);
                const isHighlighted = highlightedIndex === index;

                return (
                  <li
                    key={String(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer select-none transition-colors duration-150 ${
                      option.disabled ? 'opacity-40 cursor-not-allowed' : ''
                    } ${
                      /* Hover & Active Highlight: Deep Maroon #651C32 with White text and Pastel Yellow icons */
                      isHighlighted && !option.disabled
                        ? 'bg-[#651C32] text-white shadow-sm'
                        : isSelected
                        ? 'bg-[#F6E7A8] text-[#431322] font-medium'
                        : 'bg-white text-[#292326] hover:bg-[#FAF8F3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      {/* Icon */}
                      {option.icon && (
                        <span
                          className={`flex-shrink-0 transition-colors ${
                            isHighlighted && !option.disabled
                              ? 'text-[#F6E7A8]'
                              : isSelected
                              ? 'text-[#651C32]'
                              : 'text-[#8B4055]'
                          }`}
                        >
                          {option.icon}
                        </span>
                      )}

                      {/* Content block: Title + Subtitle/Description */}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`truncate text-sm leading-snug ${
                            isHighlighted && !option.disabled
                              ? 'text-white font-medium'
                              : isSelected
                              ? 'text-[#431322] font-semibold'
                              : 'text-[#292326]'
                          }`}
                        >
                          {option.label}
                        </span>

                        {(option.subtitle || option.description) && (
                          <span
                            className={`truncate text-[11px] leading-tight mt-0.5 transition-colors ${
                              isHighlighted && !option.disabled
                                ? 'text-[#FFF6D9]'
                                : isSelected
                                ? 'text-[#651C32]/80'
                                : 'text-[#82777A]'
                            }`}
                          >
                            {option.subtitle || option.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: Badge and/or Selected Checkmark */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {option.badge && (
                        <span
                          className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded transition-colors ${
                            isHighlighted && !option.disabled
                              ? 'bg-[#431322] text-[#F6E7A8] border border-[#8B4055]'
                              : isSelected
                              ? 'bg-[#431322]/10 text-[#431322] border border-[#431322]/20'
                              : 'bg-[#FAF8F3] text-[#82777A] border border-[#EAE3DE]'
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}

                      {isSelected && (
                        <Check
                          className={`w-4 h-4 transition-colors ${
                            isHighlighted && !option.disabled
                              ? 'text-[#F6E7A8]'
                              : 'text-[#651C32]'
                          }`}
                        />
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-[#B94B4B] font-medium">{error}</p>}

      {/* Helper text */}
      {helper && !error && <p className="mt-1 text-xs text-[#82777A]">{helper}</p>}
    </div>
  );
};
