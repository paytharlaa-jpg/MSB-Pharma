# MSB PHARMACHEM — Product Spreadsheet Import Guide

## 1. Overview
The internal Product Master module includes a dedicated bulk import facility allowing authorized staff to import product lists from CSV or JSON format.

## 2. Supported Columns & Fields

| Field Name | Type | Mandatory | Description / Example |
|---|---|---|---|
| `sku` | String | Recommended | Unique internal identifier (e.g. `API-ATV-001`). If omitted, auto-generated. |
| `name` | String | **Mandatory** | Official commercial chemical name (e.g. `Atorvastatin Calcium`). |
| `category` | String | Optional | Target category name (e.g. `Active Pharmaceutical Ingredients (APIs)`). |
| `grade` | String | Optional | Pharmacopoeial monograph (e.g. `IP / BP / USP`). |
| `therapeuticCategory` | String | Optional | Clinical indication (e.g. `Cardiovascular`, `Anti-Asthmatic`). |
| `casNumber` | String | Optional | Chemical Abstracts Service number (e.g. `344423-98-9`). |
| `ihDmf` | String | Optional | Regulatory filing status (e.g. `DMF Available (WHO-GMP)`). |
| `unitOfMeasurement` | String | Optional | Default is `KG`. |

## 3. Duplicate SKU Policy
- By default, matching existing SKUs are safely skipped and reported in the error log to prevent silent overwrite of active batch data.
- Checking "Update existing product records" allows authorized staff to overwrite non-stock fields (such as therapeutic category, grade, or description) while preserving existing batches.
