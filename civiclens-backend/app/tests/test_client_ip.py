from types import SimpleNamespace
from app.core.enhanced_security import get_client_ip, create_session_fingerprint


def req(headers, host="172.70.1.1"):
    return SimpleNamespace(headers=headers, client=SimpleNamespace(host=host))


def test_prefers_cf_header_and_ignores_spoofable_xff():
    r = req({"cf-connecting-ip": "1.2.3.4", "x-forwarded-for": "6.6.6.6"})
    assert get_client_ip(r) == "1.2.3.4"


def test_falls_back_to_peer_not_xff():
    assert get_client_ip(req({"x-forwarded-for": "6.6.6.6"})) == "172.70.1.1"


def test_fingerprint_stable_across_cf_edges():
    h = {"cf-connecting-ip": "1.2.3.4", "user-agent": "ua"}
    assert create_session_fingerprint(req(h, "172.70.1.1")) == create_session_fingerprint(req(h, "172.68.9.9"))
