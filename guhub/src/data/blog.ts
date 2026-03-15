export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string; // markdown
}

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-detelltization",
    title: "AI de-telltization: why removing AI tells is the foundational lever",
    date: "2026-03-10",
    tags: ["ai", "nlp", "earthborn"],
    excerpt: "The hypothesis: the single biggest reason AI chatbots feel fake isn't hallucination or sycophancy per se — it's the detectable linguistic signature they leave on every response. Hedging, hollow affirmations, bullet-point addiction. Fix that first.",
    body: `## The problem nobody is naming correctly

Everyone talks about AI alignment, hallucination, sycophancy. Nobody talks about the *tell*.

A tell in poker is an involuntary behavior that gives away your hand. AI systems have tells everywhere — and once you see them, you can't unsee them. The hollow "Great question!", the mandatory hedge before any factual claim, the obsessive five-bullet structure on a question that deserved a sentence.

The tells aren't random. They're *trained in*. RLHF optimizes for human approval ratings, and humans giving approval ratings on single turns reward a specific pattern: thorough-sounding, cautious, organized. What emerges is a system that *performs* helpfulness rather than *being* helpful.

## What earthborn is trying to do

I've been parsing ~190k iMessages from my own chat history as a naturalistic baseline for what human conversation actually looks like. The \`TellDetector\` class scores text for AI markers across several dimensions: hedging density, affirmation rate, structural monotony, lexical flags ("certainly", "absolutely", "I'd be happy to").

The goal isn't to make AI sound more casual. It's to make it sound like it has a *position* — like it's actually there, thinking, rather than generating the most approval-maximizing string.

## Early results

The tell detector reliably flags AI text at >90% precision on out-of-sample GPT-4 outputs. Human texts from the corpus score near zero on all axes. The gap is stark.

What's interesting is that even *good* AI responses — ones that are actually useful — often score high on the tell meter. Usefulness and tell-freeness are orthogonal. That's the crux of it.

More soon.`
  }
];
