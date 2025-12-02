import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OutputFormatSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function OutputFormatSelector({
  value,
  onChange,
}: OutputFormatSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Output Format</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="values" id="values" />
          <Label htmlFor="values" className="cursor-pointer">
            VALUES
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="script" id="script" />
          <Label htmlFor="script" className="cursor-pointer">
            SCRIPT
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
