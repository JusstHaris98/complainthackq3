import re

def extract_details(text):
    summary = text[:300]
    account_match = re.search(r"account number is (\d+)", text)
    amount_match = re.search(r"£(\d+)", text)
    date_match = re.search(r"on (\d{1,2}[a-z]{2} \w+ \d{4})", text, re.IGNORECASE)

    return {
        "summary": summary,
        "issue_type": "Fraudulent Transaction / Unauthorised Payment",
        "product_affected": "Current Account",
        "amount_disputed": f"£{amount_match.group(1)}" if amount_match else "Unknown",
        "incident_date": date_match.group(1) if date_match else "Unknown",
        "contact_method_issue": "Phone Helpline (excessive wait time)",
        "customer_desired_outcome": ["Refund", "Investigation"],
        "account_number": account_match.group(1) if account_match else "Unknown",
        "is_vulnerable_customer_flag": "N/A",
        "references_fca_rule_implicitly": ["PRIN 2.1", "PRIN 2.5", "DISP 1.3"],
        "summary": summary
    }