import ollama
import asyncio
import json

# Read the system prompt from the file
with open('prompt.txt', 'r') as f:
    SYSTEM_PROMPT = f.read()

# Read the Athena treatment guidelines
with open('treatment/athena_mock_treatment.txt', 'r') as f:
    ATHENA_TREATMENT = f.read()

async def process_complaint(text: str, send_log):
    await send_log({"type": "thought", "message": "Starting complaint processing with Ollama..."})
    await asyncio.sleep(1)

    try:
        await send_log({"type": "thought", "message": "Accessing Athena knowledge store for treatment guidelines..."})
        await asyncio.sleep(0.5)
        
        await send_log({"type": "thought", "message": "Connecting to Ollama and sending enhanced prompt with treatment context..."})
        
        # Get current date for incident date
        from datetime import datetime
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        # Create enhanced prompt with treatment guidelines
        enhanced_prompt = f"""You are a UK banking complaint analyst. Analyse the complaint and respond with VALID JSON only using British English.

REQUIRED JSON FORMAT - You MUST include ALL these fields:
{{
  "complaint_id": "AUTO_GEN_COMPLAINT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
  "status": "Awaiting Review",
  "customer_id": "CUST_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
  "summary": "Brief summary of the complaint in 1-2 sentences using British English",
  "extracted_details": {{
    "issue_type": "Type of issue (e.g., Unauthorised Transaction, Service Quality, Account Issue)",
    "product_affected": "Product or service affected (e.g., Current Account, Credit Card, Savings Account)",
    "amount_disputed": "Amount if applicable (e.g., £500.00 or N/A)",
    "incident_date": "{current_date}",
    "customer_desired_outcome": ["Full refund", "Investigation", "Compensation"]
  }},
  "categorisation": {{
    "primary_category": "Main category (e.g., Fraud, Service Quality, Account Management)",
    "secondary_category": "Secondary category (e.g., Contact Centre Issues, System Problems, Processing Delays)",
    "fca_complaint_type": "FCA classification (e.g., Payment Services - Unauthorised Payment)"
  }},
  "proposed_action_plan": {{
    "requires_human_approval": true,
    "steps": [
      {{
        "step_number": 1,
        "description": "Acknowledge receipt of complaint within 3 business days as per FCA DISP 1.4.1 R. Send empathetic response confirming we understand the customer's frustration and provide complaint reference number. Explain next steps and expected timeline for resolution.",
        "responsible_party": "Complaint Handler",
        "details_from_athena": "FCA DISP 1.4.1 R requirements for complaint acknowledgement and customer communication standards"
      }},
      {{
        "step_number": 2,
        "description": "Conduct comprehensive investigation including account transaction review, system audit checks, and verification of customer identity. Examine all relevant records from incident date through to complaint submission. Document findings thoroughly for regulatory compliance.",
        "responsible_party": "Fraud Investigation Team",
        "details_from_athena": "UK banking fraud investigation protocols and Payment Services Regulations requirements"
      }},
      {{
        "step_number": 3,
        "description": "Prepare detailed response letter outlining investigation findings, any compensation due, and preventative measures implemented. Ensure response meets FCA TCF principles and includes clear explanation of next steps if customer remains unsatisfied.",
        "responsible_party": "Complaint Handler", 
        "details_from_athena": "FCA DISP final response requirements and Treating Customers Fairly obligations"
      }}
    ]
  }},
  "confidence_score": 0.85
}}

CRITICAL RULES:
1. Respond with ONLY valid JSON - no other text
2. ALL fields must be present and NOT null
3. Use British English spelling (e.g., "categorisation", "realise", "centre")
4. responsible_party must NEVER be null - use appropriate role names like:
   - "Complaint Handler"
   - "Fraud Investigation Team" 
   - "Customer Service Manager"
   - "Operations Team"
   - "Compliance Officer"
5. Always use current date {current_date} for incident_date
6. secondary_category must be provided and relevant
7. Base action plans on UK banking regulations

ACTION PLAN REQUIREMENTS:
- Each step description must be detailed and specific (minimum 25 words)
- Include specific timescales (e.g., "within 3 business days", "within 15 business days")
- Reference relevant regulations (e.g., "FCA DISP 1.4.1 R", "Payment Services Regulations")
- Be specific about what actions will be taken (not generic descriptions)
- Tailor actions to the specific complaint content provided
- Include customer communication requirements
- Specify investigation procedures relevant to the complaint type
- Mention compliance and documentation requirements

COMPLAINT TEXT TO ANALYSE:
{text}

RESPOND WITH VALID JSON ONLY:"""
        
        response = ollama.chat(
            model='llama3.2:1b', # IMPORTANT: Change this to your model name
            messages=[
                {'role': 'system', 'content': enhanced_prompt},
                {'role': 'user', 'content': text},
            ],
            format='json',
            options={'timeout': 60}  # 60 second timeout
        )
        
        await send_log({"type": "thought", "message": "Received response from Ollama."})
        await asyncio.sleep(1)

        # The response from ollama.chat is a dictionary, get the message content
        message_content = response['message']['content']
        
        # Debug: Log the raw response for troubleshooting
        await send_log({"type": "thought", "message": f"Raw AI response: {message_content[:200]}..."})
        
        # The content is a JSON string, so we parse it
        try:
            parsed_response = json.loads(message_content)
            await send_log({"type": "thought", "message": f"Successfully parsed JSON with fields: {list(parsed_response.keys())}"})
        except json.JSONDecodeError as e:
            await send_log({"type": "thought", "message": f"JSON parsing error: {str(e)}. Raw content: {message_content}"})
            # Return a fallback response with the raw content
            parsed_response = {
                "error": "JSON parsing failed",
                "raw_response": message_content,
                "complaint_id": "ERROR_PARSE",
                "summary": f"Failed to parse AI response: {str(e)}"
            }

        await send_log({"type": "result", "data": parsed_response})
        return parsed_response

    except Exception as e:
        error_message = f"An error occurred while processing with Ollama: {e}"
        await send_log({"type": "thought", "message": error_message})
        # Optionally, return a specific error structure to the client
        return {"error": error_message}