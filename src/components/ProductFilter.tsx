import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: PriceRange;
  onPriceChange: (range: PriceRange) => void;
}

const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

const ProductFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
}: ProductFilterProps) => {
  const [tempPriceRange, setTempPriceRange] = useState<PriceRange>(priceRange);

  const handlePriceChange = (value: number[]) => {
    setTempPriceRange({ min: value[0], max: value[1] });
  };

  const handlePriceApply = () => {
    onPriceChange(tempPriceRange);
  };

  const handleReset = () => {
    onCategoryChange("");
    onPriceChange({ min: 0, max: 200000 });
    setTempPriceRange({ min: 0, max: 200000 });
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold">Filters</h2>
          {(selectedCategory ||
            priceRange.min !== 0 ||
            priceRange.max !== 200000) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Categories */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-sm hover:text-primary transition-colors">
              Categories
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategory === category.id}
                    onCheckedChange={() => {
                      onCategoryChange(
                        selectedCategory === category.id ? "" : category.id,
                      );
                    }}
                  />
                  <Label
                    htmlFor={category.id}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Price Range */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-sm hover:text-primary transition-colors">
              Price Range
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <Slider
                value={[tempPriceRange.min, tempPriceRange.max]}
                onValueChange={handlePriceChange}
                min={0}
                max={200000}
                step={5000}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Min</label>
                  <p className="font-semibold text-sm">
                    {formatNGN(tempPriceRange.min)}
                  </p>
                </div>
                <div className="text-right">
                  <label className="text-xs text-muted-foreground">Max</label>
                  <p className="font-semibold text-sm">
                    {formatNGN(tempPriceRange.max)}
                  </p>
                </div>
              </div>
              {(tempPriceRange.min !== priceRange.min ||
                tempPriceRange.max !== priceRange.max) && (
                <Button size="sm" onClick={handlePriceApply} className="w-full">
                  Apply
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Availability */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-sm hover:text-primary transition-colors">
              Availability
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" defaultChecked disabled />
                <Label htmlFor="in-stock" className="text-sm font-normal">
                  In Stock
                </Label>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Info */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Showing products available in Nigeria & Egypt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
