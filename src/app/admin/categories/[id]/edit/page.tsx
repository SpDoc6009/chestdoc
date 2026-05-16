import type React from "react";
import { notFound } from "next/navigation";
import { updateCategoryAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "編輯分類"
};

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <AdminShell title="編輯大分類">
      <Card>
        <CardHeader><CardTitle>{category.name}</CardTitle></CardHeader>
        <CardContent>
          <form action={updateCategoryAction} className="space-y-4">
            <input type="hidden" name="id" value={category.id} />
            <Field name="name" label="名稱" defaultValue={category.name} required />
            <Field name="slug" label="Slug" defaultValue={category.slug} required />
            <Field name="sortOrder" label="排序" type="number" defaultValue={String(category.sortOrder)} />
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea id="description" name="description" defaultValue={category.description ?? ""} />
            </div>
            <Button type="submit">儲存修改</Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, name, ...inputProps } = props;
  return (
    <div className="space-y-2">
      <Label htmlFor={String(name)}>{label}</Label>
      <Input id={String(name)} name={String(name)} {...inputProps} />
    </div>
  );
}
