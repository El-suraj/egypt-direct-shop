import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function testDatabase() {
  console.log("🔍 Testing Database Connection...\n");

  try {
    // Test 1: Check categories
    console.log("1️⃣ Checking Categories table...");
    const {
      data: categories,
      error: catError,
      count: catCount,
    } = await supabase.from("categories").select("*", { count: "exact" });

    if (catError) {
      console.error("❌ Categories Error:", catError.message);
    } else {
      console.log(`✅ Categories found: ${catCount}`);
      if (categories && categories.length > 0) {
        console.log("   Sample:", categories[0]);
      }
    }

    // Test 2: Check vendors
    console.log("\n2️⃣ Checking Vendors table...");
    const {
      data: vendors,
      error: vendError,
      count: vendCount,
    } = await supabase.from("vendors").select("*", { count: "exact" });

    if (vendError) {
      console.error("❌ Vendors Error:", vendError.message);
    } else {
      console.log(`✅ Vendors found: ${vendCount}`);
      if (vendors && vendors.length > 0) {
        console.log("   Sample:", vendors[0]);
      }
    }

    // Test 3: Check products
    console.log("\n3️⃣ Checking Products table...");
    const {
      data: products,
      error: prodError,
      count: prodCount,
    } = await supabase.from("products").select("*", { count: "exact" });

    if (prodError) {
      console.error("❌ Products Error:", prodError.message);
    } else {
      console.log(`✅ Products found: ${prodCount}`);
      if (products && products.length > 0) {
        console.log("   Sample:", {
          id: products[0].id,
          name: products[0].name,
          price: products[0].price,
          category_id: products[0].category_id,
        });
      }
    }

    // Test 4: Check product variants
    console.log("\n4️⃣ Checking Product Variants table...");
    const {
      data: variants,
      error: varError,
      count: varCount,
    } = await supabase.from("product_variants").select("*", { count: "exact" });

    if (varError) {
      console.error("❌ Variants Error:", varError.message);
    } else {
      console.log(`✅ Variants found: ${varCount}`);
      if (variants && variants.length > 0) {
        console.log("   Sample:", variants[0]);
      }
    }

    // Summary
    console.log("\n📊 Summary:");
    console.log(`  Categories: ${catCount || 0}`);
    console.log(`  Vendors: ${vendCount || 0}`);
    console.log(`  Products: ${prodCount || 0}`);
    console.log(`  Variants: ${varCount || 0}`);

    if ((prodCount || 0) === 0) {
      console.log("\n⚠️ No products found. Make sure to:");
      console.log("   1. Run the migration in Supabase Dashboard");
      console.log("   2. Run the seed script in Supabase Dashboard");
      console.log("   3. Both should complete without errors");
    } else {
      console.log("\n✅ Database is fully populated and ready!");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
  }

  process.exit(0);
}

testDatabase();
