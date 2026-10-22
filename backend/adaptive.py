"""Adaptive quiz mode: choose questions based on the user's past results.

How it works:
1. Look through the user's past answers to find, for each topic, how many
   they got right, and for each question, whether they got it right last time.
2. Give each topic a skill level from its accuracy (see skill_level).
3. Topics the user is weaker at are picked more often (topic_weight).
4. Each topic's skill level decides the mix of Easy / Medium / Hard
   (DIFFICULTY_MIX) - harder questions where the user is strong.
5. Inside each topic + difficulty, questions answered wrong last time come
   first, then never-seen questions, then ones answered correctly.

These are plain functions with no database access, so they're easy to test.
"""

import random
from collections import defaultdict

LEVELS = ("Easy", "Medium", "Hard")

# Fewer answers than this and we don't judge the topic yet
MIN_ANSWERS = 3

# Share of Easy / Medium / Hard questions for each skill level
DIFFICULTY_MIX = {
    "new": {"Easy": 0.5, "Medium": 0.35, "Hard": 0.15},
    "learning": {"Easy": 0.6, "Medium": 0.3, "Hard": 0.1},  # under 50%
    "improving": {"Easy": 0.25, "Medium": 0.5, "Hard": 0.25},  # 50-79%
    "strong": {"Easy": 0.1, "Medium": 0.4, "Hard": 0.5},  # 80% and above
}

# Lower number = picked first
PRIORITY_WRONG_BEFORE = 0
PRIORITY_NEVER_SEEN = 1
PRIORITY_RIGHT_BEFORE = 2


def skill_level(correct: int, total: int) -> str:
    if total < MIN_ANSWERS:
        return "new"
    accuracy = correct / total
    if accuracy < 0.5:
        return "learning"
    if accuracy < 0.8:
        return "improving"
    return "strong"


def topic_weight(correct: int, total: int) -> float:
    """How often a topic is picked: 2.0 at 0% accuracy down to 0.5 at 100%."""
    if total < MIN_ANSWERS:
        return 1.5  # new topics get a fair share so we learn the user's level
    return 0.5 + 1.5 * (1 - correct / total)


def answer_history(attempts: list[dict], questions: list[dict]):
    """Work out per-topic results and each question's last result.

    attempts: saved quiz attempts (oldest first), each with an "answers" list.
    questions: question rows with at least id, question and topic.

    Returns (topic_stats, last_result):
      topic_stats = {topic: {"correct": n, "total": n}}
      last_result = {question_id: True/False}  (True = answered correctly)
    """
    by_id = {q["id"]: q for q in questions}
    by_text = {q["question"]: q for q in questions}

    topic_stats = defaultdict(lambda: {"correct": 0, "total": 0})
    last_result = {}

    for attempt in attempts:
        for answer in attempt.get("answers") or []:
            # Older attempts were saved before question IDs existed, so fall
            # back to matching the question text.
            question = by_id.get(answer.get("question_id")) or by_text.get(
                answer.get("question")
            )
            if question is None:
                continue

            correct = answer.get("selectedAnswer") == answer.get("correctAnswer")
            topic_stats[question["topic"]]["total"] += 1
            topic_stats[question["topic"]]["correct"] += int(correct)
            last_result[question["id"]] = correct  # later attempts overwrite

    return topic_stats, last_result


def pick_adaptive(
    pool: list[dict], attempts: list[dict], count: int, rng=random
) -> list[dict]:
    """Choose `count` questions from `pool` for this user."""
    topic_stats, last_result = answer_history(attempts, pool)

    def priority(question):
        result = last_result.get(question["id"])
        if result is None:
            return PRIORITY_NEVER_SEEN
        return PRIORITY_RIGHT_BEFORE if result else PRIORITY_WRONG_BEFORE

    # Group questions by (topic, difficulty), best candidates first.
    # Shuffling before the (stable) sort keeps ties in random order.
    buckets = defaultdict(list)
    for question in pool:
        buckets[(question["topic"], question["difficulty"])].append(question)
    for bucket in buckets.values():
        rng.shuffle(bucket)
        bucket.sort(key=priority)

    topics = sorted({question["topic"] for question in pool})
    stats = {topic: topic_stats[topic] for topic in topics}

    chosen = []
    while len(chosen) < count:
        # Topics that still have questions left
        open_topics = [
            topic for topic in topics
            if any(buckets[(topic, level)] for level in LEVELS)
        ]
        if not open_topics:
            break  # the pool ran out

        topic = rng.choices(
            open_topics,
            weights=[topic_weight(**stats[topic]) for topic in open_topics],
        )[0]

        mix = DIFFICULTY_MIX[skill_level(**stats[topic])]
        open_levels = [level for level in LEVELS if buckets[(topic, level)]]
        level = rng.choices(open_levels, weights=[mix[lv] for lv in open_levels])[0]

        chosen.append(buckets[(topic, level)].pop(0))

    rng.shuffle(chosen)
    return chosen
