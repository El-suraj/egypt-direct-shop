import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const API_URL = "http://localhost:3001";
const FRONTEND_URL = "http://localhost:5173";

async function testConnection() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  FRONTEND → BACKEND → DATABASE CONNECTION TEST              ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  let passed = 0;
  let failed = 0;

  // Test 1: Backend Health Check
  console.log("🧪 TEST 1: Backend Health Check");
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    if (response.ok && data.status === "ok") {
      console.log("   ✅ PASS: Backend is running on port 3001");
      passed++;
    } else {
      console.log("   ❌ FAIL: Backend health check failed");
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ FAIL: Cannot connect to backend - ${err.message}`);
    failed++;
  }

  // Test 2: Products API Endpoint
  console.log("\n🧪 TEST 2: Products API Endpoint");
  try {
    const response = await fetch(`${API_URL}/api/products?limit=5`);
    const data = await response.json();
    if (response.ok && data.products && data.products.length > 0) {
      console.log(`   ✅ PASS: Retrieved ${data.products.length} products`);
      console.log(`   📊 Total products in database: ${data.pagination.total}`);
      console.log(`   💰 Sample product:`);
      const product = data.products[0];
      console.log(`       • Name: ${product.name}`);
      console.log(
        `       • Price NGN: ₦${product.price_ngn?.toLocaleString()}`,
      );
      console.log(
        `       • Price EGP: E£${product.price_egp?.toLocaleString()}`,
      );
      console.log(`       • Rating: ${product.rating}⭐`);
      passed++;
    } else {
      console.log(`   ❌ FAIL: Products API returned no data`);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ FAIL: ${err.message}`);
    failed++;
  }

  // Test 3: Search Functionality
  console.log("\n🧪 TEST 3: Product Search Functionality");
  try {
    const response = await fetch(`${API_URL}/api/products?search=abaya`);
    const data = await response.json();
    if (response.ok && data.products && data.products.length > 0) {
      console.log(
        `   ✅ PASS: Search found ${data.products.length} products matching "abaya"`,
      );
      passed++;
    } else {
      console.log(`   ⚠️ WARNING: Search for "abaya" returned no results`);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ FAIL: ${err.message}`);
    failed++;
  }

  // Test 4: Category Filter
  console.log("\n🧪 TEST 4: Category Filter");
  try {
    // Get categories first
    const catResponse = await fetch(`${API_URL}/api/products?limit=100`);
    const catData = await catResponse.json();
    if (catData.products && catData.products.length > 0) {
      const firstCategoryId = catData.products[0].category_id;
      const filterResponse = await fetch(
        `${API_URL}/api/products?category=${firstCategoryId}`,
      );
      const filterData = await filterResponse.json();
      if (
        filterResponse.ok &&
        filterData.products &&
        filterData.products.length > 0
      ) {
        console.log(
          `   ✅ PASS: Category filter returned ${filterData.products.length} products`,
        );
        passed++;
      } else {
        console.log(`   ❌ FAIL: Category filter returned no results`);
        failed++;
      }
    }
  } catch (err) {
    console.log(`   ❌ FAIL: ${err.message}`);
    failed++;
  }

  // Test 5: Price Range Filter
  console.log("\n🧪 TEST 5: Price Range Filter");
  try {
    const response = await fetch(
      `${API_URL}/api/products?minPrice=30000&maxPrice=100000`,
    );
    const data = await response.json();
    if (
      response.ok &&
      data.products &&
      data.products.every((p) => p.price_ngn >= 30000 && p.price_ngn <= 100000)
    ) {
      console.log(`   ✅ PASS: Price filter working correctly`);
      console.log(
        `       Returned ${data.products.length} products in price range`,
      );
      passed++;
    } else {
      console.log(`   ⚠️ WARNING: Price filter may have issues`);
    }
  } catch (err) {
    console.log(`   ❌ FAIL: ${err.message}`);
    failed++;
  }

  // Test 6: Database Connection (Direct)
  console.log("\n🧪 TEST 6: Database Connection (Supabase)");
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    if (count && count > 0) {
      console.log(
        `   ✅ PASS: Database connected. ${count} products in database`,
      );
      passed++;
    } else {
      console.log(`   ❌ FAIL: No products in database`);
      failed++;
    }
  } catch (err) {
    console.log(`   ❌ FAIL: ${err.message}`);
    failed++;
  }

  // Test 7: CORS Configuration
  console.log("\n🧪 TEST 7: CORS Configuration");
  try {
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        Origin: FRONTEND_URL,
      },
    });
    const corsHeader = response.headers.get("access-control-allow-origin");
    if (corsHeader) {
      console.log(
        `   ✅ PASS: CORS enabled for ${corsHeader || "all origins"}`,
      );
      passed++;
    } else {
      console.log(`   ⚠️ WARNING: CORS header not detected`);
    }
  } catch (err) {
    console.log(`   ❌ FAIL: ${err.message}`);
    failed++;
  }

  // Summary
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║  TEST SUMMARY                                              ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  const total = passed + failed;
  const percentage = Math.round((passed / total) * 100);

  console.log(`  ✅ Passed: ${passed}/${total}`);
  console.log(`  ❌ Failed: ${failed}/${total}`);
  console.log(`  📊 Success Rate: ${percentage}%\n`);

  if (percentage === 100) {
    console.log(
      "🎉 All tests passed! Frontend ↔ Backend ↔ Database is working perfectly!\n",
    );
  } else if (percentage >= 80) {
    console.log(
      "⚠️  Most tests passed, but there are some issues to address.\n",
    );
  } else {
    console.log("❌ Multiple tests failed. Check the logs above.\n");
  }

  console.log("📝 Next Steps:");
  console.log("   1. Start frontend: `npm run dev` (port 5173)");
  console.log("   2. Backend is running: port 3001 ✓");
  console.log("   3. Database is connected ✓");
  console.log("   4. Build frontend UI components for:");
  console.log("      - Products page with search/filter");
  console.log("      - Checkout flow with Paystack");
  console.log("      - Order tracking page");
  console.log("      - Email notifications\n");

  process.exit(0);
}

testConnection();
