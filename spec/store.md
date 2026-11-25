# Store (spec 1, draft)

How any object (a ledger, a profile, a people list, a forecast) is read and written, wherever it lives. Skills that make an object know nothing about where it is kept. A binding in [settings](settings.md) says which store holds it; the store's connector does the storing.

## Connectors

| Connector | Keeps an object in | Size limit |
|---|---|---|
| file | a plain text file | none |
| ghost | a member's custom field, through the Ghost Admin API | 65,535 bytes a field |
| rest | any backend that meets the contract below | the backend declares it |

## The REST contract

Any backend that answers these works: a Hono Worker on D1, a serverless function, any service.

```
GET    /objects/:kind              list:   [{ id, version, updated }]
GET    /objects/:kind/:id          read:   { id, version, body }
POST   /objects/:kind              add:    { id, body }
PUT    /objects/:kind/:id          change: { body } with If-Match: <version>
DELETE /objects/:kind/:id          remove: with If-Match: <version>
GET    /limits                     { bytes } the largest body it takes
Authorization: Bearer <key>
```

- **kind** is the object's format: `ledger`, `profile`, `people`, `forecast`.
- **id** is the business's name from settings.
- **body** is the object's own plain text. No store needs to understand it.
- **version** changes on every write. A change or remove with an old version answers `409`; nothing is written.

## Every write

1. Read the object and its version.
2. Show what would change.
3. Wait for a yes.
4. Write with the version read in step 1.
5. Read it back; fail loudly if it differs.
6. On `409`, read again, merge and start from step 2.

**Removing** first saves a copy of the object beside the settings file, then needs an explicit yes.

## Rules

1. **A person's own edit is never overwritten without a yes.** The version check is what catches it.
2. **No write is larger than the store's limit.**
3. **A starter Worker that meets the contract is an example in this repo, not a skill.**
