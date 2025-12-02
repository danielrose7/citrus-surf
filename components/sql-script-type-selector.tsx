import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ScriptTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ScriptTypeSelector({
  value,
  onChange,
}: ScriptTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Script Type</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="insert" id="script-insert" />
          <Label htmlFor="script-insert" className="cursor-pointer">
            INSERT
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="update" id="script-update" />
          <Label htmlFor="script-update" className="cursor-pointer">
            UPDATE
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upsert" id="script-upsert" />
          <Label htmlFor="script-upsert" className="cursor-pointer">
            UPSERT
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
