"""Checks that two users can't see each other's quiz attempts.

Run with the backend running (in another terminal):
    .\\venv\\Scripts\\python.exe check_isolation.py

You'll be asked for two test accounts (A and B). Passwords are typed
privately and only sent to your own backend.
"""

import getpass
import json
import urllib.error
import urllib.request
import uuid

API = "http://127.0.0.1:8000"


def call(method, path, token=None, body=None):
    """Send a request; return (status_code, json_body)."""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(API + path, data, headers, method=method)

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)


def login(label):
    email = input(f"User {label} email: ").strip()
    password = getpass.getpass(f"User {label} password (hidden): ")
    status, data = call("POST", "/login", body={"email": email, "password": password})
    if status != 200:
        raise SystemExit(f"Login failed for user {label}: {data.get('detail')}")
    return data["access_token"]


def sample_attempt(token):
    """Start a real 1-question quiz from the database and answer it."""
    status, questions = call(
        "GET", "/quiz-questions?topics=OS%20Basics&difficulty=Easy&count=1", token
    )
    if status != 200:
        raise SystemExit(f"Could not load questions: {questions.get('detail')}")

    question = questions[0]
    return {
        "client_attempt_id": str(uuid.uuid4()),
        "topics": ["OS Basics"],
        "difficulty": "Easy",
        "answers": [{
            "question_id": question["id"],
            "options": question["options"],
            "selected_answer": question["options"][0],
        }],
    }, question


results = []


def check(name, passed):
    results.append(passed)
    print(("PASS  " if passed else "FAIL  ") + name)


token_a = login("A")
token_b = login("B")
print()

attempt, question = sample_attempt(token_a)
check("Questions are sent without the correct answer",
      "correct_index" not in question and "correctAnswer" not in question)

status, saved_a = call("POST", "/quiz-attempts", token_a, attempt)
check("A can save an attempt (server marks it)",
      status == 201 and saved_a.get("score") in (0, 1))

status, again = call("POST", "/quiz-attempts", token_a, attempt)
check("Re-sending the same attempt doesn't duplicate it",
      status == 201 and again.get("id") == saved_a.get("id"))

tampered, _ = sample_attempt(token_a)
tampered["answers"][0]["options"] = ["Made up", "Options"]
status, _ = call("POST", "/quiz-attempts", token_a, tampered)
check("Changed options are rejected (422)", status == 422)

attempt_b, _ = sample_attempt(token_b)
status, saved_b = call("POST", "/quiz-attempts", token_b, attempt_b)
check("B can save an attempt", status == 201)

_, list_a = call("GET", "/quiz-attempts", token_a)
_, list_b = call("GET", "/quiz-attempts", token_b)
ids_a = {item["id"] for item in list_a}
ids_b = {item["id"] for item in list_b}
check("A's history contains A's attempt", saved_a.get("id") in ids_a)
check("A's history does not contain B's attempt", saved_b.get("id") not in ids_a)
check("B's history does not contain A's attempt", saved_a.get("id") not in ids_b)

status, _ = call("GET", f"/quiz-attempts/{saved_b.get('id')}", token_a)
check("A gets 404 when requesting B's attempt by ID", status == 404)

status, _ = call("GET", "/quiz-attempts")
check("No token -> 401", status == 401)

status, _ = call("GET", "/quiz-attempts", "fake.token.value")
check("Fake token -> 401", status == 401)

print(f"\n{sum(results)}/{len(results)} checks passed")
print("Note: this created a few test attempts in both accounts.")
