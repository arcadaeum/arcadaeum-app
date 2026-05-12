from app.services import moderation


def test_contains_blocked_term_matches_words_and_phrases(monkeypatch):
    monkeypatch.setenv("MODERATION_BLOCKLIST", "badword, bad phrase")
    moderation.get_blocked_terms.cache_clear()

    assert moderation.contains_blocked_term("That is a badword.")
    assert moderation.contains_blocked_term("That is a bad-phrase.")
    assert not moderation.contains_blocked_term("This is badge text.")

    moderation.get_blocked_terms.cache_clear()
