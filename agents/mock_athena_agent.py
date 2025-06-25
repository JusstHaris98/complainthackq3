def mock_athena_response():
    return {
        "action_plan": {
            "requires_human_approval": True,
            "steps": [
                {
                    "step_number": 1,
                    "description": "Acknowledge receipt of the complaint within 3 business days (FCA DISP 1.4.1 R).",
                    "responsible_party": "Complaint Handler",
                    "details_from_athena": "DISP 1.4.1 R requirements for initial acknowledgement."
                },
                {
                    "step_number": 2,
                    "description": "Initiate investigation into the unauthorized transaction within 15 business days (PSR).",
                    "responsible_party": "Fraud Investigation Team",
                    "details_from_athena": "Fraudulent transaction investigation protocol."
                }
            ]
        }
    }