"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMyTenantModules, useCategories } from "@/hooks/use-api";
import { TenantModuleStatus, ProductCategory } from "@/types";

const riskLevels = ["conservative", "moderate", "balanced", "growth", "aggressive"] as const;
const currencies = ["USD", "HKD", "CNY", "EUR", "GBP", "SGD", "JPY"] as const;

const productSchema = z.object({
  module_id: z.string().min(1, "Module is required"),
  code: z.string()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code must be at most 50 characters")
    .regex(/^[a-z0-9_]+$/, "Code must be lowercase letters, numbers, and underscores only"),
  name: z.string().min(1, "Name is required").max(255),
  name_zh: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  description_zh: z.string().max(2000).optional(),
  category: z.string().min(1, "Category is required").max(100),
  category_id: z.string().optional(),
  risk_level: z.enum(riskLevels),
  min_investment: z.coerce.number().min(0, "Must be a positive number"),
  currency: z.enum(currencies),
  expected_return: z.string().max(100).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  mode = "create",
}: ProductFormProps) {
  const { data: modulesData } = useMyTenantModules();
  const { data: categories } = useCategories();

  // Filter to only show enabled modules (core modules + enabled tenant modules)
  const enabledModules = (modulesData as TenantModuleStatus[] | undefined)?.filter(
    (m) => m.is_core || m.is_enabled
  ) || [];

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      module_id: "",
      code: "",
      name: "",
      name_zh: "",
      description: "",
      description_zh: "",
      category: "",
      category_id: "",
      risk_level: "balanced",
      min_investment: 0,
      currency: "USD",
      expected_return: "",
      ...defaultValues,
    },
  });

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues && mode === "edit") {
      form.reset({
        module_id: defaultValues.module_id || "",
        code: defaultValues.code || "",
        name: defaultValues.name || "",
        name_zh: defaultValues.name_zh || "",
        description: defaultValues.description || "",
        description_zh: defaultValues.description_zh || "",
        category: defaultValues.category || "",
        category_id: defaultValues.category_id || "",
        risk_level: defaultValues.risk_level || "balanced",
        min_investment: defaultValues.min_investment || 0,
        currency: defaultValues.currency || "USD",
        expected_return: defaultValues.expected_return || "",
      });
    }
  }, [defaultValues, mode, form]);

  const handleSubmit = async (data: ProductFormData) => {
    const submitData: Record<string, any> = {
      module_id: data.module_id,
      code: data.code,
      name: data.name.trim(),
      category: data.category.trim(),
      risk_level: data.risk_level,
      min_investment: data.min_investment,
      currency: data.currency,
    };

    if (data.name_zh?.trim()) submitData.name_zh = data.name_zh.trim();
    if (data.description?.trim()) submitData.description = data.description.trim();
    if (data.description_zh?.trim()) submitData.description_zh = data.description_zh.trim();
    if (data.category_id) submitData.category_id = data.category_id;
    if (data.expected_return?.trim()) submitData.expected_return = data.expected_return.trim();

    await onSubmit(submitData as ProductFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Module Selection */}
        <FormField
          control={form.control}
          name="module_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Module *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={mode === "edit"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {enabledModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The module this product belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code *</FormLabel>
              <FormControl>
                <Input
                  placeholder="my_product_code"
                  {...field}
                  disabled={mode === "edit"}
                />
              </FormControl>
              <FormDescription>
                Unique identifier (lowercase, underscores allowed)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name EN/ZH */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English) *</FormLabel>
                <FormControl>
                  <Input placeholder="Product Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name_zh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Chinese)</FormLabel>
                <FormControl>
                  <Input placeholder="产品名称" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description EN */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (English)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the product..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description ZH */}
        <FormField
          control={form.control}
          name="description_zh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Chinese)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="产品描述..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Risk Level */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(categories as ProductCategory[] | undefined)?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name} {cat.name_zh ? `(${cat.name_zh})` : ""}
                      </SelectItem>
                    ))}
                    {/* Allow custom category input */}
                    <SelectItem value="__custom__">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="risk_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risk Level *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Min Investment and Currency */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_investment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Investment *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="10000"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="HKD">HKD</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Expected Return */}
        <FormField
          control={form.control}
          name="expected_return"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Return</FormLabel>
              <FormControl>
                <Input placeholder="6-8% annually" {...field} />
              </FormControl>
              <FormDescription>
                Expected return description (e.g., &ldquo;6-8% annually&rdquo;)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
