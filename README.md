# AI/ML Test Case Generator

A small Python program that uses an open-source Hugging Face model to generate AI/ML and analytical/rule-based test cases from an API endpoint, curl command, or expected output. It also compares expected vs actual output by making API calls.

## Features
- Accepts endpoint or curl command input
- Makes actual API calls to get real output
- Compares expected vs actual output
- Supports ML and rule-based evaluation metrics
- Generates structured test cases + report
- Minimal CLI interface with optional local web UI
- Uses an open-source model (`google/flan-t5-small`)

## Setup
1. Create and activate a Python environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

### CLI

```bash
python app.py --endpoint "https://api.example.com/predict" \
  --expected '{"label": "positive", "confidence": 0.92}'
```

### With curl input

```bash
python app.py --curl "curl -X POST https://api.example.com/predict -H 'Content-Type: application/json' -d '{\"text\": \"hello\"}'" \
  --expected '{"label": "positive"}'
```

### Web UI

```bash
python app.py --web
```

Then open `http://127.0.0.1:5000` in your browser.

## Output
- `reports/report-YYYYMMDD-HHMMSS.json`
- `reports/report-YYYYMMDD-HHMMSS.html`

The report includes:
- Expected vs actual output comparison
- Generated test cases
- Evaluation metrics
- Model-generated guidance

## Notes
- The app uses a local open-source model, so there are no external API token costs.
- API calls are made with a 10-second timeout.
- If you want a faster generation path, use `--skip-model`.
