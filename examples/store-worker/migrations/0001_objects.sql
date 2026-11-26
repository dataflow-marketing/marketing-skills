-- One row for each object a skill keeps: a ledger, a profile, a people list or a forecast.
-- kind and id name the object. version changes on every write.
-- updated is when it was last written. body is the object's own plain text.

CREATE TABLE objects (
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  version TEXT NOT NULL,
  updated TEXT NOT NULL,
  body TEXT NOT NULL,
  PRIMARY KEY (kind, id)
);
