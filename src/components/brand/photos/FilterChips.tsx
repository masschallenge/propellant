import { Button } from '@masschallenge/propellant-web';

export interface FilterChip {
  id: string;
  label: string;
  count: number;
}

interface FilterChipsProps {
  label: string;
  chips: FilterChip[];
  value: string;
  onChange: (id: string) => void;
}

const FilterChips = ({ label, chips, value, onChange }: FilterChipsProps) => (
  <div role="group" aria-label={label} className="flex flex-wrap gap-2">
    {chips.map((chip) => {
      const isCurrent = chip.id === value;
      return (
        <Button
          key={chip.id}
          size="sm"
          variant={isCurrent ? 'filled' : 'gray'}
          aria-pressed={isCurrent}
          onClick={() => onChange(chip.id)}
        >
          {chip.label} ({chip.count})
        </Button>
      );
    })}
  </div>
);

export default FilterChips;
