#!/usr/bin/env python3
import sys, json, random

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"error": "missing arguments"}))
        return
    image_path = sys.argv[1]
    mask_path = sys.argv[2]
    model = sys.argv[3]
    prediction = random.choice(["normal", "pathological"])
    confidence = round(random.uniform(0.7, 0.99), 3)
    print(json.dumps({
        "classification": prediction,
        "confidence": confidence,
        "model": model,
    }))

if __name__ == "__main__":
    main()
