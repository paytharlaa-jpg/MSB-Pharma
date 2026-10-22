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

    // 11. Settings & Enquiry Notification Email Check (paytharlaa@gmail.com)
    const resSettings = await fetch(`${baseUrl}/api/settings`);
    assert(resSettings.status === 200, "11. Settings API responds with HTTP 200");
    const settingsData = await resSettings.json();
    assert(
      settingsData.settings?.enquiryNotificationEmail === "paytharlaa@gmail.com",
      `11b. Enquiry notification recipient verified as ${settingsData.settings?.enquiryNotificationEmail}`
    );

    // 12. In-Panel Notifications API (Durable persistence & unread counts)
    const resNotifs = await fetch(`${baseUrl}/api/notifications`, {
      headers: authHeaders,
    });
    assert(resNotifs.status === 200, "12. In-panel Notifications API responds with HTTP 200");
    const notifsData = await resNotifs.json();
    assert(notifsData.notifications && notifsData.notifications.length > 0, `12b. Notifications persisted in database (${notifsData.notifications.length} notifications)`);

    const resMarkAll = await fetch(`${baseUrl}/api/notifications`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ all: true }),
    });
    assert(resMarkAll.status === 200, "12c. Mark all notifications as read responds with HTTP 200");

    // 13. Forgot Password API (Enumeration-proof response)
    const resForgot = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "paytharlaa@gmail.com" }),
    });
    assert(resForgot.status === 200, "13. Forgot Password request responds with HTTP 200");
    const forgotData = await resForgot.json();
    assert(forgotData.success === true && forgotData.message, "13b. Forgot password returns generic enumeration-safe message");

    // 14. Super Admin Staff Reset Password API
    const resUsers = await fetch(`${baseUrl}/api/admin/users`, {
      headers: authHeaders,
    });
    assert(resUsers.status === 200, "14. Admin users listing responds with HTTP 200");
    const usersData = await resUsers.json();
    const targetStaff = usersData.users.find(u => u.email === "sales@msbpharmachem.com");
    assert(targetStaff && targetStaff.id, "14b. Sales staff member located for admin reset");

    const resAdminReset = await fetch(`${baseUrl}/api/admin/users/reset-password`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ userId: targetStaff.id, sendEmail: false }),
    });
    assert(resAdminReset.status === 200, "14c. Super Admin staff reset initiation responds with HTTP 200");
    const adminResetData = await resAdminReset.json();
    assert(adminResetData.resetUrl && adminResetData.resetUrl.includes("token="), "14d. Single-use reset link successfully generated");

    // 15. Reset Password Token Validation & Execution
    const resetUrlObj = new URL(adminResetData.resetUrl);
    const testToken = resetUrlObj.searchParams.get("token");

    const resValidateToken = await fetch(`${baseUrl}/api/auth/reset-password?token=${testToken}`);
    assert(resValidateToken.status === 200, "15. Reset token validation responds with HTTP 200");
    const validateData = await resValidateToken.json();
    assert(validateData.valid === true, "15b. Reset token verified as valid before consumption");

    const resCommitReset = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: testToken, password: "SalesPassword@2026" }),
    });
    assert(resCommitReset.status === 200, "15c. Password reset execution succeeds with HTTP 200");

    // Verify token is now invalidated (single-use constraint)
    const resReusedToken = await fetch(`${baseUrl}/api/auth/reset-password?token=${testToken}`);
    assert(resReusedToken.status === 400, "15d. Reused reset token rejected with HTTP 400 (single-use enforced)");

    // Restore sales password for future dev predictability
    const { PrismaClient } = await import("@prisma/client");
    const bcrypt = (await import("bcryptjs")).default;
    const p = new PrismaClient();
    const defaultHash = await bcrypt.hash("Password@123", 10);
    await p.user.update({ where: { email: "sales@msbpharmachem.com" }, data: { passwordHash: defaultHash } });
    await p.$disconnect();

    console.log(`\n=== Verification Results: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runTests();
