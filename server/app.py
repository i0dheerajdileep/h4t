from flask import Flask, request, jsonify, render_template
import os
from dotenv import load_dotenv
import openai
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

# Load the .env file
load_dotenv()

# Retrieve the OpenAI API key from the environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise EnvironmentError("OPENAI_API_KEY not found in .env file")
openai.api_key = api_key

# Home route to render the input form
@app.route('/')
def home():
    return "hi" # Create an index.html file with a form for URL input

# Route to scrape the website and perform CRO analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Get the URL from the form input
        url = request.form.get('url')
        if not url:
            return jsonify({"error": "No URL provided"}), 400

        # Fetch the website content
        response = requests.get(url, verify=False)
        response.raise_for_status()

        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract commonly visible elements above the fold
        landing_content = []

        header = soup.find('header')
        if header:
            landing_content.append(header)

        navbar = soup.find('nav')
        if navbar:
            landing_content.append(navbar)

        main_content = soup.find(['section', 'div'])
        if main_content:
            landing_content.append(main_content)

        # Combine extracted elements and take the first 50 lines of HTML
        visible_content = '\n'.join([element.prettify() for element in landing_content])
        truncated_content = '\n'.join(visible_content.splitlines()[:50])

        if not truncated_content:
            return jsonify({"error": "No visible content found for the landing page."}), 400

        # Prepare the prompt for the CRO analysis
        prompt = (
            "You are an expert in website design and conversion rate optimization (CRO). "
            "Analyze the following HTML code of the hero section of a landing page and provide actionable, diverse suggestions "
            "to improve its design, usability, and conversion potential. Your response should strictly follow this JSON format:\n\n"
            "{\n"
            '    "code": "Modified HTML and CSS code for the hero section",\n'
            '    "suggestions": [\n'
            '        {\n'
            '            "section": "Hero Section",\n'
            '            "suggestion": "Your first specific actionable suggestion for improving the hero section."\n'
            '        },\n'
            '        {\n'
            '            "section": "Hero Section",\n'
            '            "suggestion": "Your second specific actionable suggestion for improving the hero section."\n'
            '        },\n'
            '        {\n'
            '            "section": "Hero Section",\n'
            '            "suggestion": "Your third specific actionable suggestion for improving the hero section."\n'
            '        }\n'
            '    ]\n'
            "}\n\n"
            "Replace 'Modified HTML and CSS code for the hero section' with the updated hero section code based on CRO principles. "
            "Provide multiple specific suggestions, each addressing a unique aspect such as layout, typography, call-to-action, visuals, responsiveness, or accessibility."
        )

        # Make a request to the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"{prompt}\n\n{truncated_content}"}
            ]
        )

        # Extract and return the response content
        output = response.choices[0].message["content"]
        return jsonify({"cro_analysis": output}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching the URL: {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)