import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import ProductFilter from "@/components/ProductFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  price_ngn: number;
  rating: number;
  image_url: string;
  in_stock: boolean;
  category: {
    name: string;
  };
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get("minPrice") || "0"),
    max: parseInt(searchParams.get("maxPrice") || "200000"),
  });
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );

  const limit = 12;
  const page = parseInt(searchParams.get("page") || "1");

  // Fetch products with filters
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "products",
      search,
      sortBy,
      priceRange,
      selectedCategory,
      page,
      limit,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        sort: sortBy,
        minPrice: priceRange.min.toString(),
        maxPrice: priceRange.max.toString(),
        category: selectedCategory,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/api/products?${params}`);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/products/categories/all");
        return response || [];
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search, page: "1" });
  };

  const handleClearSearch = () => {
    setSearch("");
    updateSearchParams({ search: "", page: "1" });
  };

  const updateSearchParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const products: Product[] = productsData?.products || [];
  const total = productsData?.pagination?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">
            Shop Clothing & Accessories
          </h1>
          <p className="text-muted-foreground">
            Discover premium Arabian and Western clothing collections
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search abayas, hijabs, clothing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 py-6 text-base"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <ProductFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              updateSearchParams({ category: cat, page: "1" });
            }}
            priceRange={priceRange}
            onPriceChange={(range) => {
              setPriceRange(range);
              updateSearchParams({
                minPrice: range.min.toString(),
                maxPrice: range.max.toString(),
                page: "1",
              });
            }}
          />

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sorting */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {products.length > 0 ? (page - 1) * limit + 1 : 0}–
                {Math.min(page * limit, total)} of {total} products
              </p>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value);
                  updateSearchParams({ sort: value, page: "1" });
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="bestseller">Bestsellers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Failed to load products. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setPriceRange({ min: 0, max: 200000 });
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() =>
                        updateSearchParams({ page: (page - 1).toString() })
                      }
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={page === i + 1 ? "default" : "outline"}
                        onClick={() =>
                          updateSearchParams({ page: (i + 1).toString() })
                        }
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() =>
                        updateSearchParams({ page: (page + 1).toString() })
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
