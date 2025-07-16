import os
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

async def analyze_sql_performance(sql: str) -> str:
    """
    Analyzes SQL performance using the Gemini API.
    """
    model = genai.GenerativeModel('gemini-pro')
    prompt = f"Analyze the following SQL query for performance issues and suggest improvements:\n\n{sql}"
    response = await model.generate_content_async(prompt)
    return response.text
