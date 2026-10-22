"""Quick checks for adaptive.py with made-up data (no database needed).

Run:  .\\venv\\Scripts\\python.exe test_adaptive.py
"""

import random
from collections import Counter

from adaptive import answer_history, pick_adaptive, skill_level

# A fake question bank: 2 topics x 3 difficulties x 10 questions
pool = []
next_id = 1
for topic in ("Weak topic", "Strong topic"):
    for level in ("Easy", "Medium", "Hard"):
        for _ in range(10):
            pool.append({
                "id": next_id,
                "question": f"Q{next_id}",
                "topic": topic,
                "difficulty": level,
            })
            next_id += 1

weak_ids = [q["id"] for q in pool if q["topic"] == "Weak topic"]
strong_ids = [q["id"] for q in pool if q["topic"] == "Strong topic"]


def answer(question_id, correct):
    return {
        "question_id": question_id,
        "selectedAnswer": "A" if correct else "B",
        "correctAnswer": "A",
    }


# History: 2/10 right on the weak topic, 10/10 right on the strong topic
attempts = [{
    "answers": [answer(qid, i < 2) for i, qid in enumerate(weak_ids[:10])]
    + [answer(qid, True) for qid in strong_ids[:10]],
}]

results = []


def check(name, passed):
    results.append(passed)
    print(("PASS  " if passed else "FAIL  ") + name)


topic_stats, last_result = answer_history(attempts, pool)
check("Weak topic is 'learning'", skill_level(**topic_stats["Weak topic"]) == "learning")
check("Strong topic is 'strong'", skill_level(**topic_stats["Strong topic"]) == "strong")
check("No history means 'new'", skill_level(0, 0) == "new")

# Run many quizzes and look at the averages
topic_counts = Counter()
level_counts = {"Weak topic": Counter(), "Strong topic": Counter()}
wrong_before = set(weak_ids[2:10])
wrong_before_hits = 0
rng = random.Random(42)

for _ in range(500):
    quiz = pick_adaptive(pool, attempts, 10, rng)
    assert len(quiz) == 10 and len({q["id"] for q in quiz}) == 10
    for q in quiz:
        topic_counts[q["topic"]] += 1
        level_counts[q["topic"]][q["difficulty"]] += 1
        wrong_before_hits += q["id"] in wrong_before

check("Quizzes have 10 unique questions", True)
check(
    f"Weak topic picked more often ({topic_counts['Weak topic']} vs {topic_counts['Strong topic']})",
    topic_counts["Weak topic"] > topic_counts["Strong topic"] * 2,
)
weak = level_counts["Weak topic"]
strong = level_counts["Strong topic"]
check(f"Weak topic mostly Easy ({dict(weak)})", weak["Easy"] > weak["Hard"] * 3)
check(f"Strong topic mostly Hard ({dict(strong)})", strong["Hard"] > strong["Easy"] * 3)
check(
    "Questions answered wrong before come up often",
    wrong_before_hits / 500 > 1.5,
)

# Asking for more than exists returns everything, no duplicates
everything = pick_adaptive(pool, attempts, 999, rng)
check("Never more questions than the pool", len(everything) == len(pool))

# A brand-new user still gets a full quiz
check("New user gets a full quiz", len(pick_adaptive(pool, [], 10, rng)) == 10)

print(f"\n{sum(results)}/{len(results)} checks passed")
