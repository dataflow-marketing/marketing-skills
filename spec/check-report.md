# Check report (spec 1, draft)

What a check found in a text against its source: each quote, name, number and claim, whether it was found and where. A check is plain code, never a model. Its report can be trusted. It never changes the text; it says what to fix.

## The shape

```
spec 1
checked: drafts/iced-coffee.txt
against: recordings/2026-11-28-sam.txt
result: 3 problems

quote found: "The first hot morning always brings the same question at the counter." (line 4)
name found: Sam (line 1)
number not found: 1987
claim to read: "the oldest café on the street"
house rule broken: em dashes (2)
```

## Lines

| Line | Says |
|---|---|
| `checked` | the text checked |
| `against` | its source, as named in the words file's `from` |
| `result` | `passed` or how many problems |
| `quote found` / `quote not found` | a quoted sentence and where it is in the source |
| `name found` / `name not found` | a person, place or business name |
| `number found` / `number not found` | a number or a number written as words |
| `claim to read` | a plain claim code cannot prove; a person reads it |
| `house rule broken` | a house rule from settings and how many times |

## Rules

1. **Anything not found is removed, never reworded.** Rewording an invention keeps the invention.
2. **A claim to read is a problem until a person says it is true.**
3. **A draft with problems goes nowhere.**
