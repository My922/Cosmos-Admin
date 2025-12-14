"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.includes("/modules/products")) return "products";
    if (pathname.includes("/modules/categories")) return "categories";
    return "modules";
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case "modules":
        router.push("/modules");
        break;
      case "products":
        router.push("/modules/products");
        break;
      case "categories":
        router.push("/modules/categories");
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}
