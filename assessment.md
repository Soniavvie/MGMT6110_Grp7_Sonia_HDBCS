# assessment.md

MGMT6110 Week 03, Problem Set 2
Comparable Sales Evaluator — HDB resale comparable sales

---

## Q1. Where did the agent make me faster, and by how much?

I should say up front that I do not really code. So for me this question is not about
being faster. Without the agent there is no product at all. I would have spent the
weekend reading tutorials and still had nothing on a screen by Sunday night.

The clearest example is the part that connects my page to the government data. I sent
one prompt with my existing project attached and got back two working files, plus the
four sentences the screen shows in different situations, plus the price calculation,
plus the licence credit in the footer. That took a few minutes. I could not have
produced any of it on my own, not slowly, not at all.

So on the question of what kind of task it was, mine is entirely the second kind. The
agent did not speed up work I already knew how to do. It did work I cannot do.

What I could do was decide what it should do. I wrote the sentence about who the
product is for. I decided the app is for a buyer standing in a flat about to talk to
an agent, and that decision is why the error messages sound like advice instead of
warnings. I spent the time I got back on that, and on thinking about what the screen
should say when things go wrong, which turned out to matter more than I expected.

Where it was faster by hand: Vercel. Putting in the environment variable and pressing
Redeploy are four clicks each, in a tab I already had open. I had tried getting help
with a variable by conversation earlier in the week and it took three exchanges of
back and forth. This time I just did it myself and it took twenty seconds. Clicking a
button is not a thing worth describing to an agent.

---

## Q2. Where did it cost me time, and whose fault was that?

The worst one was the 404, and it was my fault, not the agent's.

I deployed, opened the app, and got a red box saying the registry declined the
lookup. I had done everything right as far as I could tell. Variable saved as a
Secret, correct name, redeployed, waited for Ready. Still broken.

What I had actually done was paste the entire URL from the brief into
`HDB_RESOURCE_ID`. The variable wants only the resource ID — the part after
`resource_id=`, starting with `d_`, stopping before the `&`. I gave it the whole
thing. So my function built a request with a URL sitting where an ID should be,
data.gov.sg looked for a resource with that name, found nothing, and returned 404.

The agent was not wrong. Nothing it produced was wrong. I just put the wrong thing in
the box.

There is a second, smaller one that fits the pattern the question describes better.
My first prompt of the weekend was asking what users and products the dataset could
support. That is me asking before I had decided anything. I got a list of options
back, which was useful, but I could not have used any of it until I sat down and
wrote one sentence about who the product is for. The list did not decide it. I did,
afterwards. If I had written the sentence first, the prompt would have been shorter
and the answer would have been narrower and better.

Different remedies, like the question says. The 404 is fixed by being careful with a
copy and paste. The other one is fixed by deciding before asking, and that one is
about me rather than the tool.

---

## Q3. Did it ever hand me something that looked right and was not?

Yes, twice, and I only really caught one of them.

The first was in my own prompt. The prompt has a rules section that says never write
the ID value into any file. Then further down it has an example of what the data
looks like, and that example had the ID sitting right there in it. The prompt broke
its own rule, in the same message.

I noticed that and asked for a version written as if I had never shared the value at
all. But I only noticed one copy. The same value was actually in there three times —
twice more inside a part of the example I skimmed past because it looked like
technical filler. I only found out when the new version came back with three things
blanked out instead of one. So I found it by accident, not by checking.

That is the part I keep thinking about. I read the whole thing. It looked fine. I was
looking for the obvious place and did not know there was a second place to look.

The second one is bigger. When the agent finished building, it sent me a long summary
saying what it had done. It had checked this, guarded against that, set the cache,
handled the empty case. I read it and believed it, because it sounds like a report
from someone who tested their work.

It is not a report. It is the agent describing what it meant to do, written by the
same thing that did it. Nobody checked anything.

I found out it happened to be true only because the app broke later. When it broke,
it broke properly — it showed a real sentence and the error code, instead of a blank
screen. So the claims held up. But I had already accepted them hours earlier, and if
they had been false I would not have found out until someone else did.

---

## Q4. What did I have to know in order to supervise it?

Since I cannot read the code, the things I knew were not technical ones.

The first was that a link and an ID are not the same thing. When my app broke, the
problem was that I had pasted the whole long web address from the brief into the box
that only wanted the short code inside it. Both are long strings of characters and
both look equally sensible sitting in a box. Knowing they are different is what fixed
it.

The second was the more useful one, and it is about my own product rather than about
code. I knew what the screen is supposed to say. My app is for a buyer standing in a
flat, so I know that "no sales found" and "the government database is down" have to
be two different messages, because they mean opposite things to that person. One says
this flat is unusual. The other says do not trust this screen right now. I did not
need to code to know that. I needed to know who is holding the phone.

Now the other direction, which is harder to write.

What would I have needed to know to catch the things I missed? Honestly: enough to
read the code myself. I checked the agent's work by reading the agent's summary of
the agent's work, and then by looking at the screen. Both of those only show me the
outside. The choice I missed in Q5 was not visible from either one. It was sitting in
the code, and I had no way to see it because I cannot read code.

There is a specific example. My app checks for a particular kind of hidden failure
where the data source says everything is fine but actually is not. That check is in
there because I was told this kind of service can fail that way. I have never seen it
happen and I have not confirmed it independently. It is probably right. But it is in
my product on somebody else's word, and I would not be able to tell if it were wrong.

So the honest answer is that my judgement covers the product and not the plumbing.
That is a real boundary, and it is also a real limit, and I would rather write it
down than pretend it is not there.

---

## Q5. Which decisions did I keep, and should I have kept more or fewer?

The ones that were actually mine:

- Who the product is for. A first-time buyer standing in a flat, checking an asking
  price before they talk to the agent.
- Which data to use. HDB resale flat prices from data.gov.sg.
- That the app should refuse to even try if its setting is missing, and say which
  setting, instead of failing in a confusing way.
- Blanking out the ID before sending the prompt anywhere.
- That there must be four different messages for four different situations, and that
  they are written for someone on a phone rather than for a developer.
- Storing the data for a day at a time, because the source only updates monthly.
- Only pulling the town and flat type someone asked for, instead of all 240,000 rows.
- Crediting data.gov.sg in the exact wording their licence asks for.

Should I have handed more over? Not really. The only thing I was holding onto that
slowed me down was the Vercel settings, and I let that go quickly once I saw clicking
was faster.

Should I have kept more? Yes. The four messages are the right example, exactly like
the question says.

I decided there would be four, and I decided who reads them. I did not write them.
The words on my screen are the words that came back, and I kept them because I liked
them. The empty one tells the buyer to ask the agent to justify the price using past
sales in that block, which is better than anything I would have come up with — it
gives them something to do instead of a dead end. But I did not decide it. It showed
up and I approved it without really treating it as a decision.

And there is one that never reached my list at all.

The number my whole app exists to produce — the one it compares the asking price
against — is the **median** of the recent sales it finds. I never chose that. I never
even thought about it. There were other options: the average, or the price per square
metre, or only comparing flats on similar floors. The agent picked median, which is a
reasonable choice for property prices, and I only found out it had picked anything by
reading the summary afterwards.

That is the most important thing in this answer. My product is one number on a screen
telling a buyer whether they are overpaying, and I did not pick how that number is
worked out. I did not even notice there was a choice being made.

---

## Q6. What does this mean for a team of thirty?

If thirty people worked the way I did this weekend, the thing that would break is not
the code, it is that nobody could see where anybody's boundary was — I could tell you
exactly which decisions in this build were mine, but only because I wrote them down
as they happened, and if I had reconstructed the list on Monday I would have claimed
the median. So I would require the prompt log in the pull request, reviewed alongside
the diff and not after it, on the grounds that the diff shows what was built and only
the prompt shows what was decided; I would put that review midweek rather than Friday,
because a boundary question found on Friday gets waved through. I would refuse to let
an agent settle two things: anything a user reads on screen, and any number that
becomes a claim we make — my median is exactly that, a statistic that turns into "this
flat is overpriced" in front of someone about to spend their savings. The honest
answer to how anybody would know if it had been settled anyway is that they would not,
which is why the rule has to be a required artefact rather than a principle. And the
thing we cannot currently check, at all, is the difference between a behaviour that
was verified and one that was merely asserted — my agent told me it had checked the
response status before reading the body, and that turned out to be true, but I only
learned it was true because the product broke in public four hours later, and I would
not sign my name to a process where that is the detection mechanism.

---

## Attribution

Contains information from HDB Resale Flat Prices accessed from data.gov.sg, made
available under the Singapore Open Data Licence version 1.0
(https://data.gov.sg/open-data-licence).
