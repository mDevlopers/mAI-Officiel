import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ModeSelector({ mode = "chat" }: { mode?: "chat" | "coder" }) {
    if (mode !== "coder") return null;

    return (
        <Select defaultValue="planning">
            <SelectTrigger className="w-[180px] h-7 text-xs border-dashed ml-2">
                <SelectValue placeholder="Mode de fonctionnement" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="planning">Planification</SelectItem>
                <SelectItem value="investigation">Investigation</SelectItem>
                <SelectItem value="execution">Exécution</SelectItem>
            </SelectContent>
        </Select>
    );
}
