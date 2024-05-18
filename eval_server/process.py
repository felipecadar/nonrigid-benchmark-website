import argparse
import time
import random

def parse():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input")
    parser.add_argument("--dataset")
    parser.add_argument("--split")
    return parser.parse_args()

if __name__ == "__main__":
    
    args = parse()
    out = args.input + ".out"
    print(f"Processing {args.input}...")
    time.sleep(5)
    
    with open(out, "w") as f:
        ms = random.randint(0, 100) / 100
        ma = random.randint(0, 100) / 100
        mr = random.randint(0, 100) / 100
        f.write(f"{ms},{ma},{mr}")
    print(f"Output written to {out}")