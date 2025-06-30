#!/usr/bin/env python3
import sys, json, os
from fpdf import FPDF

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "missing arguments"}))
        return
    output_path = sys.argv[1]
    try:
        data = json.load(sys.stdin)
    except Exception:
        data = {}
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=16)
    pdf.cell(0, 10, "Renal Analysis Report", ln=True)
    pdf.set_font("Arial", size=12)
    for key, value in data.items():
        pdf.cell(0, 10, f"{key}: {value}", ln=True)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pdf.output(output_path)
    print(json.dumps({"pdf_path": output_path}))

if __name__ == "__main__":
    main()
