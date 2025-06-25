from services.extraction_service import extract_details
from services.categorization_service import categorize_complaint
from services.fca_mapping import flag_fca_rules
from agents.mock_athena_agent import mock_athena_response

def process_complaint(text: str):
    details = extract_details(text)
    categories = categorize_complaint(details)
    fca_flags = flag_fca_rules(details)
    athena_data = mock_athena_response()

    return {
        "complaint_id": "AUTO_GEN_COMPLAINT_001",
        "status": "Awaiting Review",
        "customer_id": details.get("account_number", "UNKNOWN"),
        "summary": details["summary"],
        "extracted_details": details,
        "athena_query_parameters": {
            "question": "fraudulent transaction handling protocol and initial steps",
            "product_type": details.get("product_affected", "Unknown")
        },
        "categorization": categories,
        "regulatory_flag": fca_flags,
        "proposed_action_plan": athena_data["action_plan"],
        "confidence_score": 0.95
    }