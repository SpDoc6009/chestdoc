import type React from "react";
import { createLinkAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "管理連結"
};

export default async function AdminLinksPage() {
  await requireAdmin();
  const links = await prisma.usefulLink.findMany({
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { title: "asc" }]
  });

  return (
    <AdminShell title="常用連結">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader><CardTitle>新增連結</CardTitle></CardHeader>
          <CardContent>
            <form action={createLinkAction} className="space-y-4">
              <Field name="title" label="標題" required />
              <Field name="url" label="網址" type="url" required />
              <Field name="group" label="分組" defaultValue="一般" />
              <Field name="sortOrder" label="排序" type="number" defaultValue="0" />
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea id="description" name="description" />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFavorite" />常用置頂</label>
              <Button type="submit">新增連結</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>連結列表</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>標題</TableHead><TableHead>分組</TableHead><TableHead>網址</TableHead></TableRow></TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell>{link.group}</TableCell>
                    <TableCell className="max-w-xs truncate">{link.url}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, name, ...inputProps } = props;
  return <div className="space-y-2"><Label htmlFor={String(name)}>{label}</Label><Input id={String(name)} name={String(name)} {...inputProps} /></div>;
}
