import pytest
from app.database.queries.bugs import create_bug_report
from tests.test_helpers import MockConnection, MockCursor


def test_create_bug_report_success(monkeypatch):
    cursor = MockCursor(fetchone_result=(42,))
    conn = MockConnection(cursor)
    monkeypatch.setattr("app.database.queries.bugs.get_database_connection", lambda: conn)

    result = create_bug_report(user_id=10, title="Test bug", description="It crashes")
    assert result == 42
    assert conn.committed is True
    sql, params = cursor.executed[0]
    assert "INSERT INTO bug_reports" in sql
    assert params == (10, "Test bug", "It crashes")


def test_create_bug_report_failure(monkeypatch):
    cursor = MockCursor(fetchone_result=None)
    conn = MockConnection(cursor)
    monkeypatch.setattr("app.database.queries.bugs.get_database_connection", lambda: conn)

    with pytest.raises(RuntimeError, match="Failed to submit bug report"):
        create_bug_report(user_id=10, title="Fail", description="No return")
