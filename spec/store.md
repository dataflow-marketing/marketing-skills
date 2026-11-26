# Store (spec 1, draft)

How any object (a ledger, a profile, a people list, a forecast) is read and written, wherever it lives. Skills that make an object know nothing about where it is kept. A binding in [settings](settings.md) says which store holds it; the store's connector does the storing. With no binding, an object is a file in the working folder.

A store never reads what is inside an object. It moves the text as it is.

## Connectors

| Connector | Keeps an object in | Place in a binding | Version | Size limit |
|---|---|---|---|---|
| file | a plain text file | a path under the store's folder | a hash of the text | none |
| ghost | a member's custom field, through the Ghost Admin API | a member's email and a field name | a hash of the field's text | 65,535 bytes a field |
| rest | any backend that meets the contract below | the object's id (the business's name) | the backend's own | the backend declares it at `/limits` |

**The hash** is SHA-256 of the object's text as UTF-8, in lowercase hex. An empty or missing object has the version `none`.

**A ghost binding** names exactly one member. store-check stops if the email matches no member or more than one. It also stops if the field does not exist on the site.

**A rest store** is `store <name>: rest <address> key in <NAME>`: the address is `https://` (`http://localhost` or `http://127.0.0.1` for a Worker run on the same computer). The key is read from the keys file and sent only as the Bearer key. Its binding's place is the object's id: `binding ledger coffee-shop: api coffee-shop`. The version a rest store gives is shown and sent back as it is; a skill never works one out.

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
- **A missing object** answers `404`. A skill reads it as empty with the version `none`; its first write is an add. An add over an object already kept answers `409`.
- **The answers:** a list or a read `200`, an add `201 { id, version }`, a change `200 { id, version }`, a remove `204`. A key that is missing or wrong `401`, a body over the limit `413`, a change or remove with no `If-Match` `428`. Nothing is written on any of these refusals.
- **The starter Worker** ([examples/store-worker](../examples/store-worker/README.md)) gives a new random id (a UUID) as the version on every write.

## Every write

1. Read the object and its version.
2. Show what would change and wait for a yes. Nothing is written yet.
3. Read it again. If the version differs from step 1, stop: nothing is written.
4. Copy it into the backups folder: `<kind>-<business>-<time>.txt`, the time in the settings time zone. An empty object has nothing to copy.
5. Write it (with `If-Match` on a rest store).
6. Read it back. If it differs from what was sent, fail loudly and name the backup.

**When the version has moved** (at step 3, with a `409` or with a `404` on a change to an object that was there) the store shows the object as it is now beside the change and stops. It never merges. The skill that made the change works it in again and asks again from step 1.

**Ghost has no version check of its own** on a member write, as far as is known (to be proved on a test member). Step 3 narrows the window to one request; it cannot close it. A rest store closes it with `If-Match`.

## List, add and remove

- **A list** reads every binding of one kind in settings and gives each object's place and version. A file or a Ghost field has no time of its own: a list from them has no `updated`.
- **An add** writes only where the place is empty (version `none`). Anything there already is a change, never an add: the add stops and writes nothing, at step 2 and again at step 3. An empty place has nothing to back up.
- **A remove** empties the object: a file is deleted; a Ghost field is set to null, every other field kept. It follows every step above; step 4 always copies, as only an object with something in it is removed. Read back, its version is `none`.

## Rules

1. **A person's own edit is never overwritten without a yes.** The version check is what catches it.
2. **A backup before every change and every remove.** The backups folder is never cleared by a skill.
3. **No write is larger than the store's limit.**
4. **A store never merges and never reads an object's format.**
5. **A starter Worker that meets the contract is an example in this repo, not a skill:** [examples/store-worker](../examples/store-worker/README.md).
