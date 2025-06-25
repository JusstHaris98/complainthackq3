from agents.complaint_agent import process_complaint

def test_process_complaint():
    sample_text = "I am writing to complain about a fraudulent transaction on my current account. On 15th June 2025, a payment of £500 was made to 'Unknown Online Store' which I did not authorise. My account number is 12345678."
    response = process_complaint(sample_text)
    assert response["status"] == "Awaiting Review"
    assert response["extracted_details"]["account_number"] == "12345678"