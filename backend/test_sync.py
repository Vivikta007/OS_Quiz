"""Checks for what happens when several people act at once (fake database,
no network needed):

- two admins editing the same question (optimistic locking, migration 006)
- an admin editing a question while a player is mid-quiz

Run:  .\\venv\\Scripts\\python.exe test_sync.py
"""

from uuid import uuid4

from fastapi.testclient import TestClient

import main


class FakeUser:
    id = "user-1"
    app_metadata = {"role": "admin"}


class Result:
    def __init__(self, data):
        self.data = data


class FakeTable:
    """Just enough of the Supabase query builder: remembers the filters and
    applies them to an in-memory list of rows, like a single SQL statement."""

    def __init__(self, rows, inserted=None):
        self.rows = rows
        self.inserted = inserted if inserted is not None else []
        self.filters = {}
        self.action = "select"

    def table(self, name):
        return self

    def select(self, columns):
        return self

    def limit(self, n):
        return self

    def in_(self, column, values):
        self.filters[column] = ("in", values)
        return self

    def eq(self, column, value):
        self.filters[column] = ("eq", value)
        return self

    def update(self, changes):
        self.action, self.changes = "update", changes
        return self

    def insert(self, row):
        self.action, self.row = "insert", row
        return self

    def _matches(self, row):
        for column, (op, value) in self.filters.items():
            if op == "eq" and row.get(column) != value:
                return False
            if op == "in" and row.get(column) not in value:
                return False
        return True

    def execute(self):
        if self.action == "insert":
            saved = {"id": 99, "created_at": "now", **self.row}
            self.inserted.append(saved)
            return Result([saved])
        matching = [row for row in self.rows if self._matches(row)]
        if self.action == "update":
            # UPDATE ... WHERE <filters>: the trigger bumps the version
            for row in matching:
                row.update(self.changes)
                row["version"] += 1
            return Result([dict(row) for row in matching])
        return Result([dict(row) for row in matching])


client = TestClient(main.app)
main.app.dependency_overrides[main.get_current_user] = lambda: FakeUser()
main.app.dependency_overrides[main.get_access_token] = lambda: "token"


# --- Two admins, one question --------------------------------------------
def question_row():
    return {
        "id": 1, "question": "What is a process?", "options": ["A", "B", "C", "D"],
        "correct_index": 0, "topic": "Processes", "difficulty": "Easy",
        "status": "pending", "source": "ai", "explanation": None,
        "review_note": None, "created_at": "t", "reviewed_at": None, "version": 1,
    }

rows = [question_row()]
main.question_bank_client = lambda: FakeTable(rows)

# The version is required - an old app that doesn't send it can't overwrite
response = client.patch("/admin/questions/1", json={"status": "active"})
assert response.status_code == 422, response.text

# Admin A and Admin B both open version 1. A saves first: OK, now version 2.
response = client.patch("/admin/questions/1", json={"expected_version": 1, "correct_index": 2})
assert response.status_code == 200, response.text
assert response.json()["version"] == 2 and rows[0]["correct_index"] == 2

# B saves their (stale) edit of version 1: refused, A's fix survives
response = client.patch("/admin/questions/1", json={"expected_version": 1, "question": "What is a thread?"})
assert response.status_code == 409 and "Another admin" in response.json()["detail"]
assert rows[0]["question"] == "What is a process?" and rows[0]["correct_index"] == 2

# B reloads (gets version 2) and saves again: OK
response = client.patch("/admin/questions/1", json={"expected_version": 2, "status": "rejected"})
assert response.status_code == 200 and rows[0]["status"] == "rejected"
assert rows[0]["version"] == 3

# The race the read-check can't see: A's read says version 3, but B's
# write lands before A's write. The conditional UPDATE matches no row -> 409.
class RaceTable(FakeTable):
    def execute(self):
        if self.action == "update":
            rows[0]["version"] += 1  # B's save sneaks in right before ours
        return super().execute()

main.question_bank_client = lambda: RaceTable(rows)
response = client.patch("/admin/questions/1", json={"expected_version": 3, "status": "active"})
assert response.status_code == 409, response.text
assert rows[0]["status"] == "rejected"  # A did not overwrite B
print("two admins, one question: ok")


# --- Admin edits a question while a player is mid-quiz ---------------------
bank = [
    {"id": 1, "question": "Q1?", "options": ["Fork", "Exec", "Wait", "Kill"],
     "correct_index": 0, "explanation": None},
    # The admin rewrote a wrong option of Q2 after the quiz started
    {"id": 2, "question": "Q2?", "options": ["Paging", "Swapping", "Segmenting", "Thrashing!"],
     "correct_index": 1, "explanation": None},
]
inserted = []
main.question_bank_client = lambda: FakeTable(bank)
main.new_supabase_client = lambda token: FakeTable([], inserted)

def submit(answers):
    return client.post("/quiz-attempts", json={
        "client_attempt_id": str(uuid4()),
        "topics": ["Processes"],
        "difficulty": "Easy",
        "answers": answers,
    })

response = submit([
    {"question_id": 1, "options": ["Exec", "Fork", "Wait", "Kill"], "selected_answer": "Fork"},
    # The player saw the OLD options and picked the right answer
    {"question_id": 2, "options": ["Paging", "Swapping", "Segmenting", "Thrashing"],
     "selected_answer": "Swapping"},
    # Q3 was deleted from the database during the quiz
    {"question_id": 3, "options": ["W", "X", "Y", "Z"], "selected_answer": "W"},
])
assert response.status_code == 201, response.text  # not "Invalid answer data"
saved = inserted[-1]
assert saved["score"] == 2 and saved["total_questions"] == 2
# Review shows Q2's current options (with the current correct one)
assert saved["answers"][1]["options"] == bank[1]["options"]

# Made-up options can't raise a score: only the real correct option counts
response = submit([
    {"question_id": 1, "options": ["I win", "B"], "selected_answer": "I win"},
])
assert response.status_code == 201 and inserted[-1]["score"] == 0

# A pick that isn't among the options sent is still rejected
assert submit([
    {"question_id": 1, "options": ["Fork", "Exec"], "selected_answer": "Wait"},
]).status_code == 422

# Every question deleted mid-quiz: a clear message instead of an empty attempt
assert submit([
    {"question_id": 7, "options": ["A", "B"], "selected_answer": "A"},
]).status_code == 422
print("question edited mid-quiz: ok")

main.app.dependency_overrides.clear()
print("\nAll checks passed.")
