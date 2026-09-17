from ruko.extract import (
    extract_all,
    extract_amounts,
    extract_phone_numbers,
    extract_transaction_ids,
    extract_upi_ids,
    extract_urls,
    registrable_domain,
)


class TestRegistrableDomain:
    def test_two_label_domain_is_itself(self):
        assert registrable_domain("example.com") == "example.com"

    def test_strips_subdomains(self):
        assert registrable_domain("login.secure.example.com") == "example.com"

    def test_keeps_indian_two_level_suffix(self):
        assert registrable_domain("sbi.co.in") == "sbi.co.in"
        assert registrable_domain("net.banking.sbi.co.in") == "sbi.co.in"

    def test_keeps_gov_in(self):
        assert registrable_domain("myaadhaar.uidai.gov.in") == "uidai.gov.in"


class TestUrls:
    def test_finds_bare_domain_and_full_url(self):
        urls, domains = extract_urls("Update at http://sbi-kyc-verify.in/login now")
        assert "sbi-kyc-verify.in" in domains
        assert any("sbi-kyc-verify.in" in u for u in urls)

    def test_finds_domain_without_scheme(self):
        _, domains = extract_urls("go to paytm-refund.xyz today")
        assert domains == ["paytm-refund.xyz"]

    def test_ignores_sentence_full_stops(self):
        """'expired.Your' must not be read as a domain called .your"""
        _, domains = extract_urls("Your KYC has expired.Your account will close.")
        assert domains == []

    def test_does_not_treat_email_as_link(self):
        _, domains = extract_urls("write to help@example.com for more")
        assert "example.com" not in domains

    def test_finds_raw_ip_url(self):
        urls, _ = extract_urls("open http://192.168.10.55/pay")
        assert any("192.168.10.55" in u for u in urls)

    def test_ignores_invalid_ip(self):
        urls, _ = extract_urls("version 999.999.999.999 released")
        assert urls == []


class TestUpi:
    def test_finds_upi_id(self):
        assert extract_upi_ids("pay to rahul.sharma@okaxis now") == ["rahul.sharma@okaxis"]

    def test_email_is_not_a_upi_id(self):
        assert extract_upi_ids("mail me at rahul@gmail.com") == []

    def test_multiple_ids_deduplicated(self):
        found = extract_upi_ids("send to ramesh@ybl or ramesh@ybl or shop42@paytm")
        assert found == ["ramesh@ybl", "shop42@paytm"]


class TestPhones:
    def test_plain_ten_digit(self):
        assert extract_phone_numbers("call 9876543210") == ["9876543210"]

    def test_country_code_normalised(self):
        assert extract_phone_numbers("call +91 9876543210") == ["9876543210"]

    def test_trunk_zero_normalised(self):
        assert extract_phone_numbers("call 09876543210") == ["9876543210"]

    def test_landline_style_not_matched(self):
        """Indian mobiles start 6-9; 1930 and 5-prefixed numbers must not match."""
        assert extract_phone_numbers("helpline 1930") == []
        assert extract_phone_numbers("call 5876543210") == []

    def test_does_not_grab_part_of_longer_number(self):
        assert extract_phone_numbers("txn 123456789012345") == []


class TestAmounts:
    def test_rupee_symbol(self):
        assert extract_amounts("pay ₹4,999 now") == ["₹4,999"]

    def test_rs_prefix(self):
        assert extract_amounts("refund of Rs 4999") == ["₹4999"]

    def test_lakh_unit_kept(self):
        assert extract_amounts("earn Rs 2 lakh monthly") == ["₹2 lakh"]


class TestTransactionIds:
    def test_labelled_utr(self):
        assert extract_transaction_ids("UTR: 402312345678") == ["402312345678"]

    def test_txn_id(self):
        assert extract_transaction_ids("txn id AB12CD34EF56") == ["AB12CD34EF56"]

    def test_pure_word_rejected(self):
        assert extract_transaction_ids("reference pending") == []


def test_extract_all_shape():
    got = extract_all("Pay ₹500 to scam@ybl or call 9876543210, see kyc-sbi.xyz")
    assert got["amounts"] == ["₹500"]
    assert got["upi_ids"] == ["scam@ybl"]
    assert got["phone_numbers"] == ["9876543210"]
    assert got["domains"] == ["kyc-sbi.xyz"]
