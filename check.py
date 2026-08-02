#!/usr/bin/env python3
"""LAXEE front-end integrity check: imports, ids, tokens, syntax."""
import re, os, glob, sys

root = os.path.dirname(os.path.abspath(__file__))
problems, notes = [], []

# ---- 1. every JS import resolves to a real file ---------------------------
js_files = glob.glob(f"{root}/assets/js/*.js")
for f in js_files:
    src = open(f, encoding="utf-8").read()
    for m in re.finditer(r'from\s+["\'](\./[^"\']+)["\']', src):
        target = os.path.normpath(os.path.join(os.path.dirname(f), m.group(1)))
        if not os.path.exists(target):
            problems.append(f"{os.path.basename(f)}: imports {m.group(1)} which does not exist")

# ---- 2. named imports actually exported ------------------------------------
exports = {}
for f in js_files:
    src = open(f, encoding="utf-8").read()
    names = set()
    names |= set(re.findall(r"export\s+(?:async\s+)?function\s+([\w$]+)", src))
    names |= set(re.findall(r"export\s+const\s+([\w$]+)", src))
    names |= set(re.findall(r"export\s+class\s+([\w$]+)", src))
    for m in re.finditer(r"export\s*\{([^}]*)\}", src):
        names |= {n.strip().split(" as ")[-1].strip() for n in m.group(1).split(",") if n.strip()}
    exports[os.path.basename(f)] = names

for f in js_files:
    src = open(f, encoding="utf-8").read()
    for m in re.finditer(r'import\s*\{([^}]*)\}\s*from\s+["\']\./([\w.]+)["\']', src):
        wanted = {n.strip().split(" as ")[0].strip() for n in m.group(1).split(",") if n.strip()}
        have = exports.get(m.group(2), set())
        missing = wanted - have
        if missing:
            problems.append(f"{os.path.basename(f)}: imports {sorted(missing)} from {m.group(2)} — not exported")

# ---- 3. every getElementById / $('#x') target exists in some HTML ----------
html = "\n".join(open(f, encoding="utf-8").read() for f in glob.glob(f"{root}/*.html"))
js_all = "\n".join(open(f, encoding="utf-8").read() for f in js_files)
html_ids = set(re.findall(r'id="([\w-]+)"', html))
# ids created dynamically by chrome.js markup
html_ids |= set(re.findall(r'id="([\w-]+)"', js_all))

for m in re.finditer(r'\$\("#([\w-]+)"\)|getElementById\("([\w-]+)"\)', js_all):
    target = m.group(1) or m.group(2)
    if target not in html_ids:
        problems.append(f"JS looks for #{target} which no page defines")

# ---- 4. every CSS class used in HTML/JS is defined -------------------------
css = "\n".join(open(f, encoding="utf-8").read() for f in glob.glob(f"{root}/assets/css/*.css"))
defined = set(re.findall(r"\.([a-zA-Z][\w-]*)", css))
used = set(re.findall(r'class="([^"]+)"', html + js_all))
used = {c for group in used for c in group.split() if not c.startswith("${")}
undefined = sorted(c for c in used if c not in defined)
if undefined:
    notes.append(f"classes used but not styled: {', '.join(undefined[:12])}")

# ---- 5. every CSS var referenced is declared ------------------------------
declared = set(re.findall(r"(--[\w-]+)\s*:", css))
referenced = set(re.findall(r"var\((--[\w-]+)", css + html + js_all))
missing_vars = sorted(referenced - declared)
if missing_vars:
    problems.append(f"CSS vars used but never declared: {', '.join(missing_vars)}")

# ---- 6. balanced tags in HTML ---------------------------------------------
for f in glob.glob(f"{root}/*.html"):
    src = open(f, encoding="utf-8").read()
    for tag in ["html", "head", "body", "main", "section", "div", "a", "span"]:
        o = len(re.findall(rf"<{tag}[\s>]", src))
        c = len(re.findall(rf"</{tag}>", src))
        if o != c:
            problems.append(f"{os.path.basename(f)}: <{tag}> {o} open / {c} close")

# ---- 7. no localStorage outside the guarded wrapper ------------------------
for f in js_files:
    if os.path.basename(f) == "api.js":
        continue
    src = open(f, encoding="utf-8").read()
    if re.search(r"\blocalStorage\b", src):
        problems.append(f"{os.path.basename(f)}: uses localStorage directly; use `store` from api.js")

# ---- 8. no emoji -----------------------------------------------------------
if re.search(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]", html + js_all + css):
    problems.append("emoji found — the brand uses SVG only")

print("=" * 68)
print("LAXEE FRONT-END CHECK")
print("=" * 68)
print(f"html pages: {len(glob.glob(f'{root}/*.html'))}   "
      f"js modules: {len(js_files)}   css files: {len(glob.glob(f'{root}/assets/css/*.css'))}")
print(f"css classes defined: {len(defined)}   css tokens: {len(declared)}")
print("-" * 68)
for n in notes:
    print(f"  note  {n}")
if problems:
    for p in problems:
        print(f"  FAIL  {p}")
    print(f"\nRESULT: FAILED — {len(problems)} problem(s)")
    sys.exit(1)
print("RESULT: PASSED")
