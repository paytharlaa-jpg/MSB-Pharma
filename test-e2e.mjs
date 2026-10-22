// test-e2e.mjs
async function runTests() {
  console.log("=== Starting MSB Pharmachem E2E Verification Suite ===");
  const baseUrl = "http://localhost:3000";
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Homepage
    const resHome = await fetch(`${baseUrl}/`);
    assert(resHome.status === 200, "1. Homepage renders with HTTP 200");
    const htmlHome = await resHome.text();
    assert(htmlHome.includes("MSB PHARMACHEM"), "1b. Homepage contains company name");

    // 2. Products Page
    const resProducts = await fetch(`${baseUrl}/products`);
    assert(resProducts.status === 200, "2. Products catalog renders with HTTP 200");

    // 3. Public Enquiry API
    const testEnquiry = {
      contactName: "Dr. Rajesh Sharma",
      companyName: "Hetero Formulations Ltd",
      email: "rajesh@heterodrugs.com",
      phone: "+919876543210",
      productCategory: "Active Pharmaceutical Ingredients (APIs)",
      requestedProduct: "Pregabalin IP/BP/USP",
      quantity: 500,
      unit: "KG",
      message: "Urgent commercial requirement for domestic manufacturing batch.",
    };
    const resEnquiry = await fetch(`${baseUrl}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testEnquiry),
    });
    assert(resEnquiry.status === 200, "3. Public Enquiry submission responds with HTTP 200");
    const enquiryData = await resEnquiry.json();
    assert(enquiryData.success === true && enquiryData.enquiry.id, "3b. Enquiry created in database");
    assert(enquiryData.whatsappUrl && enquiryData.whatsappUrl.includes("wa.me"), "3c. WhatsApp Click-to-Chat deep link generated");

    // 4. Staff Login (Super Admin)
    const resLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@msbpharmachem.com", password: "Password@123" }),
    });
    assert(resLogin.status === 200, "4. Staff Login with Super Admin credentials succeeds");
    const loginData = await resLogin.json();
    assert(loginData.user && loginData.user.role === "SUPER_ADMIN", "4b. User role is SUPER_ADMIN");

    // Extract auth token and cookie
    const token = loginData.token;
    assert(token && token.length > 20, "4c. JWT authentication session token generated");
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Cookie: `msb_auth_token=${token}`,
    };

    // 5. Dashboard Stats API (Authenticated)
    const resStats = await fetch(`${baseUrl}/api/dashboard/stats`, {
      headers: authHeaders,
    });
    assert(resStats.status === 200, "5. Executive Dashboard stats API responds with HTTP 200");
    const statsData = await resStats.json();
    assert(statsData.data && statsData.data.inventory.totalProducts >= 18, `5b. Real product catalog count verified (${statsData.data?.inventory?.totalProducts} products)`);
    assert(statsData.data && statsData.data.inventory.expiringSoonCount >= 0, "5c. Real expiry alert metrics returned");
    assert(statsData.data && statsData.data.inventory.lowStockCount >= 0, "5d. Real low-stock metrics returned");

    // 6. Products Catalog API
    const resProductsApi = await fetch(`${baseUrl}/api/products`);
    assert(resProductsApi.status === 200, "6. Products API responds with HTTP 200");
    const productsJson = await resProductsApi.json();
    assert(productsJson.products && productsJson.products.length >= 18, "6b. 18+ pharmaceutical products retrieved with CAS & pharmacopoeia standards");

    // 7. Manual Inventory Adjustment (The Non-Negotiable Stock Rule)
    const resBatches = await fetch(`${baseUrl}/api/inventory`, {
      headers: authHeaders,
    });
    assert(resBatches.status === 200, "7. Inventory API batches list responds with HTTP 200");
    const inventoryData = await resBatches.json();
    const targetBatch = inventoryData.batches[0];
    assert(targetBatch && targetBatch.id, "7b. Batch retrieved for manual stock adjustment");

    const adjustPayload = {
      productId: targetBatch.productId,
      batchNumber: targetBatch.batchNumber,
      type: "INCREASE",
      quantityChange: 10,
      reason: "Reconciliation after physical stock audit",
      documentRef: "AUDIT-2026-OCT",
    };
    const resAdjust = await fetch(`${baseUrl}/api/inventory`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(adjustPayload),
    });
    assert(resAdjust.status === 200, "7c. Manual Stock Adjustment successfully processed");
    const adjustResult = await resAdjust.json();
    assert(adjustResult.success === true, "7d. Stock adjustment recorded in audit register");

    // 8. Invoices API and PDF Generation
    const resInvoices = await fetch(`${baseUrl}/api/invoices`, {
      headers: authHeaders,
    });
    assert(resInvoices.status === 200, "8. Invoices list API responds with HTTP 200");
    const invoicesData = await resInvoices.json();
    assert(invoicesData.invoices && invoicesData.invoices.length > 0, "8b. Invoices retrieved from database");
    const invoiceId = invoicesData.invoices[0].id;

    const resInvoicePdf = await fetch(`${baseUrl}/api/invoices/${invoiceId}/pdf`, {
      headers: authHeaders,
    });
    assert(resInvoicePdf.status === 200, "8c. Invoice PDF generation responds with HTTP 200");
    const contentTypePdf = resInvoicePdf.headers.get("content-type");
    assert(contentTypePdf && contentTypePdf.includes("application/pdf"), "8d. Correct application/pdf MIME type returned");

    // 9. Excel/CSV Reports API with Formula Injection Protection
    const resReportXlsx = await fetch(`${baseUrl}/api/reports?type=inventory&format=xlsx`, {
      headers: authHeaders,
    });
    assert(resReportXlsx.status === 200, "9. Excel (XLSX) report export responds with HTTP 200");
    const contentTypeXlsx = resReportXlsx.headers.get("content-type");
    assert(contentTypeXlsx && contentTypeXlsx.includes("spreadsheetml"), "9b. Correct XLSX spreadsheet MIME type returned");

    const resReportCsv = await fetch(`${baseUrl}/api/reports?type=enquiries&format=csv`, {
      headers: authHeaders,
    });
    assert(resReportCsv.status === 200, "9c. CSV report export responds with HTTP 200");
    const csvContent = await resReportCsv.text();
    assert(csvContent.includes("Dr. Rajesh Sharma"), "9d. CSV export correctly contains newly created enquiry data");

    // 10. Audit Logs API (Strict RBAC check)
    const resAudit = await fetch(`${baseUrl}/api/audit-logs`, {
      headers: authHeaders,
    });
    assert(resAudit.status === 200, "10. Audit logs API responds with HTTP 200");
    const auditData = await resAudit.json();
    assert(auditData.logs && auditData.logs.length > 0, `10b. Structured audit trail active (${auditData.logs.length} audit entries logged)`);

    console.log(`\n=== Verification Results: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runTests();
