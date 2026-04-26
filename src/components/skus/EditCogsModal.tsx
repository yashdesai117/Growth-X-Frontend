import { useState, useEffect } from "react";
import { CatalogSku } from "@/types/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Props {
  sku: CatalogSku | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (skuId: string, cogs: number) => Promise<void>;
}

export function EditCogsModal({ sku, isOpen, onClose, onSave }: Props) {
  const [cogs, setCogs] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sku) {
      setCogs(sku.cogs_per_unit !== null ? sku.cogs_per_unit.toString() : "");
    }
  }, [sku]);

  if (!sku) return null;

  const handleSave = async () => {
    const val = parseFloat(cogs);
    if (isNaN(val) || val < 0) return;
    setIsSaving(true);
    await onSave(sku.catalog_sku_id, val);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit COGS</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">SKU Code</p>
            <p className="font-mono text-sm">{sku.canonical_sku_code}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">Product Name</p>
            <p className="text-sm">{sku.display_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cost of Goods Sold per unit (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cogs}
              onChange={(e) => setCogs(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
