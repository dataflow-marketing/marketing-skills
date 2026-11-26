// One line of a ledger's graph part or plan part (spec/ledger.md).
// Built by `pnpm build` into src/read/lines.js, which is committed: a Worker cannot build a parser while it runs.
// Every line stands alone. A part is read line by line (src/read/read-lines.ts) so a problem names its line.
//
// It reads the spec 1 words and the words dfm used before them, to the same result:
//   told and paste          read by src/read/read-graph.ts, not here
//   removes: and remove:   both a remove line
//   cycle weekly and cycle: weekly
//   a spec line            `spec 1`, read and set aside

// ---- graph lines ----

GraphLine
  = Spec
  / _ "extends" __ file:Rest { return { kind: "extends", file }; }
  / _ "fact" __ fact:Name _ ":" _ source:Rest { return { kind: "fact", fact, source }; }
  / _ "group" __ name:$[^:\n]+ ":" _ rule:GroupRule _ Comment? {
      return { kind: "group", name: name.trim(), rule };
    }
  / _ "area" __ name:$[^:\n]+ ":" _ first:Name rest:(_ "," _ n:Name { return n; })* _ Comment? {
      return { kind: "area", name: name.trim(), members: [first, ...rest] };
    }
  / _ "icon" __ icon:$[^:\n]+ ":" _ first:Name rest:(_ "," _ n:Name { return n; })* _ Comment? {
      return { kind: "icon", icon: icon.trim(), members: [first, ...rest] };
    }
  / _ "cycle" CycleGap frequency:("daily" / "weekly" / "monthly" / "quarterly" / "yearly") _ Comment? !. {
      return { kind: "cycle", frequency };
    }
  / _ ("removes" / "remove") _ ":" _ from:From _ Arrow _ to:Name _ Comment? { return { kind: "remove", from, to }; }
  / _ "when" __ when:$(!Arrow [^\n])+ Arrow _ event:Rest { return { kind: "when", when: when.trim(), event }; }
  / _ from:From _ Arrow _ to:Name _ ":" _ result:Result within:Within? _ label:Label? _ Comment? {
      return { kind: "link", from, to, result, within: within ?? 0, label: label?.label, downside: label?.downside ?? false };
    }
  / Blank

From
  = first:Part rest:(_ "+" _ p:Part { return p; })* { return [first, ...rest]; }

Part
  = name:Name group:(_ "[" g:$[^\]\n]+ "]" { return g.trim(); })? { return group ? { name, group } : { name }; }

// a link's rate: unknown, from the people list, borrowed, each action's own count or a count
Result
  = "?" { return { kind: "unknown" }; }
  / "from" __ "people" { return { kind: "people" }; }
  / "like" __ name:Name { return { kind: "like", name }; }
  / each:Each __ "from" __ out:Num unit:Unit? {
      const m = /^(.*?)\s*over (\d+) weeks?$/.exec((unit ?? "").trim());
      const low = each.reduce((a, b) => a + b, 0);
      return { kind: "from", low, high: low, out, each, unit: (m ? m[1] : unit ?? "").trim(), weeks: m ? Number(m[2]) : 0 };
    }
  / low:Num high:(_ "to" __ n:Num { return n; })? __ per:("of" / "from") __ out:Num unit:Unit? {
      const m = /^(.*?)\s*over (\d+) weeks?$/.exec((unit ?? "").trim());
      return { kind: per, low, high: high ?? low, out, unit: (m ? m[1] : unit ?? "").trim(), weeks: m ? Number(m[2]) : 0 };
    }

Each
  = first:Num rest:(_ "+" _ n:Num { return n; })+ { return [first, ...rest]; }

Unit
  = [ \t]+ u:$[^,(\n#]+ { return u; }

// how long a link takes, in weeks: 0 is the same week, "?" was never measured
Within
  = _ "," _ "within" __ w:(
      "?" { return "?"; }
    / "same week" { return 0; }
    / n:Num _ u:("weeks" / "week" / "days" / "day" / "months" / "month" / "years" / "year") {
        const days = { week: 7, day: 1, month: 30, year: 365 }[u.replace(/s$/, "")];
        return Math.max(1, Math.ceil((n * days) / 7));
      }
    ) { return w; }

// a link's strength and whether it is a downside
Label
  = "(" _ label:("proven" / "believed" / "assumed" / "unknown") downside:(_ "," _ "downside")? _ ")" {
      return { label, downside: !!downside };
    }

// ---- plan lines ----

PlanLine
  = Spec
  / _ "extends" __ file:Rest { return { kind: "extends", file }; }
  / _ "start" __ date:Date _ Comment? { return { kind: "start", date }; }
  / _ "want" __ fact:WantName __ ("+" _)? n:Num __ ("a" / "per" / "each") __ every:("week" / "month") by:(__ "by" __ d:Date { return d; })? _ Comment? {
      return { kind: "want", fact, per: { n, every }, by: by ?? undefined };
    }
  / _ "want" __ fact:WantName n:(__ n:Num { return n; })? by:(__ "by" __ d:Date { return d; })? _ Comment? {
      return { kind: "want", fact, n: n ?? undefined, by: by ?? undefined };
    }
  / _ "every" __ "week" __ first:EveryPart rest:(_ "," _ p:EveryPart { return p; })* from:(__ "from" __ d:Date { return d; })? _ Comment? {
      return { kind: "every", every: "week", methods: [first, ...rest], from: from ?? undefined };
    }
  / _ "how" __ thing:$[^:\n]+ ":" _ words:$[^\n]+ {
      return { kind: "how", thing: thing.trim(), words: words.trim() };
    }
  / _ week:Date __ kind:("how" / "script") __ thing:$[^:\n]+ ":" _ words:$[^\n]+ {
      return { kind, thing: thing.trim(), words: words.trim(), week };
    }
  / _ "script" __ thing:$[^:\n]+ ":" _ words:$[^\n]+ {
      return { kind: "script", thing: thing.trim(), words: words.trim() };
    }
  / _ date:Date __ op:(o:("+" / "-" / "\u2212") _ { return o === "+" ? "+" : "-"; })? first:Part rest:(_ "," _ p:Part { return p; })* _ Comment? {
      return { kind: "entry", date, op: op ?? "=", methods: [first, ...rest] };
    }
  / Blank

// a step's name in an every week line: up to a "from <date>" at the end
EveryPart
  = n:$((!(__ "from" __ Date) !Arrow [^\u2192:\[\]+(),#\n])+) group:(_ "[" g:$[^\]\n]+ "]" { return g.trim(); })? {
      return group ? { name: n.trim(), group } : { name: n.trim() };
    }

// what puts someone in a group
GroupRule
  = "tag" __ tag:$[^ \t\n#]+ { return { kind: "tag", tag }; }
  / "status" __ status:("paid" / "free" / "comped") { return { kind: "status", status }; }
  / "has" __ field:$[^ \t\n#]+ { return { kind: "has", field }; }
  / "opened" __ k:Num __ "of the last" __ n:Num { return { kind: "opened", k, n }; }
  / "field" __ field:$[^ \t\n#]+ __ "answered" { return { kind: "answered", field }; }
  / "field" __ field:$[^ \t\n#]+ __ "is" __ value:$[^#\n]+ { return { kind: "field", field, value: value.trim() }; }
  / "joined from" __ source:$[^#\n]+ { return { kind: "joined", source: source.trim() }; }
  / "email ends with" __ ends:$[^ \t\n#]+ { return { kind: "email", ends: ends.toLowerCase() }; }

// a fact's name in a want line: up to the number, "+" or "by"
WantName
  = n:$((!(__ Num) !(__ "+") !(__ "by" __) [^#\n])+) { return n.trim(); }

Date
  = $([0-9][0-9][0-9][0-9] "-" [0-9][0-9] "-" [0-9][0-9])

// ---- shared ----

// the spec a part is written in: read and set aside
Spec
  = _ "spec" __ version:Num _ Comment? !. { return { kind: "spec", version }; }

// `cycle: weekly` (the earlier word) or `cycle weekly` (spec 1)
CycleGap
  = _ ":" _
  / __

Blank
  = _ Comment? !. { return { kind: "blank" }; }

Name
  = n:$(!Arrow [^\u2192:\[\]+(),#\n])+ { return n.trim(); }

Num
  = n:$([0-9]+ ("," [0-9][0-9][0-9])* ("." [0-9]+)?) { return Number(n.replace(/,/g, "")); }

Arrow
  = "\u2192" / "->"

Rest
  = r:$[^#\n]+ { return r.trim(); }

Comment
  = "#" [^\n]*

_  = [ \t]*
__ = [ \t]+
