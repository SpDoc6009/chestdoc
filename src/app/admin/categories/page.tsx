import type React from "react";
import Link from "next/link";
import { createCategoryAction, createSubcategoryAction } from "@/lib/actions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "管理分類"
};

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { subcategories: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } }
  });

  return (
    <AdminShell title="分類與小分類">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>新增大分類</CardTitle></CardHeader>
          <CardContent>
            <form action={createCategoryAction} className="space-y-4">
              <Field name="name" label="名稱" required />
              <Field name="slug" label="Slug" placeholder="可留空自動產生" />
              <Field name="sortOrder" label="排序" type="number" defaultValue="0" />
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea id="description" name="description" />
              </div>
              <Button type="submit">新增大分類</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>新增小分類</CardTitle></CardHeader>
          <CardContent>
            <form action={createSubcategoryAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subcategory-category">所屬大分類</Label>
                <Select id="subcategory-category" name="categoryId" required>
                  <option value="">選擇大分類</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </Select>
              </div>
              <Field name="name" label="名稱" required />
              <Field name="slug" label="Slug" placeholder="可留空自動產生" />
              <Field name="sortOrder" label="排序" type="number" defaultValue="0" />
              <div className="space-y-2">
                <Label htmlFor="subcategory-description">描述</Label>
                <Textarea id="subcategory-description" name="description" />
              </div>
              <Button type="submit">新增小分類</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>分類列表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>大分類</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>小分類</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.length > 0
                        ? category.subcategories.map((item) => (
                            <Link
                              key={item.id}
                              href={`/admin/categories/subcategories/${item.id}/edit`}
                              className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-900 hover:bg-blue-100"
                            >
                              {item.name}
                            </Link>
                          ))
                        : "尚無"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link className="text-sm font-medium text-primary hover:underline" href={`/admin/categories/${category.id}/edit`}>
                      編輯
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
