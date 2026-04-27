import { useState } from "react";
import { CatalogSku } from "@/types/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCogsModal } from "./EditCogsModal";
import { Pencil } from "lucide-react";

interface Props {
  items: CatalogSku[];
  isLoading: boolean;
  onUpdateSku: (updatedSku: CatalogSku) => void;
}

export function SkuTable({ items, isLoading, onUpdateSku }: Props) {
  const [editingSku, setEditingSku] = useState<CatalogSku | null>(null);

  const handleSaveCogs = async (skuId: string, cogs: number) => {
    try {
      const res = await fetch(`/api/v1/skus/${skuId}/cogs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ cogs_per_unit: cogs }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdateSku(json.data);
        setEditingSku(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        No SKUs found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU Code</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Channels</TableHead>
            <TableHead>Shopify Price</TableHead>
            <TableHead>Amazon Price</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>COGS / Unit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((sku) => (
            <TableRow key={sku.catalog_sku_id}>
              <TableCell className="font-mono text-xs">{sku.canonical_sku_code}</TableCell>
              <TableCell className="font-medium truncate max-w-[200px]" title={sku.display_name}>{sku.display_name}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {sku.is_on_shopify && <span className="inline-flex px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-800 font-bold">Shopify</span>}
                  {sku.is_on_amazon && <span className="inline-flex px-2 py-0.5 text-[10px] rounded bg-orange-100 text-orange-800 font-bold">Amazon</span>}
                </div>
              </TableCell>
              <TableCell>
                {sku.shopify_details?.selling_price != null ? `₹${sku.shopify_details.selling_price.toFixed(2)}` : "—"}
              </TableCell>
              <TableCell>
                {sku.amazon_details?.selling_price != null ? `₹${sku.amazon_details.selling_price.toFixed(2)}` : "—"}
              </TableCell>
              <TableCell>
                {sku.shopify_details?.inventory_quantity != null 
                  ? sku.shopify_details.inventory_quantity 
                  : (sku.amazon_details?.inventory_quantity != null ? sku.amazon_details.inventory_quantity : "—")}
              </TableCell>
              <TableCell>
                {sku.cogs_per_unit !== null ? (
                  `₹${sku.cogs_per_unit.toFixed(2)}`
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    <Pencil size={10} /> Missing
                  </span>
                )}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => setEditingSku(sku)}
                  className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded"
                >
                  Edit COGS
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditCogsModal
        sku={editingSku}
        isOpen={!!editingSku}
        onClose={() => setEditingSku(null)}
        onSave={handleSaveCogs}
      />
    </div>
  );
}
