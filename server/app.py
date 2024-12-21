from flask import Flask, request, jsonify, render_template,Response
import os
from dotenv import load_dotenv
import openai
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS  # Add this import
import json

app = Flask(__name__)
CORS(app)  # Add this line to enable CORS for all routes


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

@app.route('/proxy', methods=['GET'])
def proxy():
    url = request.args.get('url')  
    print(url) # URL to proxy
    if not url:
        return jsonify({'error': 'Missing URL parameter'}), 400

    try:
        # Fetch the content of the external website
        response = requests.get(url)
        return Response(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'text/html')
        )
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Error fetching the URL: {str(e)}'}), 500

# Route to scrape the website and perform CRO analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Get the URL from the form input
        url = request.form.get('url')
        if not url:
            return jsonify({"error": "No URL provided"}), 400

        # Add headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # Fetch the website content with proper error handling
        try:
            # First try with verification
            response = requests.get(url, headers=headers, timeout=10)
        except requests.exceptions.SSLError:
            # If SSL fails, try again without verification but log a warning
            print(f"Warning: SSL verification failed for {url}, proceeding without verification")
            response = requests.get(url, headers=headers, verify=False, timeout=10)
        
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
            "You are a senior CRO consultant with 10+ years of experience in website optimization and digital marketing. "
            "Analyze this HTML with the following expert approach:\n\n"
            "1. First perform a deep technical analysis of the HTML structure, content, and visible elements\n"
            "2. Identify the website's industry vertical, business model (B2B/B2C/etc), and specific market positioning\n"
            "3. Consider the user psychology and behavior patterns typical for this industry\n"
            "4. Compare against current 2024 industry benchmarks and best practices\n\n"
            "Return ONLY a valid JSON object with this enhanced structure:\n\n"
            "{\n"
            '    "site_analysis": {\n'
            '        "detected_niche": "<precise industry/sub-industry>",\n'
            '        "business_model": "<B2B/B2C/D2C/marketplace/etc>",\n'
            '        "target_audience": {\n'
            '            "primary_demographic": "<detailed demographic profile>",\n'
            '            "psychographic_traits": ["<key psychological characteristics>"],\n'
            '            "pain_points": ["<specific problems they\'re trying to solve>"]\n'
            '        },\n'
            '        "primary_conversion_goals": {\n'
            '            "main_goal": "<primary conversion action>",\n'
            '            "secondary_goals": ["<prioritized list of micro-conversions>"],\n'
            '            "typical_conversion_path": "<described user journey to conversion>"\n'
            '        },\n'
            '        "current_strengths": {\n'
            '            "ux_elements": ["<positive UX features>"],\n'
            '            "content_elements": ["<effective content components>"],\n'
            '            "technical_elements": ["<good technical implementations>"]\n'
            '        },\n'
            '        "critical_gaps": {\n'
            '            "urgent_fixes": ["<immediate action items>"],\n'
            '            "missing_elements": ["<industry-standard features not present>"],\n'
            '            "technical_issues": ["<technical problems affecting conversion>"]\n'
            '        }\n'
            '    },\n'
            '    "performance_analysis": {\n'
            '        "scores": {\n'
            '            "overall_conversion_potential": "<0-100 score with detailed explanation>",\n'
            '            "industry_benchmark_comparison": "<percentile in industry>",\n'
            '            "user_experience_score": "<0-100 with breakdown>",\n'
            '            "trust_signals_score": "<0-100 with breakdown>",\n'
            '            "mobile_optimization": "<0-100 with specific issues>"\n'
            '        },\n'
            '        "competitive_gap_analysis": {\n'
            '            "industry_leaders": ["<top 3 competitors>"],\n'
            '            "key_differentiators": ["<what competitors do better>"],\n'
            '            "opportunity_areas": ["<where to gain competitive advantage>"]\n'
            '        }\n'
            '    },\n'
            '    "optimization_recommendations": {\n'
            '        "immediate_actions": [\n'
            '            {\n'
            '                "title": "<specific optimization title>",\n'
            '                "current_issue": "<detailed problem description>",\n'
            '                "solution": "<step-by-step implementation guide>",\n'
            '                "expected_impact": {\n'
            '                    "conversion_lift": "<estimated % improvement range>",\n'
            '                    "confidence_level": "<based on industry data>",\n'
            '                    "implementation_complexity": "<time/resource estimate>"\n'
            '                },\n'
            '                "industry_examples": [\n'
            '                    {\n'
            '                        "company": "<competitor name>",\n'
            '                        "implementation": "<how they solved it>",\n'
            '                        "results": "<their reported outcomes>"\n'
            '                    }\n'
            '                ]\n'
            '            }\n'
            '        ],\n'
            '        "trust_optimization": {\n'
            '            "missing_elements": [\n'
            '                {\n'
            '                    "element": "<specific trust element>",\n'
            '                    "impact_reason": "<psychological effect>",\n'
            '                    "implementation_guide": "<detailed how-to>",\n'
            '                    "industry_relevance": "<why crucial for this niche>"\n'
            '                }\n'
            '            ],\n'
            '            "social_proof_strategy": {\n'
            '                "recommended_types": ["<specific to industry>"],\n'
            '                "placement_suggestions": ["<where to show proof>"],\n'
            '                "content_guidelines": "<how to present proof effectively>"\n'
            '            }\n'
            '        },\n'
            '        "conversion_funnel_optimization": {\n'
            '            "entry_points": {\n'
            '                "primary_cta": "<main call-to-action>",\n'
            '                "secondary_ctas": ["<supporting calls-to-action>"],\n'
            '                "placement_strategy": "<where to position CTAs>"\n'
            '            },\n'
            '            "value_proposition": {\n'
            '                "current_gaps": ["<what\'s missing in messaging>"],\n'
            '                "suggested_improvements": ["<specific message changes>"],\n'
            '                "psychological_triggers": ["<emotional drivers to use>"]\n'
            '            }\n'
            '        }\n'
            '    },\n'
            '    "technical_recommendations": {\n'
            '        "code_improvements": "<specific HTML/CSS optimizations>",\n'
            '        "performance_fixes": ["<speed/loading improvements>"],\n'
            '        "mobile_optimizations": ["<mobile-specific changes>"],\n'
            '        "accessibility_updates": ["<accessibility improvements>"],\n'
            '        "seo_impact": ["<how changes affect SEO>"]\n'
            '    },\n'
            '    "measurement_plan": {\n'
            '        "kpis": [\n'
            '            {\n'
            '                "metric": "<specific metric>",\n'
            '                "current_benchmark": "<industry standard>",\n'
            '                "measurement_method": "<how to track>",\n'
            '                "success_criteria": "<what defines success>"\n'
            '            }\n'
            '        ],\n'
            '        "testing_recommendations": [\n'
            '            {\n'
            '                "test_type": "<A/B or multivariate>",\n'
            '                "hypothesis": "<clear hypothesis>",\n'
            '                "variables": ["<what to test>"],\n'
            '                "success_metrics": ["<how to measure>"],\n'
            '                "sample_size": "<required traffic>"\n'
            '            }\n'
            '        ]\n'
            '    }\n'
            "}\n\n"
            "CRITICAL ANALYSIS REQUIREMENTS:\n"
            "1. Provide specific, actionable recommendations, not generic advice\n"
            "2. Include real-world examples and case studies from the same industry\n"
            "3. Consider user psychology and behavioral patterns specific to this niche\n"
            "4. Reference current 2024 industry benchmarks and standards\n"
            "5. Prioritize recommendations based on impact vs. effort\n"
            "6. Consider both technical and psychological aspects of conversion\n"
            "7. Provide specific implementation steps, not just what to do\n"
            "8. Include competitive analysis and industry-specific best practices\n"
            "9. Consider the full user journey and all conversion touchpoints\n"
            "10. Ensure all suggestions are backed by industry data or case studies\n"
            "11. Return only valid JSON that can be parsed"
        )

        # Make a request to the OpenAI API
        client = openai.OpenAI()  # Create client instance
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant. You MUST return ONLY valid JSON with no additional text or formatting. Do not include any explanations or markdown formatting."},
                {"role": "user", "content": f"{prompt}\n\n{truncated_content}"}
            ],
            temperature=0.7  # Add temperature to reduce creative formatting
        )

        # Extract and clean the response content
        try:
            output = response.choices[0].message.content.strip()
            
            # Remove any potential markdown formatting or extra text
            if output.startswith("```json"):
                output = output[7:]
            if output.endswith("```"):
                output = output[:-3]
            output = output.strip()
            
            # Attempt to parse JSON
            try:
                parsed_json = json.loads(output)
                return jsonify(parsed_json), 200
            except json.JSONDecodeError as json_err:
                print(f"JSON Parse Error: {str(json_err)}")
                print(f"Raw output: {output}")
                return jsonify({"error": "Invalid JSON response from AI", "details": str(json_err)}), 500
                
        except Exception as e:
            print(f"Response Processing Error: {str(e)}")
            return jsonify({"error": "Error processing AI response", "details": str(e)}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching the URL: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Run the app in debug mode if not in production
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

