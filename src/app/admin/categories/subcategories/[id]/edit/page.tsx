import type React from "react";
import { notFound } from "next/navigation";
import { updateSubcategoryAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "編輯小分類"
};

export default async function EditSubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [subcategory, categories] = await Promise.all([
    prisma.subcategory.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
  ]);
  if (!subcategory) notFound();

  return (
    <AdminShell title="編輯小分類">
      <Card>
        <CardHeader><CardTitle>{subcategory.name}</CardTitle></CardHeader>
        <CardContent>
          <form action={updateSubcategoryAction} className="space-y-4">
            <input type="hidden" name="id" value={subcategory.id} />
            <div className="space-y-2">
              <Label htmlFor="categoryId">所屬大分類</Label>
              <Select id="categoryId" name="categoryId" defaultValue={subcategory.categoryId} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Select>
            </div>
            <Field name="name" label="名稱" defaultValue={subcategory.name} required />
            <Field name="slug" label="Slug" defaultValue={subcategory.slug} required />
            <Field name="sortOrder" label="排序" type="number" defaultValue={String(subcategory.sortOrder)} />
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea id="description" name="description" defaultValue={subcategory.description ?? ""} />
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
