from fastapi import FastAPI
from fastapi.testclient import TestClient


class MockCursor:
    def __init__(self, row=None, rows=None, description=None, fetchone_result=None):
        self._row = row
        self._rows = rows or []
        self.description = description
        # Support both single value and list of values for sequential calls
        if isinstance(fetchone_result, list):
            self._fetchone_results = list(fetchone_result)
        elif fetchone_result is not None:
            self._fetchone_results = [fetchone_result]
        else:
            self._fetchone_results = None
        self.executed: list[tuple[str, tuple | None]] = []

    def execute(self, query, params=None):
        self.executed.append((query, params))

    def fetchone(self):
        if self._fetchone_results is not None:
            if self._fetchone_results:
                return self._fetchone_results.pop(0)
            return None
        return self._row

    def fetchall(self):
        return self._rows

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class MockConnection:
    def __init__(self, cursor: MockCursor):
        self._cursor = cursor
        self.committed = False

    def cursor(self):
        return self._cursor

    def commit(self):
        self.committed = True

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def build_test_app(router) -> FastAPI:
    app = FastAPI()
    app.include_router(router)
    return app


def build_test_client(router) -> TestClient:
    return TestClient(build_test_app(router))
