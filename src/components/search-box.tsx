import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input name="q" defaultValue={defaultValue} placeholder="搜尋疾病、指南、檢查、治療或連結" className="pl-9" />
      </div>
      <Button type="submit">搜尋</Button>
    </form>
  );
}
