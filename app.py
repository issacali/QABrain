import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path

from flask import Flask, redirect, render_template_string, request, send_from_directory, url_for
import requests
from transformers import pipeline

MODEL_NAME = "google/flan-t5-small"
REPORT_DIR = Path("reports")
REPORT_DIR.mkdir(exist_ok=True)

HTML_TEMPLATE = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>AI/ML Test Case Generator</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 32px; }
      label { display: block; margin-top: 16px; font-weight: 600; }
      textarea, input[type=text] { width: 100%; max-width: 900px; padding: 10px; font-size: 14px; }
      button { margin-top: 20px; padding: 10px 18px; font-size: 15px; }
      .card { border: 1px solid #ddd; border-radius: 8px; padding: 18px; margin-top: 20px; background: #f9f9f9; }
      .report a { color: #0a55d3; }
      pre { white-space: pre-wrap; word-break: break-word; }
    </style>
  </head>
  <body>
    <h1>AI/ML Test Case Generator</h1>
    <p>Provide an API endpoint, curl command, or expected output to generate ML or analytical test cases and a report.</p>
    <form method="post">
      <label>Endpoint URL</label>
      <input type="text" name="endpoint" placeholder="https://api.example.com/predict" value="{{ endpoint }}" />
      <label>curl command</label>
      <textarea name="curl" rows="3" placeholder="curl -X POST ...">{{ curl }}</textarea>
      <label>Expected output or sample response</label>
      <textarea name="expected" rows="4" placeholder='{"label": "positive", "confidence": 0.92}'>{{ expected }}</textarea>
      <label>Task type</label>
      <select name="task_type">
        <option value="ml" {% if task_type == 'ml' %}selected{% endif %}>ML / model evaluation</option>
        <option value="rule" {% if task_type == 'rule' %}selected{% endif %}>Analytical / rule-based</option>
      </select>
      <button type="submit">Generate Report</button>
    </form>

    {% if report_url %}
    <div class="card report">
      <h2>Report Generated</h2>
      <p><a href="{{ report_url }}" target="_blank">Download HTML report</a></p>
      <p><a href="{{ json_url }}" target="_blank">Download JSON report</a></p>
      <h3>Key findings</h3>
      <pre>{{ summary }}</pre>
    </div>
    {% endif %}
  </body>
</html>"""


def parse_curl_text(curl_text):
    if not curl_text:
        return {}

    result = {
        "url": None,
        "method": "GET",
        "headers": {},
        "body": None,
    }

    url_match = re.search(r"curl\s+-X\s+(\w+)\s+([^\s]+)", curl_text)
    if url_match:
        result["method"] = url_match.group(1).upper()
        result["url"] = url_match.group(2).strip("'")
    else:
        url_match = re.search(r"curl\s+([^\s]+)", curl_text)
        if url_match:
            result["url"] = url_match.group(1).strip("'")

    for header in re.findall(r"-H\s+'([^:]+):\s*([^']+)'", curl_text):
        result["headers"][header[0]] = header[1]

    data_match = re.search(r"-d\s+'(.+?)'", curl_text)
    if data_match:
        result["body"] = data_match.group(1)
    else:
        raw_match = re.search(r"--data-raw\s+'(.+?)'", curl_text)
        if raw_match:
            result["body"] = raw_match.group(1)

    return result


def make_api_call(parsed_curl, endpoint):
    if not parsed_curl.get("url") and not endpoint:
        return None, "No URL provided"
    url = endpoint or parsed_curl["url"]
    method = parsed_curl.get("method", "GET")
    headers = parsed_curl.get("headers", {})
    body = parsed_curl.get("body")
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, data=body, timeout=10)
        else:
            return None, f"Unsupported method: {method}"
        response.raise_for_status()
        return response.text, None
    except requests.RequestException as e:
        return None, str(e)


def build_prompt(endpoint, curl, expected, task_type):
    lines = [
        "You are a test generation assistant for AI, ML, and analytical services.",
        "Generate a concise set of test cases and evaluation metrics.",
        "Input specification:",
    ]
    if endpoint:
        lines.append(f"- Endpoint: {endpoint}")
    if curl:
        lines.append(f"- curl: {curl}")
    if expected:
        lines.append(f"- Expected response: {expected}")

    lines.append("\nProduce:")
    lines.append("1. A set of test cases covering functional, boundary, negative, edge, and validation scenarios.")
    lines.append("2. A test matrix of evaluation metrics appropriate to the task.")
    lines.append("3. Report recommendations for QA coverage and expected results.")

    if task_type == "ml":
        lines.append("Include ML evaluation metrics such as accuracy, precision, recall, F1 score, ROC-AUC, RMSE, MAE, and latency/robustness.")
    else:
        lines.append("Include analytical/rule-based metrics such as correctness, rule coverage, input validation, error handling, boundary coverage, and stability.")

    lines.append("Keep the output short and structured as bullet points.")
    return "\n".join(lines)


def extract_output_type(expected):
    if not expected:
        return "unknown"
    try:
        parsed = json.loads(expected)
        if isinstance(parsed, dict):
            return "json_object"
        if isinstance(parsed, list):
            return "json_array"
        return "scalar"
    except Exception:
        if expected.strip().startswith("{") or expected.strip().startswith("["):
            return "json_like"
        return "text"


def make_structured_cases(endpoint, curl, expected, task_type):
    output_type = extract_output_type(expected)
    base = []

    if endpoint or curl:
        base.append({
            "name": "Valid request returns expected structure",
            "description": "Send a valid API request and verify the response matches the expected schema and values.",
            "category": "functional",
        })

    base.append({
        "name": "Missing required field",
        "description": "Omit a required input field and verify the service returns a clear validation error.",
        "category": "validation",
    })

    base.append({
        "name": "Invalid data type",
        "description": "Provide a wrong data type for a field and verify an error or rejection response.",
        "category": "negative",
    })

    base.append({
        "name": "Boundary value",
        "description": "Test the smallest and largest valid values, or empty strings and zero-length arrays.",
        "category": "boundary",
    })

    if task_type == "ml":
        base.extend([
            {
                "name": "Classification label coverage",
                "description": "Verify each predicted label is valid and that the model returns correct labels for representative inputs.",
                "category": "ml_metrics",
            },
            {
                "name": "Confidence score range",
                "description": "Verify confidence or probability scores are within [0, 1] and aligned with expected categories.",
                "category": "ml_metrics",
            },
            {
                "name": "Robustness to noise",
                "description": "Add small input noise or perturbations and verify the output remains stable within acceptable bounds.",
                "category": "robustness",
            },
            {
                "name": "Regression tolerance",
                "description": "If numeric values are returned, validate them against an acceptable tolerance using RMSE/MAE.",
                "category": "regression_metrics",
            },
        ])
    else:
        base.extend([
            {
                "name": "Rule coverage",
                "description": "Create inputs that exercise each business rule or analytic condition in the endpoint.",
                "category": "rule_coverage",
            },
            {
                "name": "Edge conditions",
                "description": "Test empty, duplicate, boundary and out-of-range values to verify correct analytic behavior.",
                "category": "edge",
            },
            {
                "name": "Error handling",
                "description": "Force invalid or conflicting values and verify the API returns proper error messages and codes.",
                "category": "error_handling",
            },
        ])

    base.append({
        "name": "Performance / latency check",
        "description": "Measure response time and ensure the endpoint meets acceptable latency for real use cases.",
        "category": "performance",
    })

    if output_type == "json_object":
        base.append({
            "name": "Response schema validation",
            "description": "Verify the response JSON contains required keys with the correct data types.",
            "category": "schema",
        })

    return base


def make_report(endpoint, curl, expected, task_type, use_model=True):
    parsed_curl = parse_curl_text(curl)
    actual_output, error = make_api_call(parsed_curl, endpoint)
    comparison_result = "error" if error else ("match" if actual_output == expected else "mismatch")
    report = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "endpoint": endpoint or parsed_curl.get("url"),
        "task_type": task_type,
        "curl": curl,
        "parsed_curl": parsed_curl,
        "expected_output": expected,
        "actual_output": actual_output,
        "comparison_error": error,
        "comparison_result": comparison_result,
        "output_type": extract_output_type(expected),
        "test_cases": make_structured_cases(endpoint, curl, expected, task_type),
        "metrics": [],
        "recommendation": "",
    }

    metrics = [
        "accuracy",
        "precision",
        "recall",
        "f1_score",
        "roc_auc",
        "rmse",
        "mae",
        "r2",
        "latency",
        "robustness",
        "rule_coverage",
        "validation",
        "error_handling",
    ]
    report["metrics"] = metrics if task_type == "ml" else [m for m in metrics if m not in {"roc_auc", "r2"}]

    if use_model:
        prompt = build_prompt(endpoint, curl, expected, task_type)
        generator = pipeline("text2text-generation", model=MODEL_NAME, device="cpu")
        answer = generator(prompt, max_length=512, do_sample=False, return_full_text=False)
        conclusion = answer[0]["generated_text"].strip()
        report["model_prompt"] = prompt
        report["model_output"] = conclusion
        report["recommendation"] = "Use the generated test cases and metrics matrix to validate both functional behavior and ML evaluation coverage."
    else:
        report["recommendation"] = "Use the structured test cases with the metric categories to build test coverage."

    return report


def save_report(report):
    now = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    json_path = REPORT_DIR / f"report-{now}.json"
    html_path = REPORT_DIR / f"report-{now}.html"
    json_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    html_lines = [
        "<html><head><meta charset=\"utf-8\"><title>Test Report</title></head><body>",
        f"<h1>AI/ML Test Case Report</h1>",
        f"<p><strong>Generated:</strong> {report['generated_at']}</p>",
        f"<p><strong>Endpoint:</strong> {report['endpoint']}</p>",
        f"<p><strong>Task type:</strong> {report['task_type']}</p>",
        "<h2>Parsed curl</h2>",
        "<pre>" + json.dumps(report['parsed_curl'], indent=2) + "</pre>",
        "<h2>Expected output</h2>",
        "<pre>" + (report['expected_output'] or "(none)") + "</pre>",
        "<h2>Actual output</h2>",
        "<pre>" + (report.get('actual_output') or "(none)") + "</pre>",
        "<h2>Comparison result</h2>",
        "<p>" + report['comparison_result'] + (" (" + report['comparison_error'] + ")" if report['comparison_error'] else "") + "</p>",
        "<h2>Test cases</h2>",
        "<ul>",
    ]
    for case in report["test_cases"]:
        html_lines.append(f"<li><strong>{case['name']}</strong>: {case['description']} <em>({case['category']})</em></li>")
    html_lines.extend([
        "</ul>",
        "<h2>Evaluation metrics</h2>",
        "<ul>",
    ])
    for metric in report["metrics"]:
        html_lines.append(f"<li>{metric}</li>")
    html_lines.extend([
        "</ul>",
        "<h2>Model-generated guidance</h2>",
        "<pre>" + report.get("model_output", "No model generation performed.") + "</pre>",
        "<h2>Recommendation</h2>",
        "<p>" + report["recommendation"] + "</p>",
        "</body></html>",
    ])
    html_path.write_text("\n".join(html_lines), encoding="utf-8")
    return json_path, html_path


def summarize_report(report):
    lines = [
        f"Endpoint: {report['endpoint']}",
        f"Task type: {report['task_type']}",
        f"Comparison: {report['comparison_result']}",
        f"Test cases: {len(report['test_cases'])}",
        f"Metrics: {', '.join(report['metrics'][:6])}...",
    ]
    return "\n".join(lines)


def run_cli():
    parser = argparse.ArgumentParser(description="AI/ML Test Case Generator")
    parser.add_argument("--endpoint", type=str, help="API endpoint URL")
    parser.add_argument("--curl", type=str, help="curl command for the endpoint")
    parser.add_argument("--expected", type=str, help="Expected output or sample response")
    parser.add_argument("--task-type", type=str, choices=["ml", "rule"], default="ml", help="Task type: ml or rule")
    parser.add_argument("--output", type=str, help="Report output directory")
    parser.add_argument("--skip-model", action="store_true", help="Disable model generation and use structured heuristics only")
    parser.add_argument("--web", action="store_true", help="Start the minimal web UI")
    args = parser.parse_args()

    if args.web:
        app = create_app()
        app.run(host="127.0.0.1", port=5000)
        return

    if not (args.endpoint or args.curl or args.expected):
        parser.print_help()
        return

    if args.output:
        global REPORT_DIR
        REPORT_DIR = Path(args.output)
        REPORT_DIR.mkdir(parents=True, exist_ok=True)

    report = make_report(args.endpoint, args.curl, args.expected or "", args.task_type, use_model=not args.skip_model)
    json_path, html_path = save_report(report)
    print(f"Report written to: {json_path}")
    print(f"HTML report written to: {html_path}")
    print("Summary:\n" + summarize_report(report))


def create_app():
    app = Flask(__name__)

    @app.route("/", methods=["GET", "POST"])
    def index():
        report_url = None
        json_url = None
        summary = ""
        endpoint = ""
        curl = ""
        expected = ""
        task_type = "ml"
        if request.method == "POST":
            endpoint = request.form.get("endpoint", "")
            curl = request.form.get("curl", "")
            expected = request.form.get("expected", "")
            task_type = request.form.get("task_type", "ml")
            try:
                report = make_report(endpoint, curl, expected, task_type, use_model=True)
                json_path, html_path = save_report(report)
                report_url = url_for("static_report", filename=html_path.name)
                json_url = url_for("static_report", filename=json_path.name)
                summary = summarize_report(report)
            except Exception as e:
                summary = f"Error generating report: {str(e)}"
        return render_template_string(
            HTML_TEMPLATE,
            report_url=report_url,
            json_url=json_url,
            summary=summary,
            endpoint=endpoint,
            curl=curl,
            expected=expected,
            task_type=task_type,
        )

    @app.route("/reports/<path:filename>")
    def static_report(filename):
        return send_from_directory(REPORT_DIR, filename, as_attachment=True)

    return app


if __name__ == "__main__":
    run_cli()
