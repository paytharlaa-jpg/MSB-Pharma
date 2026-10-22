import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MSB PHARMACHEM database seed...");

  // 1. Clean existing records if any
  await prisma.auditLog.deleteMany();
  await prisma.documentSequence.deleteMany();
  await prisma.paymentRecord.deleteMany();
  await prisma.deliveryChallanItem.deleteMany();
  await prisma.deliveryChallan.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.gRNItem.deleteMany();
  await prisma.goodsReceiptNote.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.enquiryNote.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.siteSettings.deleteMany();

  // 2. Site Settings
  await prisma.siteSettings.create({
    data: {
      id: "default",
      companyName: "MSB PHARMACHEM",
      logoUrl: "/images/logo-msb-pharmachem.png",
      phone: "+91 8008335333",
      email: "mohank9@gmail.com",
      address: "Plot No. 128, Kamala Prasanna Nagar, Allwyn Colony, Kukatpally, Hyderabad – 500072, Telangana, India",
      gstNumber: "36AAAAA0000A1Z5", // Configurable placeholder
      panNumber: "AAAAA0000A",
      bankDetails: "Bank: HDFC Bank, Kukatpally Branch\nA/C No: 50200000000000\nIFSC: HDFC0000000",
      invoiceTerms: "1. Payment due within 30 days of invoice date.\n2. Goods once sold will not be accepted back unless verified COA discrepancy within 7 days.\n3. Subject to Hyderabad jurisdiction.",
      quotationTerms: "1. Prices are valid for 15 days from issue date.\n2. GST applicable as per statutory rates.\n3. Delivery subject to stock availability.",
    },
  });

  // 3. Document Sequences
  const currentFy = "2026-27";
  const docTypes = [
    { type: "ENQ", prefix: "MSB/ENQ/26-27/" },
    { type: "PO", prefix: "MSB/PO/26-27/" },
    { type: "GRN", prefix: "MSB/GRN/26-27/" },
    { type: "QTN", prefix: "MSB/QTN/26-27/" },
    { type: "INV", prefix: "MSB/INV/26-27/" },
    { type: "DC", prefix: "MSB/DC/26-27/" },
  ];

  for (const dt of docTypes) {
    await prisma.documentSequence.create({
      data: {
        docType: dt.type,
        financialYear: currentFy,
        lastSequence: 10,
        prefix: dt.prefix,
      },
    });
  }

  // 4. Users (RBAC)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Password@123", salt);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Mohan K (Super Admin)",
      email: "admin@msbpharmachem.com",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const abhiramAdminPasswordHash = await bcrypt.hash("Abhiram@1289", salt);
  await prisma.user.create({
    data: {
      name: "Abhiram (Super Admin)",
      email: "paytharlaa@gmail.com",
      passwordHash: abhiramAdminPasswordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: "Ramesh Kumar (Sales)",
      email: "sales@msbpharmachem.com",
      passwordHash,
      role: "SALES",
      isActive: true,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: "Priya Sharma (Accounts)",
      email: "accounts@msbpharmachem.com",
      passwordHash,
      role: "ACCOUNTS",
      isActive: true,
    },
  });

  const inventoryUser = await prisma.user.create({
    data: {
      name: "Suresh Reddy (Inventory)",
      email: "inventory@msbpharmachem.com",
      passwordHash,
      role: "INVENTORY",
      isActive: true,
    },
  });

  console.log("✅ Seeded Users: Super Admin, Sales, Accounts, Inventory");

  // 5. Product Categories
  const catApis = await prisma.productCategory.create({
    data: {
      name: "Active Pharmaceutical Ingredients (APIs)",
      slug: "apis",
      description: "Human and veterinary APIs for generic formulation manufacturers.",
      sortOrder: 1,
    },
  });

  const catIntermediates = await prisma.productCategory.create({
    data: {
      name: "Pharma Raw Materials & Intermediates",
      slug: "intermediates-raw-materials",
      description: "Raw materials and key starting intermediates for chemical synthesis.",
      sortOrder: 2,
    },
  });

  const catExcipients = await prisma.productCategory.create({
    data: {
      name: "Excipients",
      slug: "excipients",
      description: "High-grade pharmaceutical excipients for stable formulation.",
      sortOrder: 3,
    },
  });

  const catChemicals = await prisma.productCategory.create({
    data: {
      name: "Chemicals & Solvents",
      slug: "chemicals-solvents",
      description: "Industrial, laboratory and pharma-grade chemicals and solvents.",
      sortOrder: 4,
    },
  });

  const catStandards = await prisma.productCategory.create({
    data: {
      name: "Impurity Standards",
      slug: "impurity-standards",
      description: "Certified reference and impurity standards for analytical QC & R&D.",
      sortOrder: 5,
    },
  });

  // 6. Customers & Suppliers
  const customer1 = await prisma.customer.create({
    data: {
      name: "Dr. Reddy's Laboratories Ltd",
      contactPerson: "Dr. V. Rao",
      email: "procurement@drreddys.com",
      phone: "+91 40 4900 2900",
      address: "Bollaram Road, Miyapur, Hyderabad – 500049",
      gstin: "36AAACD1234F1Z1",
      pan: "AAACD1234F",
      notes: "Key formulation partner for cardiovascular and anti-asthmatic APIs.",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Aurobindo Pharma Limited",
      contactPerson: "K. Venkat",
      email: "purchase@aurobindo.com",
      phone: "+91 40 6672 5000",
      address: "Plot No. 2, Maitrivihar, Ameerpet, Hyderabad – 500038",
      gstin: "36AAACA5678B1Z2",
      pan: "AAACA5678B",
      notes: "Regular requirement for Atorvastatin and Montelukast.",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Hetero Drugs Ltd",
      contactPerson: "S. Murthy",
      email: "orders@heterodrugs.com",
      phone: "+91 40 2370 4923",
      address: "7-2-A2, Hetero House, Sanathnagar, Hyderabad – 500018",
      gstin: "36AAACH9012D1Z3",
      pan: "AAACH9012D",
    },
  });

  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Deccan Fine Chemicals Pvt Ltd",
      contactPerson: "N. Srinivas",
      email: "sales@deccanfinechemicals.com",
      phone: "+91 891 282 3000",
      address: "Kesavaram, Payakaraopeta, Visakhapatnam, AP",
      gstin: "37AAACD7890E1Z4",
      pan: "AAACD7890E",
      notes: "Vetted manufacturer of key intermediates and bulk raw materials.",
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "Neuland Laboratories Ltd",
      contactPerson: "Anand M.",
      email: "contact@neulandlabs.com",
      phone: "+91 40 3021 1600",
      address: "Sanali Info Park, Road No. 2, Banjara Hills, Hyderabad – 500034",
      gstin: "36AAACN4321C1Z5",
      pan: "AAACN4321C",
      notes: "US-FDA and WHO-GMP approved supplier for APIs.",
    },
  });

  console.log("✅ Seeded Customers and Suppliers");

  // 7. Seed Products from actual user catalog
  const productsData = [
    {
      sku: "API-ATV-001",
      name: "Atorvastatin Calcium",
      categoryId: catApis.id,
      grade: "IP / BP / USP",
      therapeuticCategory: "Cardiovascular (Lipid-lowering)",
      casNumber: "344423-98-9",
      ihDmf: "DMF Available (WHO-GMP)",
      description: "High-purity HMG-CoA reductase inhibitor for statin generic formulations.",
      unitOfMeasurement: "KG",
      minimumStock: 50,
    },
    {
      sku: "INT-CNG-002",
      name: "2-[(5-Bromo-2-methylphenyl)methyl]-5-(4-fluorophenyl)thiophene",
      categoryId: catIntermediates.id,
      grade: "In-House Standard",
      therapeuticCategory: "Canagliflozin Intermediate",
      casNumber: "1030825-20-7",
      ihDmf: "Available on request",
      description: "Key heterocyclic intermediate for SGLT2 inhibitor Canagliflozin synthesis.",
      unitOfMeasurement: "KG",
      minimumStock: 25,
    },
    {
      sku: "API-AZI-003",
      name: "Azithromycin",
      categoryId: catApis.id,
      grade: "IP / USP / EP",
      therapeuticCategory: "Macrolide Antibiotic",
      casNumber: "83905-01-5",
      ihDmf: "WHO-GMP / CEP Available",
      description: "Broad-spectrum macrolide antibiotic used for respiratory and dermal bacterial infections.",
      unitOfMeasurement: "KG",
      minimumStock: 40,
    },
    {
      sku: "INT-DPG-004",
      name: "(3S)-3-[4-[(2-Chloro-5-iodophenyl)methyl]phenoxy]tetrahydrofuran",
      categoryId: catIntermediates.id,
      grade: "In-House High Grade",
      therapeuticCategory: "Dapagliflozin Intermediate",
      casNumber: "1201900-72-8",
      ihDmf: "In-House DMF",
      description: "Essential chiral intermediate for synthesis of Dapagliflozin API.",
      unitOfMeasurement: "KG",
      minimumStock: 20,
    },
    {
      sku: "API-CTC-005",
      name: "Citicoline Sodium",
      categoryId: catApis.id,
      grade: "IP / USP",
      therapeuticCategory: "Neuroprotective / Nootropic",
      casNumber: "33818-15-4",
      ihDmf: "Available",
      description: "Potent neuroprotective agent used in cerebrovascular disorders and head trauma.",
      unitOfMeasurement: "KG",
      minimumStock: 15,
    },
    {
      sku: "INT-LNG-006",
      name: "8-Bromo-7-(but-2-yn-1-yl)-3-methyl-1H-purine-2,6(3H,7H)-dione",
      categoryId: catIntermediates.id,
      grade: "High Purity",
      therapeuticCategory: "Linagliptin Intermediate",
      casNumber: "130693-82-2",
      ihDmf: "Available",
      description: "Purine-based intermediate for Linagliptin DPP-4 inhibitor antidiabetic synthesis.",
      unitOfMeasurement: "KG",
      minimumStock: 10,
    },
    {
      sku: "INT-MDX-007",
      name: "4-(Chloromethyl)-5-methyl-1,3-dioxol-2-one",
      categoryId: catIntermediates.id,
      grade: "Industrial / Pharma Grade",
      therapeuticCategory: "Medoxomil Prodrug Intermediate",
      casNumber: "80841-78-7",
      ihDmf: "Available",
      description: "Chloride coupling agent widely used in prodrug conversions such as Olmesartan Medoxomil.",
      unitOfMeasurement: "KG",
      minimumStock: 30,
    },
    {
      sku: "INT-OLM-008",
      name: "Ethyl 4-(2-hydroxy-2-propyl)-2-propyl-imidazole-5-carboxylate (OLMI-1)",
      categoryId: catIntermediates.id,
      grade: "IP / BP / USP Standard",
      therapeuticCategory: "Olmesartan Intermediate",
      casNumber: "144689-93-0",
      ihDmf: "DMF Available",
      description: "Key imidazole core intermediate for Olmesartan Medoxomil antihypertensive manufacturing.",
      unitOfMeasurement: "KG",
      minimumStock: 20,
    },
    {
      sku: "API-MTK-009",
      name: "Montelukast Sodium",
      categoryId: catApis.id,
      grade: "IP / EP / USP",
      therapeuticCategory: "Anti-Asthmatic / Leukotriene Receptor Antagonist",
      casNumber: "151767-02-1",
      ihDmf: "WHO-GMP / US-DMF",
      description: "Oral leukotriene receptor antagonist for asthma management and allergic rhinitis.",
      unitOfMeasurement: "KG",
      minimumStock: 30,
    },
    {
      sku: "INT-TTB-010",
      name: "5-(4'-(Bromomethyl)-[1,1'-biphenyl]-2-yl)-1-trityl-1H-tetrazole (TTBB)",
      categoryId: catIntermediates.id,
      grade: "High Assay (>99%)",
      therapeuticCategory: "Sartan Family Intermediate (Losartan, Valsartan)",
      casNumber: "124750-51-2",
      ihDmf: "Available",
      description: "Crucial tetrazole-biphenyl building block for the entire Sartan class of antihypertensives.",
      unitOfMeasurement: "KG",
      minimumStock: 50,
    },
    {
      sku: "API-NTF-011",
      name: "Nitrofurantoin",
      categoryId: catApis.id,
      grade: "IP / BP / USP",
      therapeuticCategory: "Antibiotic / Urinary Anti-Infective",
      casNumber: "67-20-9",
      ihDmf: "DMF Available",
      description: "Synthetic nitrofuran antibacterial agent targeting acute urinary tract infections.",
      unitOfMeasurement: "KG",
      minimumStock: 25,
    },
    {
      sku: "API-RSV-012",
      name: "Rosuvastatin Calcium",
      categoryId: catApis.id,
      grade: "IP / EP / USP",
      therapeuticCategory: "Cardiovascular (Statin)",
      casNumber: "147098-20-2",
      ihDmf: "WHO-GMP / US-DMF",
      description: "Potent competitive HMG-CoA reductase inhibitor for severe hypercholesterolemia.",
      unitOfMeasurement: "KG",
      minimumStock: 35,
    },
    {
      sku: "API-TDL-013",
      name: "Tadalafil",
      categoryId: catApis.id,
      grade: "USP / IP",
      therapeuticCategory: "PDE5 Inhibitor / Pulmonary Arterial Hypertension",
      casNumber: "171596-29-5",
      ihDmf: "DMF Available",
      description: "Selective phosphodiesterase type 5 (PDE5) inhibitor.",
      unitOfMeasurement: "KG",
      minimumStock: 15,
    },
    {
      sku: "API-TGC-014",
      name: "Tigecycline",
      categoryId: catApis.id,
      grade: "USP",
      therapeuticCategory: "Glycylcycline Anti-Bacterial",
      casNumber: "220620-09-7",
      ihDmf: "DMF Available",
      description: "First-in-class glycylcycline antibacterial overcoming major tetracycline resistance mechanisms.",
      unitOfMeasurement: "KG",
      minimumStock: 10,
    },
    {
      sku: "API-ACT-015",
      name: "Acotiamide Hydrochloride",
      categoryId: catApis.id,
      grade: "IH Standard",
      therapeuticCategory: "Gastrointestinal Prokinetic Agent",
      casNumber: "185106-16-5",
      ihDmf: "Available",
      description: "Selective acetylcholinesterase inhibitor for functional dyspepsia and postprandial distress.",
      unitOfMeasurement: "KG",
      minimumStock: 12,
    },
    {
      sku: "API-BNF-016",
      name: "Benfotiamine",
      categoryId: catApis.id,
      grade: "IP / USP",
      therapeuticCategory: "Lipid-Soluble Vitamin B1 / Diabetic Polyneuropathy",
      casNumber: "22457-89-2",
      ihDmf: "DMF Available",
      description: "High-bioavailability synthetic thiamine derivative for diabetic microvascular complications.",
      unitOfMeasurement: "KG",
      minimumStock: 20,
    },
    {
      sku: "API-DFX-017",
      name: "Deferoxamine Mesylate",
      categoryId: catApis.id,
      grade: "IP / BP / USP",
      therapeuticCategory: "Iron Chelating Agent",
      casNumber: "138-14-7",
      ihDmf: "Available",
      description: "Bacterial siderophore chelating agent for chronic iron overload (e.g. thalassemia).",
      unitOfMeasurement: "KG",
      minimumStock: 8,
    },
    {
      sku: "API-FXF-018",
      name: "Fexofenadine Hydrochloride",
      categoryId: catApis.id,
      grade: "IP / EP / USP",
      therapeuticCategory: "Second-Generation Antihistamine",
      casNumber: "153439-40-8",
      ihDmf: "WHO-GMP / US-DMF",
      description: "Non-sedating selective peripheral H1-receptor antagonist for allergic conditions.",
      unitOfMeasurement: "KG",
      minimumStock: 45,
    },
  ];

  const createdProducts: Record<string, string> = {};

  for (const p of productsData) {
    const prod = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        categoryId: p.categoryId,
        grade: p.grade,
        therapeuticCategory: p.therapeuticCategory,
        casNumber: p.casNumber,
        ihDmf: p.ihDmf,
        description: p.description,
        unitOfMeasurement: p.unitOfMeasurement,
        minimumStock: p.minimumStock,
        isApprovedForPublic: true,
        isActive: true,
      },
    });
    createdProducts[p.sku] = prod.id;
  }

  console.log(`✅ Seeded ${productsData.length} master products from official catalog`);

  // 8. Seed Batches, Stock, and Manual Adjustments
  const batch1 = await prisma.productBatch.create({
    data: {
      productId: createdProducts["API-ATV-001"],
      batchNumber: "ATV-2026-001",
      mfgDate: new Date("2026-01-15"),
      expiryDate: new Date("2028-01-14"),
      currentQuantity: 120,
      unit: "KG",
      storageLocation: "Warehouse A, Bay 3",
      supplierId: supplier2.id,
      notes: "COA verified, 99.8% assay.",
    },
  });

  await prisma.stockAdjustment.create({
    data: {
      batchId: batch1.id,
      productId: createdProducts["API-ATV-001"],
      type: "OPENING_BALANCE",
      quantityChange: 120,
      quantityBefore: 0,
      quantityAfter: 120,
      reason: "Initial system stock take - verified with physical audit",
      performedByUserId: inventoryUser.id,
    },
  });

  // Approaching expiry batch (expires in 45 days)
  const batch2Expiry = new Date();
  batch2Expiry.setDate(batch2Expiry.getDate() + 45);

  const batch2 = await prisma.productBatch.create({
    data: {
      productId: createdProducts["API-MTK-009"],
      batchNumber: "MTK-2024-EXP",
      mfgDate: new Date("2024-11-01"),
      expiryDate: batch2Expiry,
      currentQuantity: 18,
      unit: "KG",
      storageLocation: "Warehouse A, Bay 1 (Quarantine Alert)",
      supplierId: supplier1.id,
      notes: "Priority dispatch - 45 days remaining until expiry.",
    },
  });

  await prisma.stockAdjustment.create({
    data: {
      batchId: batch2.id,
      productId: createdProducts["API-MTK-009"],
      type: "OPENING_BALANCE",
      quantityChange: 18,
      quantityBefore: 0,
      quantityAfter: 18,
      reason: "Stock audit record",
      performedByUserId: inventoryUser.id,
    },
  });

  // Low stock batch (below 15 minimumStock)
  const batch3 = await prisma.productBatch.create({
    data: {
      productId: createdProducts["API-TDL-013"],
      batchNumber: "TDL-2026-003",
      mfgDate: new Date("2026-03-01"),
      expiryDate: new Date("2028-02-28"),
      currentQuantity: 4, // Low stock! Min is 15
      unit: "KG",
      storageLocation: "Warehouse B, Safe Vault",
      supplierId: supplier2.id,
      notes: "Stock is low, reorder required.",
    },
  });

  await prisma.stockAdjustment.create({
    data: {
      batchId: batch3.id,
      productId: createdProducts["API-TDL-013"],
      type: "OPENING_BALANCE",
      quantityChange: 4,
      quantityBefore: 0,
      quantityAfter: 4,
      reason: "Opening inventory entry",
      performedByUserId: inventoryUser.id,
    },
  });

  console.log("✅ Seeded Batches and Manual Stock Adjustments (including expiry alert & low-stock cases)");

  // 9. Enquiries
  const enquiry1 = await prisma.enquiry.create({
    data: {
      enquiryNumber: "MSB/ENQ/26-27/001",
      contactName: "Dr. Arvind Chari",
      companyName: "Bharat Biotech International",
      email: "achari@bharatbiotech.com",
      phone: "+91 9849012345",
      productOfInterest: "Atorvastatin Calcium",
      category: "APIs",
      requestedQuantity: 50,
      unit: "KG",
      message: "Urgent commercial requirement for formulation batch. Please provide COA, DMF access confirmation, and quotation for 50 KG.",
      status: "IN_PROGRESS",
      assignedToUserId: salesUser.id,
      notes: "Followed up on phone; sent technical spec sheet.",
    },
  });

  await prisma.enquiryNote.create({
    data: {
      enquiryId: enquiry1.id,
      authorUserId: salesUser.id,
      content: "Spoke with Dr. Chari. Client requested sample and competitive pricing for quarterly contract.",
    },
  });

  const enquiry2 = await prisma.enquiry.create({
    data: {
      enquiryNumber: "MSB/ENQ/26-27/002",
      contactName: "Tan Wei Lun",
      companyName: "Apex Pharma Singapore Pte Ltd",
      email: "wltan@apexpharma.sg",
      phone: "+65 6789 0123",
      productOfInterest: "Montelukast Sodium",
      category: "APIs",
      requestedQuantity: 100,
      unit: "KG",
      message: "Looking for export supply to Southeast Asia. Require WHO-GMP and export documentation support.",
      status: "NEW",
      assignedToUserId: null,
      notes: "New international lead from website portal.",
    },
  });

  console.log("✅ Seeded Enquiries & Follow-up Notes");

  // 10. Purchase Orders (PO) & GRN
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "MSB/PO/26-27/001",
      supplierId: supplier1.id,
      orderDate: new Date("2026-09-10"),
      expectedDeliveryDate: new Date("2026-09-25"),
      status: "COMPLETED",
      notes: "Direct factory shipment to Kukatpally warehouse.",
      paymentTerms: "Net 30 days upon receipt of material and COA",
      totalAmount: 250000,
      createdByUserId: superAdmin.id,
    },
  });

  await prisma.purchaseOrderItem.create({
    data: {
      purchaseOrderId: po1.id,
      productId: createdProducts["INT-CNG-002"],
      quantity: 50,
      unit: "KG",
      unitPrice: 5000,
      lineTotal: 250000,
    },
  });

  const grn1 = await prisma.goodsReceiptNote.create({
    data: {
      grnNumber: "MSB/GRN/26-27/001",
      supplierId: supplier1.id,
      purchaseOrderId: po1.id,
      receiptDate: new Date("2026-09-24"),
      status: "VERIFIED",
      notes: "Material received in intact drums with factory seal. COA matching specification.",
      receivedByUserId: inventoryUser.id,
    },
  });

  await prisma.gRNItem.create({
    data: {
      grnId: grn1.id,
      productId: createdProducts["INT-CNG-002"],
      batchNumber: "CNG-DEC-992",
      expiryDate: new Date("2028-09-01"),
      receivedQuantity: 50,
      acceptedQuantity: 50,
      rejectedQuantity: 0,
      unit: "KG",
      storageLocation: "Warehouse B, Section 2",
    },
  });

  console.log("✅ Seeded Purchase Order and Goods Receipt Note");

  // 11. Quotations
  const qtn1 = await prisma.quotation.create({
    data: {
      quotationNumber: "MSB/QTN/26-27/001",
      customerId: customer1.id,
      quotationDate: new Date("2026-10-01"),
      validUntilDate: new Date("2026-10-16"),
      status: "ACCEPTED",
      notes: "Commercial quote for Atorvastatin Calcium API IP/BP/USP grade.",
      terms: "1. Delivery: Within 3 business days\n2. Payment: 30 days credit\n3. Tax: 18% GST extra",
      subtotal: 180000,
      taxRate: 18,
      taxAmount: 32400,
      discountAmount: 0,
      grandTotal: 212400,
      createdByUserId: salesUser.id,
    },
  });

  await prisma.quotationItem.create({
    data: {
      quotationId: qtn1.id,
      productId: createdProducts["API-ATV-001"],
      description: "Atorvastatin Calcium IP/BP/USP (Batch ATV-2026-001)",
      quantity: 20,
      unit: "KG",
      unitPrice: 9000,
      lineTotal: 180000,
    },
  });

  // 12. Invoices & Payments
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "MSB/INV/26-27/001",
      customerId: customer1.id,
      quotationId: qtn1.id,
      invoiceDate: new Date("2026-10-05"),
      dueDate: new Date("2026-11-04"),
      status: "ISSUED",
      paymentStatus: "PARTIALLY_PAID",
      currency: "INR",
      subtotal: 180000,
      taxRate: 18,
      taxAmount: 32400,
      discountAmount: 0,
      grandTotal: 212400,
      paidAmount: 100000,
      balanceAmount: 112400,
      notes: "Invoice against accepted Quotation MSB/QTN/26-27/001.",
      terms: "Payment due within 30 days via NEFT/RTGS to HDFC bank account.",
      createdByUserId: accountsUser.id,
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: inv1.id,
      productId: createdProducts["API-ATV-001"],
      description: "Atorvastatin Calcium IP/BP/USP",
      quantity: 20,
      unit: "KG",
      unitPrice: 9000,
      lineTotal: 180000,
    },
  });

  await prisma.paymentRecord.create({
    data: {
      invoiceId: inv1.id,
      amount: 100000,
      paymentDate: new Date("2026-10-12"),
      paymentMethod: "NEFT/RTGS",
      referenceNumber: "UTR-HDFC-99882211",
      notes: "Part advance payment received via RTGS.",
      recordedByUserId: accountsUser.id,
    },
  });

  // 13. Delivery Challan
  const dc1 = await prisma.deliveryChallan.create({
    data: {
      challanNumber: "MSB/DC/26-27/001",
      customerId: customer1.id,
      invoiceId: inv1.id,
      deliveryDate: new Date("2026-10-06"),
      deliveryAddress: "Dr. Reddy's Laboratories Ltd, Miyapur Plant, Hyderabad",
      dispatchDetails: "Dispatched via SafeX Logistics with tamper-evident seals",
      vehicleNumber: "TS 09 UB 4545",
      status: "DELIVERED",
      notes: "Goods delivered in full and acknowledged by store receipt counter.",
      createdByUserId: inventoryUser.id,
    },
  });

  await prisma.deliveryChallanItem.create({
    data: {
      deliveryChallanId: dc1.id,
      productId: createdProducts["API-ATV-001"],
      batchId: batch1.id,
      quantity: 20,
      unit: "KG",
    },
  });

  console.log("✅ Seeded Invoices, Payments, and Delivery Challan");

  // 14. Seed Blog Posts
  await prisma.blogPost.createMany({
    data: [
      {
        title: "Global Supply Chain Resilience in Pharmaceutical Intermediates",
        slug: "supply-chain-resilience-pharmaceutical-intermediates",
        excerpt: "How dependable procurement partnerships and local inventory planning buffer formulation schedules against geopolitical and raw material volatility.",
        content: `In the contemporary pharmaceutical landscape, production timelines are extremely sensitive to supply chain fluctuations. Active Pharmaceutical Ingredients (APIs) and their upstream intermediates represent the foundation of modern healthcare delivery.

### The Value of Localized Sourcing & Regulatory Readiness

Having immediate access to verified raw materials with complete COA (Certificate of Analysis) and documentation compliance prevents costly plant shutdowns. MSB PHARMACHEM bridges the gap between primary chemical synthesizers and generic drug manufacturers by maintaining disciplined planning, stringent quality checks, and transparent documentation.

### Key Factors in Vendor Qualification:
1. **Purity Profiles & Impurity Analysis**: Ensuring compliant assay levels and absence of genotoxic impurities.
2. **Batch Consistency**: Providing consistent physical and chemical parameters across recurring production runs.
3. **Traceability**: Transparent provenance from chemical synthesis to final packaging.`,
        coverImage: "/images/blog-supply-chain.webp",
        author: "MSB PHARMACHEM Technical Desk",
        isPublished: true,
        seoTitle: "Supply Chain Resilience in Pharma Intermediates | MSB PHARMACHEM",
        seoDescription: "Explore how reliable API and chemical intermediate supply chains support continuous formulation production.",
      },
      {
        title: "Impurity Standards and Their Vital Role in Formulation Quality Control",
        slug: "impurity-standards-formulation-quality-control",
        excerpt: "A deep dive into why high-purity reference materials and impurity standards are non-negotiable for analytical validation and regulatory filings.",
        content: `Analytical chemistry forms the bedrock of pharmaceutical safety. Impurity standards allow analytical scientists to identify, quantify, and report potential degradants or process-related byproducts with utmost precision.

### Ensuring Regulatory Compliance

Regulatory bodies including the US FDA, EDQM, and Indian CDSCO enforce rigorous guidelines on impurity thresholds (ICH Q3A/B). Sourcing certified reference standards with comprehensive structural elucidation and chromatographic purity data empowers R&D teams to streamline ANDA filings and ensure patient safety.`,
        coverImage: "/images/blog-impurity.webp",
        author: "MSB Quality Assurance Group",
        isPublished: true,
        seoTitle: "Impurity Standards & Formulation QC | MSB PHARMACHEM",
        seoDescription: "Learn how certified impurity standards accelerate analytical validation and ensure regulatory compliance.",
      },
      {
        title: "Hyderabad: The Pharma Capital Leading India's API Sourcing Excellence",
        slug: "hyderabad-pharma-capital-leading-api-excellence",
        excerpt: "Reflecting on Hyderabad's unique ecosystem of formulation giants, bulk drug manufacturers, and cutting-edge chemical R&D hubs.",
        content: `Producing over a third of global vaccine supplies and home to leading generic manufacturers, Hyderabad is globally recognized as the Life Sciences capital of India. Located in Kukatpally, MSB PHARMACHEM leverages this strategic geographic positioning to provide swift dispatch, reliable logistics, and dependable procurement partnerships across domestic and international markets.`,
        coverImage: "/images/blog-hyderabad.webp",
        author: "Editorial Team",
        isPublished: true,
        seoTitle: "Hyderabad: The Global Pharma Hub | MSB PHARMACHEM",
        seoDescription: "How MSB PHARMACHEM's Hyderabad location enables rapid procurement and global supply.",
      },
    ],
  });

  // 15. Audit Log
  await prisma.auditLog.create({
    data: {
      entityType: "SYSTEM",
      entityId: "SYSTEM_INITIALIZE",
      action: "SEED",
      performedByUserId: superAdmin.id,
      userEmail: superAdmin.email,
      details: JSON.stringify({ message: "Initial database seed completed successfully." }),
    },
  });

  console.log("✨ MSB PHARMACHEM database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
