import { useState } from "react";
import { RawListing } from "@/types/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface Props {
  items: RawListing[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function SkuTable({ items, isLoading, onRefresh }: Props) {
  const [isMapping, setIsMapping] = useState<string | null>(null);
  const [skuInputs, setSkuInputs] = useState<Record<string, string>>({});

  const handleMapSku = async (listingId: string, platformSkuId: string, channel: string) => {
    const canonicalCode = skuInputs[listingId];
    if (!canonicalCode?.trim()) {
      toast.error("Please enter a SKU code");
      return;
    }

    setIsMapping(listingId);
    try {
      const res = await apiClient("/api/v1/catalog/map", {
        method: "POST",
        body: JSON.stringify({
          canonical_sku_code: canonicalCode,
          platform_sku_id: platformSkuId,
          channel,
        }),
      });

      if (res.status === "success") {
        toast.success("SKU mapped successfully");
        setSkuInputs(prev => ({ ...prev, [listingId]: "" }));
        onRefresh();
      } else {
        toast.error((res.error as any)?.message || "Failed to map SKU");
      }
    } catch (e) {
      toast.error("Network error mapping SKU");
    } finally {
      setIsMapping(null);
    }
  };

  const handleUnmapSku = async (listingId: string, platformSkuId: string, channel: string) => {
    setIsMapping(listingId);
    try {
      const res = await apiClient("/api/v1/catalog/map", {
        method: "DELETE",
        body: JSON.stringify({
          platform_sku_id: platformSkuId,
          channel,
        }),
      });

      if (res.status === "success") {
        toast.success("SKU unmapped successfully");
        onRefresh();
      } else {
        toast.error((res.error as any)?.message || "Failed to unmap SKU");
      }
    } catch (e) {
      toast.error("Network error unmapping SKU");
    } finally {
      setIsMapping(null);
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
        No listings found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Canonical SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Cost Data</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((listing) => (
            <TableRow key={listing.listing_id}>
              <TableCell>
                {listing.is_mapped ? (
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] text-[#22C55E] font-mono mt-0.5">
                      {listing.canonical_sku_code}
                    </p>
                    <button
                      onClick={() => handleUnmapSku(listing.listing_id, listing.platform_sku_id, listing.channel)}
                      disabled={isMapping === listing.listing_id}
                      className="text-[10px] uppercase font-bold tracking-wider text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {isMapping === listing.listing_id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Unlink"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter SKU..."
                      value={skuInputs[listing.listing_id] || ""}
                      onChange={(e) => setSkuInputs(prev => ({ ...prev, [listing.listing_id]: e.target.value }))}
                      className="border rounded px-2 py-1 text-xs w-28 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                    />
                    <button
                      onClick={() => handleMapSku(listing.listing_id, listing.platform_sku_id, listing.channel)}
                      disabled={isMapping === listing.listing_id || !skuInputs[listing.listing_id]?.trim()}
                      className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {isMapping === listing.listing_id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Link"}
                    </button>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium truncate max-w-[250px]" title={listing.product_name}>
                {listing.product_name}
              </TableCell>
              <TableCell>
                {listing.channel === 'shopify' && (
                  <span className="inline-flex px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-800 font-bold capitalize">
                    Shopify
                  </span>
                )}
                {listing.channel === 'amazon' && (
                  <span className="inline-flex px-2 py-0.5 text-[10px] rounded bg-orange-100 text-orange-800 font-bold capitalize">
                    Amazon
                  </span>
                )}
              </TableCell>
              <TableCell>
                {listing.price != null ? `₹${listing.price.toFixed(2)}` : "—"}
              </TableCell>
              <TableCell>
                {listing.quantity_available != null ? listing.quantity_available : "—"}
              </TableCell>
              <TableCell>
                {listing.has_missing_data === true ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                    title="This SKU has missing cost inputs — margin may be overstated"
                  >
                    <AlertTriangle size={10} className="shrink-0" />
                    Missing
                  </span>
                ) : listing.has_missing_data === false ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    title="All cost inputs are present for this SKU"
                  >
                    <CheckCircle2 size={10} className="shrink-0" />
                    Complete
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className={`inline-flex px-2 py-0.5 text-[10px] rounded font-bold capitalize ${
                  listing.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  {listing.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
