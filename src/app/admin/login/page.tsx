import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "後台登入"
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>後台登入</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">管理員密碼</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            {error ? <p className="text-sm text-red-600">密碼不正確，請再試一次。</p> : null}
            <Button type="submit" className="w-full">登入</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
