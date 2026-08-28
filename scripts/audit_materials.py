import json
import os
import glob
import re

def audit():
    with open('src/data/articles.json', 'r', encoding='utf-8') as f:
        articles = json.load(f)

    print(f"Total articles in src/data/articles.json: {len(articles)}")

    no_ex = []
    has_ex = []
    empty_ex_blocks = []
    type_counts = {}

    for art in articles:
        slug = art.get('slug')
        order = art.get('order_index')
        title = art.get('title')
        raw_ex = art.get('exercises', [])
        valid_ex = [e for e in raw_ex if e.get('questions') and len(e['questions']) > 0]

        if not valid_ex:
            no_ex.append((order, slug, title, len(raw_ex)))
        else:
            has_ex.append((order, slug, title, len(valid_ex)))

        for e in raw_ex:
            t = e.get('type', 'unknown')
            type_counts[t] = type_counts.get(t, 0) + 1
            if not e.get('questions') or len(e['questions']) == 0:
                empty_ex_blocks.append((slug, e.get('instruction', 'Untitled')))

    print("\n" + "="*50)
    print(f"Articles WITH valid exercises: {len(has_ex)}")
    print(f"Articles WITHOUT exercises: {len(no_ex)}")
    print("="*50)
    
    if no_ex:
        print("\nList of articles without exercises:")
        for order, slug, title, raw_count in no_ex:
            print(f"  - #{order:02d} [{slug}]: \"{title}\" (raw blocks: {raw_count})")

    if empty_ex_blocks:
        print(f"\nEmpty exercise blocks found ({len(empty_ex_blocks)}):")
        for slug, inst in empty_ex_blocks:
            print(f"  - [{slug}]: {inst}")

    print("\nExercise Types Distribution across all articles:")
    for t, cnt in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {t}: {cnt} exercises")

    # Check Markdown files matching
    md_files = glob.glob('articles/markdown/*.md')
    print(f"\nTotal Markdown files in articles/markdown/: {len(md_files)}")

if __name__ == '__main__':
    audit()
