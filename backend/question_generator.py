"""Write new quiz questions with Gemini, then double-check their answers.

Used only by the admin endpoints in main.py. Generated questions are saved
as 'pending' and an admin approves, edits or rejects each one before it can
appear in a quiz - the AI can be confidently wrong, so a human has the last
word on every answer key.
"""

import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv

from google import genai
from pydantic import BaseModel, Field, ValidationError

DEFAULT_MODEL = "gemini-3.8-flash"
OPTION_COUNT = 4

# Speed: Gemini's time grows with how much it writes and thinks, so a big
# request is split into parts of this size that run at the same time
# (15 questions take about as long as 5).
PART_SIZE = 5

# Speed: less thinking is much faster (5 Hard questions: ~220s at the
# default level, ~117s at medium, ~93s at low). Hard questions keep more
# thinking because they involve calculations the AI must get right.
THINKING_LEVEL = {"Easy": "low", "Medium": "low", "Hard": "medium"}


class GenerationError(Exception):
    """Gemini couldn't produce usable questions. The message is safe to show."""


class GeneratedQuestion(BaseModel):
    question: str = Field(description="The question text. One clear question.")
    options: list[str] = Field(
        description=f"Exactly {OPTION_COUNT} answer options. Exactly one is correct."
    )
    correct_index: int = Field(
        description="Position of the correct option in options (0 = first)."
    )
    explanation: str = Field(
        description="1-2 sentences explaining why the correct option is right."
    )


class GeneratedBatch(BaseModel):
    questions: list[GeneratedQuestion]


class CheckedAnswer(BaseModel):
    number: int = Field(description="The question's number from the list (1 = first).")
    answer_index: int = Field(description="Position of the option you chose (0 = first).")


class CheckedBatch(BaseModel):
    answers: list[CheckedAnswer]


WRITER_INSTRUCTIONS = f"""You write multiple-choice questions for an Operating Systems quiz app used by computer science students.

Rules for every question:
- Exactly {OPTION_COUNT} options, exactly one of them correct.
- Wrong options must be plausible to a student who hasn't mastered the topic, but clearly wrong to an expert.
- Never use "All of the above", "None of the above" or "Both A and B".
- Keep options similar in length and style, so the answer can't be guessed from its wording.
- Vary which position holds the correct option.
- Numerical questions (scheduling, paging, Banker's algorithm...) must have exactly one correct result - work it out carefully.
- Use standard textbook terminology (Silberschatz, Tanenbaum).

Difficulty guide:
- Easy: definitions and basic facts.
- Medium: understanding and comparing concepts, choosing the right technique.
- Hard: multi-step reasoning, calculations, tracing an algorithm, edge cases."""

CHECKER_INSTRUCTIONS = """You are an Operating Systems expert taking a quiz. For each numbered question, choose the single best option. Work through calculations carefully."""


def _client() -> genai.Client:
    # Re-read .env each time, so adding or changing the key (or the model)
    # works without restarting the backend - --reload only watches .py files.
    load_dotenv(Path(__file__).resolve().parent / ".env", override=True)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise GenerationError("GEMINI_API_KEY is missing from backend/.env")
    return genai.Client(api_key=api_key)


def _ask(
    client: genai.Client,
    instructions: str,
    prompt: str,
    schema: type[BaseModel],
    thinking: str = "medium",
):
    """One Gemini call that must return JSON matching `schema`."""
    try:
        interaction = client.interactions.create(
            # Read here, not at import time - main.py loads .env after imports
            model=os.getenv("GEMINI_MODEL") or DEFAULT_MODEL,
            system_instruction=instructions,
            input=prompt,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": schema.model_json_schema(),
            },
            store=False,  # one-off request - nothing to keep on Google's side
            generation_config={"thinking_level": thinking},
        )
    except Exception as error:
        # The Interactions API raises its own error classes (bad key, rate
        # limit, timeout, network...) and the SDK exports no public base
        # class for them, so catch everything from this one call. The real
        # error goes to the backend terminal; the app gets a clear message.
        print(f"Gemini error: {type(error).__name__}: {error}", flush=True)
        raise GenerationError(
            "The AI service is unavailable or rejected the request "
            "(check GEMINI_API_KEY). Try again shortly."
        ) from error

    try:
        return schema.model_validate_json(interaction.output_text or "")
    except ValidationError as error:
        print(f"Gemini returned unexpected JSON: {error}", flush=True)
        raise GenerationError("The AI returned an unexpected format. Try again.") from error


def problems_with(question: GeneratedQuestion) -> list[str]:
    """Rule checks the AI can't be trusted to follow on its own."""
    problems = []
    options = [option.strip() for option in question.options]

    if not question.question.strip():
        problems.append("empty question")
    if len(options) != OPTION_COUNT:
        problems.append(f"has {len(options)} options instead of {OPTION_COUNT}")
    if any(not option for option in options):
        problems.append("has an empty option")
    if len({option.lower() for option in options}) != len(options):
        problems.append("has duplicate options")
    if not 0 <= question.correct_index < len(options):
        problems.append("correct answer is out of range")
    return problems


def generate_questions(
    topic: str,
    difficulty: Literal["Easy", "Medium", "Hard"],
    count: int,
    existing_questions: list[str],
    guidance: str = "",
) -> tuple[list[dict], list[str]]:
    """Write `count` new questions and check each answer key.

    Returns (questions, skipped). Each question dict is ready to insert,
    with review_note set when the checker disagreed with the writer.
    `skipped` describes questions that failed the rule checks.
    """
    client = _client()
    sizes = [min(PART_SIZE, count - start) for start in range(0, count, PART_SIZE)]

    # Each part writes and checks its questions on its own thread
    with ThreadPoolExecutor(max_workers=len(sizes)) as pool:
        parts = list(pool.map(
            lambda numbered: _write_part(
                client, topic, difficulty, numbered[1], existing_questions,
                guidance, part=numbered[0], parts=len(sizes),
            ),
            enumerate(sizes, start=1),
        ))

    # Fail only if every part failed - otherwise keep what the others wrote
    errors = [part for part in parts if isinstance(part, GenerationError)]
    if len(errors) == len(parts):
        raise errors[0]

    questions, skipped = [], [f"One part of the request failed: {error}" for error in errors]
    seen = {text.strip().lower() for text in existing_questions}
    for part in parts:
        if isinstance(part, GenerationError):
            continue
        part_questions, part_skipped = part
        skipped.extend(part_skipped)
        for question in part_questions:
            # Parts run in parallel, so two of them can write the same question
            key = question["question"].lower()
            if key in seen:
                skipped.append(f"{question['question'][:80]}: duplicates another new question")
                continue
            seen.add(key)
            questions.append(question)

    return questions, skipped


def _write_part(
    client: genai.Client,
    topic: str,
    difficulty: str,
    count: int,
    existing_questions: list[str],
    guidance: str,
    part: int,
    parts: int,
) -> tuple[list[dict], list[str]] | GenerationError:
    """Write and check one part. Returns the error instead of raising it, so
    one failed part doesn't throw away the others."""
    thinking = THINKING_LEVEL[difficulty]

    # Sending existing questions stops Gemini from repeating them. Capped so
    # a big topic doesn't make the prompt huge.
    avoid = "\n".join(f"- {text}" for text in existing_questions[:150]) or "(none yet)"
    prompt = (
        f"Topic: {topic}\n"
        f"Difficulty: {difficulty}\n"
        f"Number of questions: {count}\n"
        + (f"Extra instructions from the admin: {guidance}\n" if guidance else "")
        + (
            f"This is part {part} of {parts}; the other parts are written at "
            "the same time without seeing yours, so pick less obvious areas "
            "of the topic to avoid overlapping them.\n"
            if parts > 1 else ""
        )
        + f"\nThese questions already exist - don't repeat them or ask the same thing:\n{avoid}"
    )

    try:
        batch = _ask(client, WRITER_INSTRUCTIONS, prompt, GeneratedBatch, thinking)
    except GenerationError as error:
        return error

    valid, skipped = [], []
    seen = {text.strip().lower() for text in existing_questions}
    for question in batch.questions[:count]:
        problems = problems_with(question)
        if question.question.strip().lower() in seen:
            problems.append("duplicates an existing question")
        if problems:
            skipped.append(f"{question.question.strip()[:80]}: {', '.join(problems)}")
            continue
        seen.add(question.question.strip().lower())
        valid.append(question)

    # Second opinion: a separate call answers the questions WITHOUT seeing
    # the answer key. Disagreements are flagged for the admin, not dropped -
    # sometimes the writer is right and the checker is wrong.
    checked: dict[int, int] = {}
    if valid:
        quiz = "\n\n".join(
            f"{number}. {question.question}\n"
            + "\n".join(f"   {i}: {option}" for i, option in enumerate(question.options))
            for number, question in enumerate(valid, start=1)
        )
        try:
            result = _ask(client, CHECKER_INSTRUCTIONS, quiz, CheckedBatch, thinking)
            checked = {answer.number: answer.answer_index for answer in result.answers}
        except GenerationError:
            # The questions are still worth reviewing without a second opinion
            checked = {}

    questions = []
    for number, question in enumerate(valid, start=1):
        options = [option.strip() for option in question.options]
        checker_pick = checked.get(number)

        if checker_pick is None:
            note = "Not double-checked - review the answer carefully."
        elif checker_pick != question.correct_index and 0 <= checker_pick < len(options):
            note = (
                f'AI checker chose "{options[checker_pick]}" instead - '
                "verify the correct answer."
            )
        else:
            note = None

        questions.append({
            "question": question.question.strip(),
            "options": options,
            "correct_index": question.correct_index,
            "explanation": question.explanation.strip() or None,
            "topic": topic,
            "difficulty": difficulty,
            "status": "pending",
            "source": "ai",
            "review_note": note,
        })

    return questions, skipped
