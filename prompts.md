# prompts.md

MGMT6110 Week 03, Problem Set 2
Comparable Sales Evaluator — HDB resale comparable sales

---

## 1. Deciding what the product was

> "A [user] opens this screen to [one job], and knows it worked when [what they
> see]." construct this one sentence to talk about my product, i want my product to
> be for the buyer

Came back with: "A first-time buyer standing in a flat they're considering opens this
screen to find out whether the asking price is fair, and knows it worked when they
see that price placed against recent sales of comparable flats, with a one-line
verdict they can say out loud to the agent."

Action: kept it unchanged. Used it as the first line of every prompt after this, and
it is why the four state sentences are written for someone on a phone rather than for
a developer reading a console.

---

## 2. Filling the master prompt

> fill this master prompt according to my product "A first-time buyer standing in a
> flat they're considering opens this screen to find out whether the asking price is
> fair, and knows it worked when they see that price placed against recent sales of
> comparable flats, with a one-line verdict they can say out loud to the agent."

Came back with: a filled version of the template, plus a flag I had not thought
about — data.gov.sg `datastore_search` has no API key at all. The template's
`[VARIABLE_NAME]`, the 503 guard and `keyConfigured` had nothing to point at. The
suggestion was to make the required variable `HDB_RESOURCE_ID` rather than invent a
dummy credential, so the guard still fails for a real reason.

Action: kept the adaptation. Did not send this version.

---

## 3. The version I did not send

> take it as i have never sent you the api key, you don't know the api key

Came back with: the same prompt, redacted. The version in section 2 had pasted the
resource ID into the CONTEXT block three times — once as the `resource_id` field and
twice more inside `_links`, where it sits in a query string — while its own GUARDRAILS
section said never write the value into any file or comment.

Action: sent the redacted version instead. This is the one that went to AI Studio.

---

## 4. The prompt I actually sent to AI Studio

Sent once, with the existing project code attached.

```
ROLE: You are a senior full-stack developer working in my existing project. Do not
rewrite what is already there; add to it.

GOAL: My screen currently shows the comparable-sales verdict ("This flat is priced
$32,000 above recent comparable sales") as a hard-coded value. Replace it with real
data from the data.gov.sg HDB Resale Flat Prices datastore, fetched through a
serverless function of my own.
 1) api/comparables.js — calls
    https://data.gov.sg/api/action/datastore_search
    with resource_id, a filters object, and a limit. Read the resource_id from the
    environment variable; never hard-code it. It accepts town, flatType and
    (optionally) streetName as query parameters from my screen, uppercases them
    before building the filters object because the upstream matches exactly and
    case-sensitively, and URL-encodes the filters JSON. It returns only the fields my
    screen needs — month, town, flat_type, block, street_name, storey_range,
    floor_area_sqm, remaining_lease, resale_price — and nothing else. Every field
    except resale_price arrives as a text string, so parse floor_area_sqm and
    resale_price to numbers before returning them. Also return the count of matched
    records.
 2) api/health.js — reports whether the configuration is present (keyConfigured) and
    whether the upstream answered, including the HTTP status it returned. It must
    never print the configuration value or any part of it.
 3) On the screen, replace the hard-coded verdict with the live one, and decide what
    the user sees in each of these four cases: the data is loading, the data is empty
    (no comparable sales matched this town and flat type), the upstream refused, and
    the upstream is unreachable. I want four different sentences, not one spinner.
    Remember who is reading them: someone standing in a flat, on a phone, about to
    talk to an agent.

OUTPUT: Both functions at api/ in the PROJECT ROOT, siblings of package.json, never
 inside src/. If this project has a server entry file, register the same two routes
 there too, because that is the shape the preview can answer. If it has no server
 file, skip that and tell me so rather than inventing one.
 Make sure package.json contains "type": "module".
 BEFORE the fetch, if HDB_RESOURCE_ID is missing or empty, return 503 with a message
 naming the variable, and do not call the upstream at all. A missing variable is sent
 as the word "undefined" and looks exactly like a wrong value, so stop it early.
 AFTER the fetch, check response.ok before reading the body. A refusal often has an
 empty body, so calling .json() on it throws and my function dies with a 500 instead
 of telling me what happened. On a non-2xx reply, return the upstream status and a
 one-line reason in your own JSON. Note also that this upstream can return HTTP 200
 with {"success": false} in the body, so check that flag as well and treat it as an
 upstream refusal.
 Cache the response for 24 hours with Cache-Control: s-maxage=86400,
 stale-while-revalidate=172800, matching how often the source actually changes.
 In the footer, credit the source in the exact form the provider's licence asks for:
 "Contains information from HDB Resale Flat Prices accessed from data.gov.sg, made
 available under the Singapore Open Data Licence version 1.0
 (https://data.gov.sg/open-data-licence)."

GUARDRAILS: Never write the configuration value into any file, comment or README.
 Never create a variable whose name starts with VITE_. Never call the upstream from
 browser code; every call happens inside api/. Never print the configuration value,
 or any part of it, in a response or a log. No new npm packages. No database, no
 login. Leave every screen I already have working exactly as it is.
 Do not fetch the full dataset — it is roughly 240,000 rows. Always filter by town
 and flat type, and cap limit at 2000.

CONTEXT: Deployed on Vercel from GitHub. The resource ID lives only in a Vercel
 environment variable named HDB_RESOURCE_ID. I have redacted it from the sample
 below; read it from the environment at runtime. A real response from the endpoint,
 called by hand just now, looks like this:

[real response, 15 lines, resource_id and _links redacted]
```

Came back with: both functions at `api/` in the project root, the four state
sentences, a median-based verdict with transaction breakdown cards, the licence line
in the footer, and `HDB_RESOURCE_ID=""` in `.env.example` with no value committed. It
also reported that the project has no server entry file and said so rather than
creating one, which is the only part of the reply I could not have checked by looking
at the screen.

Action: kept it. Did not need a second prompt.

---

## 5. The 404

Deployed, opened the app, got a red box across the top: `Upstream error (404):
Resource not found`. I had just done everything correctly — variable saved as a
Secret, redeployed, waited for Ready — and the screen still said the registry had
declined the lookup.

Sent a screenshot and:

> so what should i do now? give me step by step with easier wordings so i understand
> better

Came back with: seven steps, and the point that the error code itself narrowed the
problem. My own 503 guard fires *before* the fetch when `HDB_RESOURCE_ID` is missing
or empty. It had not fired. So the variable was present and had reached my function,
and the value inside it was wrong.

What was actually wrong: I had pasted the entire URL from the brief into
`HDB_RESOURCE_ID`. The variable does not want the URL, it wants only the resource ID
— the part after `resource_id=`, starting with `d_`, stopping before the `&`. My
function was building a request with a whole URL sitting where an ID should be, so
data.gov.sg looked for a resource by that name, found nothing, and said 404.

Action: re-copied just the ID, tested it in a browser on a plain `datastore_search`
call before saving anything, then overwrote the variable and redeployed.

Lesson: the 503 guard did the work here without ever running. Because "missing" and
"wrong" produce different codes, a 404 could only mean one thing, and I did not have
to go looking through the function to find out which.

---

## 6. Where I stopped prompting

Setting the Vercel environment variable, and redeploying afterwards, are four clicks
each in a dashboard that was already open in a tab. Describing either one to an agent
would have taken longer than doing it. Earlier in the week I had tried the
conversational route for a variable and it took three exchanges, so this time I did
not ask.

I did keep prompting for diagnosis, as section 5 shows, and that was the right call —
I could see the error but not what it ruled out.

---

## 7. What the agent told me that turned out to be wrong

**The prompt that broke its own guardrail.** The first filled version (section 2) had
the resource ID pasted into the CONTEXT block while the GUARDRAILS section forbade
writing it into any file. Found out by reading it before sending. The two copies
inside `_links` I did not spot at all — they only came up when I asked for a version
written as though the value had never been shared.

**The summary that read like a test report.** AI Studio's reply asserted that
`response.ok` is checked before the body is read, that a non-2xx reply returns the
upstream status and a one-line reason, and that the refusal state has its own
sentence. None of that is evidence, it is a claim. Found out that it was true by
breaking the product on purpose: the 404 produced the REGISTRY REFUSAL panel with the
status shown, rather than a 500 or a blank screen.

**What no agent got wrong.** The 404 in section 5 was mine. The brief gave me a
working URL and I pasted too much of it.

---

## Attribution

Contains information from HDB Resale Flat Prices accessed from data.gov.sg, made
available under the Singapore Open Data Licence version 1.0
(https://data.gov.sg/open-data-licence).
