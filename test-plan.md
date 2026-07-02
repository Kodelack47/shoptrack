# V&V Test Plan - ShopTrack Product Listings (US1 / FR1)

Tested manually in Chrome and Firefox by opening `index.html` and running
through each case by hand. No automated test framework was used for this
prototype - see the reflection in the main write-up for why.

| ID | Test Case | Steps | Expected Result | Actual Result | Pass/Fail |
|----|-----------|-------|------------------|----------------|-----------|
| TC1 | Add a valid product (functional) | Enter SKU `TKS-010`, Name `Test Candle`, Price `15.00`, Qty `10`. Click Add Product. | New row appears in the table with the values entered; "Product added." message shown. | Row appeared with correct values; message shown as expected. | Pass |
| TC2 | Reject missing SKU (functional) | Leave SKU blank, fill in the other fields, click Add Product. | "SKU is required." shown under the SKU field; nothing is added to the table. | Error shown, field outlined in red, table unchanged. | Pass |
| TC3 | Edit an existing product (functional) | Click Edit on an existing row, change the price, click Save Changes. | The row updates with the new price; "Product updated." message shown. | Row updated correctly, no duplicate row created. | Pass |
| TC4 | Reject duplicate SKU (functional / data integrity) | Try to add a second product using a SKU that already exists in the table. | "That SKU is already in use." shown under the SKU field; second product is not added. | Worked as expected on first try. | Pass |
| TC5 | Data persists after refresh (reliability) | Add a product, then refresh the page (F5). | The product is still in the table after the page reloads, since data is read from `localStorage` on load. | Passed in Chrome and Firefox on desktop. Fails if the browser is in private/incognito mode with storage blocked - documented as a known limitation, not fixed for this prototype. | Pass (with noted limitation) |
| TC6 | Code review checklist (maintainability) | Manually reviewed `app.js` against a short checklist instead of running an automated test, since maintainability is not something you can click through. | See checklist below. | See notes below. | Pass |

## TC6 checklist detail

- Storage logic (`ProductRepository`) is kept separate from DOM code (`ProductController`) - **Pass**
- Validation (`validateProduct`) is a plain function with no DOM or storage code inside it, so it could be unit tested on its own later - **Pass**
- Function and variable names describe what they do (`getAll`, `findBySku`, `handleSubmit`) - **Pass**
- No single function is more than about 25 lines - **Pass**
- Comments explain *why* a decision was made (e.g., the localStorage tradeoff, the fallback ID generator) rather than just restating the code - **Pass**

## Known issues found

1. **No server-side validation.** All validation happens in the browser. If
   this became a real multi-user product, a person could bypass the form
   entirely and write directly to `localStorage` (or a real API) with bad
   data. Not a problem for a single-user prototype, but it would need a
   second validation layer on a real backend.
2. **Storage is per-browser, not shared.** Since there's no backend, product
   data does not sync between devices. This is expected for a prototype but
   is a real limitation if I ever wanted to check inventory from my phone
   and laptop and see the same data.
3. **No confirmation before delete.** Clicking Delete removes a product
   immediately with no "are you sure?" step. This is a usability gap I would
   fix before considering this done - see the reflection for more.
