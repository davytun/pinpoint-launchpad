import countryList from 'react-select-country-list';
import Select, { components, type SingleValue } from 'react-select';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

type CountryOption = { value: string; label: string };

const countryOptions = countryList().getData() as CountryOption[];

interface CountrySelectProps {
    id: string;
    label: string;
    value: string;
    onChange: (country: string) => void;
    error?: string;
    required?: boolean;
    labelClassName?: string;
    controlClassName?: string;
}

export function CountrySelect({
    id,
    label,
    value,
    onChange,
    error,
    required = false,
    labelClassName,
    controlClassName,
}: CountrySelectProps) {
    const selectedOption = countryOptions.find((option) => option.label === value) ?? null;

    return (
        <div>
            <label htmlFor={id} className={cn('mb-1.5 block text-[11px] font-bold tracking-wider text-zinc-500 uppercase', labelClassName)}>
                {label}{required ? ' *' : ''}
            </label>
            <Select<CountryOption, false>
                inputId={id}
                instanceId={id}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                options={countryOptions}
                value={selectedOption}
                onChange={(option: SingleValue<CountryOption>) => onChange(option?.label ?? '')}
                placeholder="Search for your country"
                isSearchable
                isClearable
                noOptionsMessage={() => 'No country found'}
                components={{
                    DropdownIndicator: (props) => (
                        <components.DropdownIndicator {...props}>
                            <ChevronDown className="size-4 text-zinc-400" aria-hidden="true" />
                        </components.DropdownIndicator>
                    ),
                    IndicatorSeparator: null,
                }}
                unstyled
                classNames={{
                    control: (state) => cn(
                        'min-h-12 rounded-xl border bg-white/80 px-3 shadow-2xs transition-all duration-200',
                        state.isFocused ? 'border-[#3A54A5] bg-white ring-1 ring-[#3A54A5]' : 'border-zinc-200 hover:border-zinc-300 hover:bg-white',
                        error && 'border-red-400 ring-1 ring-red-100',
                        controlClassName,
                    ),
                    valueContainer: () => 'gap-1 py-0',
                    input: () => 'm-0 px-0 text-sm font-semibold text-zinc-800',
                    placeholder: () => 'text-sm font-semibold text-zinc-400',
                    singleValue: () => 'text-sm font-semibold text-zinc-800',
                    indicatorsContainer: () => 'gap-1',
                    dropdownIndicator: (state) => cn('rounded-lg p-1 transition-transform duration-200', state.selectProps.menuIsOpen && 'rotate-180'),
                    clearIndicator: () => 'rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700',
                    menu: () => 'z-50 mt-1.5 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl',
                    menuList: () => 'max-h-56 py-0',
                    option: (state) => cn(
                        'cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                        state.isSelected ? 'bg-[#3A54A5] text-white' : state.isFocused ? 'bg-[#3A54A5]/8 text-[#2D4182]' : 'text-zinc-700',
                    ),
                    noOptionsMessage: () => 'px-3 py-4 text-sm font-medium text-zinc-500',
                }}
            />
            {error && <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
        </div>
    );
}
