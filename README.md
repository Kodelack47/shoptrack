# ShopTrack - Product Listings Prototype

This is a small working prototype of one feature from my ShopTrack backlog
(Assignment 1): **US1 - Add and edit product listings**, tied to FR1.

It's a client-only app - there's no real backend or database. Product data
is saved in the browser's `localStorage`, so it will still be there if you
refresh the page, but it's specific to whatever browser/machine you're using.
That's a known limitation, not a bug: for a prototype, keeping everything in the
browser made it possible to build and test the whole feature end to end.

## Files

- `index.html` - the page structure (form + product table)
- `style.css` - styling
- `app.js` - all the logic: data model, repository (storage), validation,
  and the controller that wires the form/table to everything else
- `test-plan.md` - the verification and validation plan with steps for each test case
- `docs/` - design diagrams and screenshots used in this README

## How to run it

You don't need to install anything.

**Option 1 - just open it**
Double-click `index.html` and it'll open in your default browser. That's
enough to use the app.

**Option 2 - run a local server (optional)**
Some browsers restrict `localStorage` for files opened directly from disk.
If you add a product and it doesn't seem to save after a refresh, run a
tiny local server instead:

```
cd shoptrack_prototype
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Design

**Use cases** for the whole ShopTrack system (this prototype covers *Add / Edit Product Listing*):

![ShopTrack use case diagram](docs/use-case-diagram.png)

**Domain model** for the full system:

![ShopTrack domain class diagram](docs/domain-class-diagram.png)

**Components of this prototype.** `ProductRepository` is the only piece that talks to
`localStorage`, `validateProduct` is a pure function with no DOM or storage access, and
`ProductController` connects the form and table to both:

![Component class diagram for the product listings feature](docs/component-class-diagram.png)

**Add Product flow**, including the validation-error path:

![Sequence diagram for adding a product](docs/add-product-sequence-diagram.png)

## What it does

- Add a new product with a SKU, name, price, and quantity on hand
- Edit an existing product (click "Edit" on any row)
- Delete a product (click "Delete" on any row)
- Form validation: SKU and name are required, SKU must be unique, price and
  quantity must be zero or more
- Data persists in `localStorage` between page refreshes

## Screenshots

| Empty state | Editing a product | Validation errors |
|---|---|---|
| ![App with no products yet](docs/screenshot-empty.png) | ![Product table with the form in edit mode](docs/screenshot-edit-mode.png) | ![Validation errors after an invalid entry](docs/screenshot-validation.png) |

## Testing

Six test cases were run by hand against the prototype (full steps in [`test-plan.md`](test-plan.md)):

![Test results: six test cases, all passing](docs/test-results.png)

TC5 passes in normal browser windows but fails in private mode when storage is blocked,
since the prototype depends on `localStorage`. That's a known limitation of a client-only prototype.

## What it does not do (out of scope for this prototype)

- No real backend, database, or multi-user support
- No CSV import (that's US2, a separate backlog item)
- No low-stock alerts (that's US4)
- No login/authentication (that's US6 / NFR2)

These are all separate stories in the backlog and would each get their own
design-and-build pass in a real sprint.

## Author

**Ousmana Tunkara** · [GitHub @Kodelack47](https://github.com/Kodelack47)

Licensed under the [MIT License](LICENSE).
