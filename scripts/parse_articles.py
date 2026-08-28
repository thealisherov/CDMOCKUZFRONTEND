import sys
import os
import re
import json
import pypdf

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ARTICLES_DIR = 'articles' if os.path.exists('articles') else 'cdmockfrontend/articles'
OUTPUT_JSON = 'src/data/articles.json' if os.path.exists('src/data') else 'cdmockfrontend/src/data/articles.json'
ARTICLES_JSON_DIR = 'articles/json' if os.path.exists('articles') else 'cdmockfrontend/articles/json'
SRC_ARTICLES_DIR = 'src/data/articles' if os.path.exists('src') else 'cdmockfrontend/src/data/articles'
ARTICLES_MD_DIR = 'articles/markdown' if os.path.exists('articles') else 'cdmockfrontend/articles/markdown'

os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
os.makedirs(ARTICLES_JSON_DIR, exist_ok=True)
os.makedirs(SRC_ARTICLES_DIR, exist_ok=True)
os.makedirs(ARTICLES_MD_DIR, exist_ok=True)

def guess_category(title, text):
    content = (title + " " + text[:500]).lower()
    if any(k in content for k in ['tourism', 'travel', 'culture', 'space exploration', 'newspaper', 'migration', 'countryside', 'museum']):
        return "Travel & Culture"
    if any(k in content for k in ['urban', 'city', 'crime', 'poverty', 'social', 'population', 'ageing', 'juvenile', 'generation gap', 'nursing', 'cctv', 'surveillance', 'gender', 'alone', 'consumerism', 'housing']):
        return "Society"
    if any(k in content for k in ['ai', 'artificial intelligence', 'technology', 'robot', 'computer', 'smart', 'driverless', 'digital', 'game', 'online', 'cyber', 'internet', 'virtual', 'self-driving', 'media', 'phone', 'smartphone']):
        return "Technology"
    if any(k in content for k in ['climate', 'environment', 'pollution', 'plastic', 'wildlife', 'animal', 'zoo', 'energy', 'nuclear', 'solar', 'cars', 'electric', 'agriculture']):
        return "Environment"
    if any(k in content for k in ['education', 'learning', 'school', 'abroad', 'study', 'teacher', 'library', 'language', 'english', 'university', 'homework', 'homeschooling', 'science education', 'single-sex']):
        return "Education"
    if any(k in content for k in ['health', 'fast-food', 'food', 'gmo', 'medical', 'sport', 'exercise', 'diet', 'hospital', 'vegetarian']):
        return "Health"
    if any(k in content for k in ['employment', 'job', 'work', 'remote working', 'economy', 'shopping', 'petrol', 'branding', 'market', 'business', 'money', 'celebrity', 'financial', 'tax', 'advertisement']):
        return "Economy"
    return "Society"

def slugify(text):
    text = re.sub(r'^(?:Topic:\s*|\d+[\.\-\s]+|iSTUDY_ACADEMY[^\n]*\s*)', '', text, flags=re.IGNORECASE).strip()
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

def clean_title(raw_title):
    t = re.sub(r'^(?:Topic:\s*|\d+[\.\s\:\-]+|iSTUDY_ACADEMY[^\n]*\s*|NEVER SAY NEVER[^\n]*\s*)', '', raw_title, flags=re.IGNORECASE).strip()
    t = re.sub(r'^(?:Pros and cons of|Pros and Cons of|PROS AND CONS OF)\s*', 'Pros and Cons of ', t, flags=re.IGNORECASE)
    t = re.sub(r'^(?:Causes, Effects and Solutions of|Causes, Effects, and Solutions of|Causes and Solutions of)\s*', 'Causes & Solutions of ', t, flags=re.IGNORECASE)
    t = re.sub(r'\s+', ' ', t).strip()
    t = t.replace('’', "'")
    if t.isupper():
        t = t.title()
    if not t or len(t) < 3:
        t = "IELTS Topic Analysis"
    return t

def format_bold_highlights(text):
    formatted = text
    academic_keywords = [
        "rapid urbanization", "infrastructure development", "economic opportunities", 
        "socioeconomic divide", "rural-to-urban migration", "overcrowded slums",
        "air quality degradation", "sustainable urban planning", "green energy initiatives",
        "affordable housing crisis", "congestion charges", "public transit investments",
        "cognitive flexibility", "problem-solving skills", "hand-eye coordination",
        "spatial awareness", "social isolation", "sedentary lifestyle",
        "sleep deprivation", "violent behaviors", "addictive tendencies",
        "gamified learning", "flexible schedules", "geographical barriers",
        "self-discipline", "procrastination", "virtual classrooms",
        "interactive multimedia", "digital literacy", "hands-on laboratory work",
        "peer-to-peer discussions", "diploma mills", "species conservation",
        "endangered animals", "biodiversity loss", "educational exhibits",
        "animal welfare", "confined enclosures", "psychological distress",
        "natural habitat", "ethical controversies", "sanctuaries",
        "cultural exchange", "economic revenue", "job creation",
        "overtourism", "environmental footprint", "gentrification",
        "seasonal employment", "carbon emissions", "ecotourism",
        "sustainable travel", "poaching", "habitat destruction",
        "deforestation", "trophy hunting", "ecosystem equilibrium",
        "anti-poaching laws", "wildlife reserves", "community-based conservation",
        "equal access to information", "digital archives", "community hubs",
        "lifelong learning", "digitization", "budget cuts",
        "e-books", "information repositories", "quiet study zones",
        "ad blitz", "brand loyalty", "impulse buying",
        "deceptive advertising", "targeted marketing", "consumer psychology",
        "regulatory bodies", "unrealistic beauty standards", "product endorsements",
        "greenhouse gas emissions", "global warming", "fossil fuels",
        "extreme weather events", "rising sea levels", "renewable energy",
        "carbon footprint", "international accords", "climate skepticism",
        "unsubstantiated claims", "clickbait headlines", "echo chambers",
        "verified reporting", "in-depth analysis", "algorithmic feeds",
        "print circulation", "press freedom", "convenience of home delivery",
        "secure payment gateways", "product reviews", "counterfeit goods",
        "excessive packaging", "e-commerce dominance", "personal mobility",
        "traffic congestion", "maintenance costs", "depreciation",
        "carpooling schemes", "integrated transport", "global lingua franca",
        "career advancement", "cross-cultural communication", "linguistic diversity",
        "immersive learning", "native-level proficiency", "autonomy and flexibility",
        "financial instability", "self-motivation", "entrepreneurial mindset",
        "market competition", "tax burdens", "instant connectivity",
        "nomophobia", "cyberbullying", "multitasking illusions",
        "work-life balance blur", "electromagnetic radiation", "cultural amenities",
        "cost of living", "fast-paced lifestyle", "noise pollution",
        "community detachment", "higher wages", "zero tailpipe emissions",
        "range anxiety", "charging infrastructure", "battery disposal",
        "subsidies and incentives", "cleaner alternatives", "academic prestige",
        "culture shock", "homesickness", "independent living",
        "global perspective", "tuition fees", "international understanding",
        "environmental challenges", "economic challenges", "hospitality industry",
        "cross-cultural understanding", "cultural interaction", "mutual respect",
        "global citizenship", "interconnectedness", "international harmony",
        "cultural preservation", "transport networks", "public utilities",
        "telecommunications", "living standards", "carbon footprint",
        "natural habitats", "erosion of local culture", "homogenization of culture",
        "heritage sites", "fragile ecosystems", "straining public services",
        "housing costs", "inflationary pressures", "seasonal fluctuations",
        "loss of cultural identity", "cultural degradation", "responsible management"
    ]
    
    for kw in sorted(academic_keywords, key=len, reverse=True):
        pattern = rf'(?i)\b({re.escape(kw)})\b'
        formatted = re.sub(pattern, r'**\1**', formatted)

    formatted = re.sub(r'\*{4,}', '**', formatted)
    
    headers = [
        "Causes", "Effects", "Solutions", "Advantages", "Disadvantages",
        "Positive Aspects", "Negative Aspects", "Pros", "Cons", "Introduction", "Conclusion",
        "Economic Benefits", "Cultural Exchange and Global Awareness", "Infrastructure Development",
        "Environmental Degradation", "Overtourism and Damage to Local Communities",
        "Economic Dependence and Price Inflation", "Cultural Loss and Commercialization",
        "Cultural Erosion and Social Problems"
    ]
    for h in headers:
        formatted = re.sub(rf'(?im)^[ \t]*({re.escape(h)})[ \t]*$', rf'### \1\n', formatted)
    
    return formatted

def parse_topic_text(raw_text):
    text = raw_text.replace('\x0c', '\n\n').replace('’', "'").replace('“', '"').replace('”', '"')
    text = text.replace('\ufffd', '-').replace('–', '-').replace('—', '-')
    
    # Strip headers/footers/watermarks
    text = re.sub(r'(?i)^\s*(?:iSTUDY_ACADEMY|NEVER SAY NEVER|Absolutely|Here\'s a complete)[^\n]*\n+', '', text)
    text = re.sub(r'(?i)iSTUDY_ACADEMY[^\n]*', '', text)
    text = re.sub(r'(?i)NEVER SAY NEVER[^\n]*', '', text)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)

    # 1. Identify Vocabulary start
    vocab_pattern = r'(?im)^\s*(?:Topic Vocabulary & Collocations|Key Topic Vocabulary and Collocations|Topic Vocabulary:|Key Vocabulary:|Key Topic Vocabulary|Topic Vocabulary)\s*$'
    vocab_match = re.search(vocab_pattern, text)
    
    # 2. Identify Exercises start
    ex_pattern = r'(?im)^\s*(?:(?:Advanced\s+)?(?:Vocabulary\s+)?Exercises|Practice Exercises|Practice Questions|\d+\s+ADVANCED\s+EXERCISES|Exercise\s*1\b|Exercise\s*1\s*[-–—:\ufffd])'
    ex_match = re.search(ex_pattern, text)

    main_essay = ""
    vocab_text = ""
    ex_text = ""

    if vocab_match and ex_match:
        if vocab_match.start() < ex_match.start():
            main_essay = text[:vocab_match.start()].strip()
            vocab_text = text[vocab_match.end():ex_match.start()].strip()
            ex_text = text[ex_match.start():].strip()
        else:
            main_essay = text[:ex_match.start()].strip()
            ex_text = text[ex_match.start():vocab_match.start()].strip()
            vocab_text = text[vocab_match.end():].strip()
    elif vocab_match:
        main_essay = text[:vocab_match.start()].strip()
        vocab_text = text[vocab_match.end():].strip()
    elif ex_match:
        main_essay = text[:ex_match.start()].strip()
        ex_text = text[ex_match.start():].strip()
    else:
        main_essay = text.strip()

    main_essay = re.sub(r'(?i)^\s*(?:short, clear paragraphs|All key topic vocabulary|After the essay|Here\'s a complete|Absolutely)[^\n]*\n*', '', main_essay)
    main_essay = re.sub(r'(?i)^\s*(?:The Pros and Cons of|Causes, Effects and Solutions of|Causes and Solutions of)\s+[A-Za-z\s\-]+\n+', '', main_essay)
    main_essay = re.sub(r'\n{3,}', '\n\n', main_essay).strip()

    # Parse Vocabulary
    vocabulary = []
    if vocab_text:
        cur_type = "topic vocab"
        for line in vocab_text.split('\n'):
            line = line.strip()
            if not line or line.startswith('---') or 'exercise' in line.lower() or 'fill in the blank' in line.lower():
                continue
            if re.match(r'(?i)^Collocations?:?', line):
                cur_type = "collocation"
                continue
            if re.match(r'(?i)^Noun Phrases?:?', line):
                cur_type = "noun phrase"
                continue
            if re.match(r'(?i)^Topic Vocabulary:?', line):
                cur_type = "topic vocab"
                line = re.sub(r'(?i)^Topic Vocabulary:\s*', '', line)

            if any(sym in line for sym in ['•', '|']):
                items = [it.strip() for it in re.split(r'[•|]', line) if it.strip()]
                for it in items:
                    clean_it = re.sub(r'^[•\-\*\d\.\)\s]+', '', it).strip()
                    if len(clean_it) > 1 and not re.match(r'^(?:Exercise|\d+[\.\)])', clean_it, re.I):
                        vocabulary.append({"word": clean_it.title(), "type": cur_type, "meaning": ""})
                continue

            # Word (pos) - definition
            m1 = re.match(r'^(?:\d+[\.\)]\s*)?([A-Za-z\s\-\/\']+?)\s*(?:\(([a-z\.\,\s]+)\))?\s*[-–—:]\s*(.+)$', line)
            if m1:
                w = m1.group(1).strip().title()
                pos = m1.group(2).strip() if m1.group(2) else cur_type
                definition = m1.group(3).strip()
                if len(w) > 1 and not w.lower().startswith('exercise'):
                    vocabulary.append({"word": w, "type": pos, "meaning": definition})
            elif ':' in line and not line.startswith('http'):
                parts = line.split(':', 1)
                if len(parts[0].split()) <= 6 and len(parts[1]) > 3:
                    w = parts[0].strip().title()
                    if not w.lower().startswith('exercise'):
                        vocabulary.append({"word": w, "type": cur_type, "meaning": parts[1].strip()})
            elif len(line.split()) <= 6 and len(line) > 2:
                clean_w = re.sub(r'^[•\-\*\d\.\)\s]+', '', line).strip()
                if clean_w and not clean_w.lower().startswith('exercise'):
                    vocabulary.append({"word": clean_w.title(), "type": cur_type, "meaning": ""})

    # Parse Exercises
    exercises = []
    if ex_text:
        # Split by Exercise headers (Exercise 1, Task 1, 1. Match, 2. Fill in the blanks, etc.)
        split_pattern = r'(?im)(?=^\s*(?:Exercise\s*\d+|Task\s*\d+|\d+\.\s+(?:Match|Fill in|Discussion|Word Formation|Sentence Transformation|Complete|Collocation|Vocabulary|Choose|Critical Thinking|Synonym|Rewrite)|Match the Words|Fill in the Blanks|Discussion Questions|Word Formation Exercise|Sentence Transformation Exercise|EXERCISE\s*\d+))'
        chunks = re.split(split_pattern, ex_text)
        for ch in chunks:
            ch = ch.strip()
            if not ch:
                continue
            lines = [l.strip() for l in ch.split('\n') if l.strip()]
            header = lines[0] if lines else "Exercise"
            header = re.sub(r'^[^\w]*', '', header).strip()

            # Skip generic top-level headers like "EXERCISES" with no sub-content
            if re.match(r'^(?:EXERCISES|Practice Questions|Advanced Vocabulary Exercises|Advanced Exercises)$', header, re.I) and len(lines) <= 2:
                continue

            description = ""
            word_bank = []
            q_lines = []
            
            in_paren = False
            paren_buf = []

            for line in lines[1:]:
                # Check for opening/closing parentheses with words pool
                if '(' in line and not in_paren and not re.match(r'^\d+[\.\)]', line) and not re.match(r'^\([A-D]\)', line):
                    in_paren = True
                    paren_buf = [line]
                    if ')' in line:
                        in_paren = False
                        p_str = " ".join(paren_buf)
                        wb_match = re.search(r'\(([^)]+)\)', p_str)
                        if wb_match:
                            words = [w.strip() for w in wb_match.group(1).split(',') if w.strip()]
                            valid_words = [w for w in words if len(w) > 1 and not re.match(r'^(?:or\s+)?[A-Ja-j]$', w)]
                            if len(valid_words) >= 2:
                                word_bank.extend(valid_words)
                    continue
                elif in_paren:
                    paren_buf.append(line)
                    if ')' in line:
                        in_paren = False
                        p_str = " ".join(paren_buf)
                        wb_match = re.search(r'\(([^)]+)\)', p_str)
                        if wb_match:
                            words = [w.strip() for w in wb_match.group(1).split(',') if w.strip()]
                            valid_words = [w for w in words if len(w) > 1 and not re.match(r'^(?:or\s+)?[A-Ja-j]$', w)]
                            if len(valid_words) >= 2:
                                word_bank.extend(valid_words)
                    continue

                # Check for description before numbered items
                if not q_lines and not re.match(r'^\d+[\.\)]', line) and not re.match(r'^[A-J][\.\)]', line):
                    if not line.startswith('---'):
                        description = (description + " " + line).strip()
                    continue

                # Question or item line
                if re.match(r'^\d+[\.\)]', line):
                    q_lines.append(line)
                elif q_lines:
                    # Append continuation of previous question
                    q_lines[-1] += " " + line
                else:
                    q_lines.append(line)

            # Determine exercise type
            ex_type = "gap_fill"
            hl = (header + " " + description).lower()
            if "match" in hl or "column a" in hl:
                ex_type = "matching"
            elif "choose" in hl or "multiple choice" in hl or "select the best" in hl or "select the correct" in hl:
                ex_type = "multiple_choice"
            elif "paraphras" in hl:
                ex_type = "paraphrase"
            elif "transformation" in hl or "formation" in hl or "word formation" in hl:
                ex_type = "word_transformation"
            elif "discussion" in hl or "critical thinking" in hl or "writing prompt" in hl:
                ex_type = "discussion"
            elif "complete" in hl or "fill in" in hl or "blank" in hl or "sentence" in hl or "synonym" in hl:
                ex_type = "gap_fill"

            # Only keep exercises that have actual questions
            if q_lines and len(q_lines) > 0:
                exercises.append({
                    "instruction": header,
                    "description": description,
                    "type": ex_type,
                    "word_bank": word_bank,
                    "questions": q_lines
                })

    # If vocabulary is empty, extract from bullet points or bold keywords in essay
    if not vocabulary:
        # Check for bullet points in text
        for line in text.split('\n'):
            line = line.strip()
            if line.startswith('•') or line.startswith('- ') or line.startswith('* '):
                clean = re.sub(r'^[•\-\*\s]+', '', line).strip()
                if 2 <= len(clean.split()) <= 6 and not clean.lower().startswith('exercise') and not '__________' in clean:
                    vocabulary.append({"word": clean.title(), "type": "topic vocab", "meaning": ""})
        
        # Also extract unique bold keywords from essay
        bold_matches = re.findall(r'\*\*([^*]+)\*\*', main_essay)
        for bm in bold_matches:
            bm_clean = bm.strip()
            if 1 <= len(bm_clean.split()) <= 4 and len(bm_clean) > 3:
                if not any(v['word'].lower() == bm_clean.lower() for v in vocabulary):
                    vocabulary.append({"word": bm_clean.title(), "type": "academic phrase", "meaning": ""})

    return main_essay, vocabulary, exercises

def generate_all_articles():
    articles = []
    article_order = 1
    seen_slugs = set()

    # Part A: 18 Individual Topic PDFs (1 to 20)
    indiv_files = sorted([f for f in os.listdir(ARTICLES_DIR) if f.endswith('.pdf') and f != 'IDEA BOOK.pdf'], 
                         key=lambda x: int(re.match(r'(\d+)', x).group(1)) if re.match(r'(\d+)', x) else 999)

    print(f"Processing {len(indiv_files)} individual PDF topics...")
    for filename in indiv_files:
        filepath = os.path.join(ARTICLES_DIR, filename)
        reader = pypdf.PdfReader(filepath)
        raw_text = "\n".join([p.extract_text() for p in reader.pages])

        clean_file_name = re.sub(r'^\d+\.\s*', '', filename.replace('.pdf', '')).strip()
        title = clean_title(clean_file_name)

        main_essay, vocabulary, exercises = parse_topic_text(raw_text)
        main_essay = format_bold_highlights(main_essay)
        category = guess_category(title, main_essay)

        slug = slugify(title)
        if slug in seen_slugs:
            slug = f"{slug}-{article_order}"
        seen_slugs.add(slug)

        word_count = len(main_essay.split())
        read_time = f"{max(3, round(word_count / 180))} min read"

        paras = [p for p in main_essay.split('\n\n') if len(p.strip()) > 60 and not p.startswith('#')]
        excerpt = (paras[0] if paras else main_essay[:180]).replace('\n', ' ')
        if len(excerpt) > 200:
            excerpt = excerpt[:197] + '...'

        is_free = (article_order <= 3)

        art_obj = {
            "order_index": article_order,
            "title": title,
            "slug": slug,
            "category": category,
            "level": "C1 (IELTS 7.5+)" if article_order % 2 == 0 else "B2 (IELTS 6.5+)",
            "read_time": read_time,
            "is_free": is_free,
            "image_url": "",
            "excerpt": excerpt,
            "content": main_essay,
            "vocabulary": vocabulary,
            "exercises": exercises,
            "source": filename
        }

        articles.append(art_obj)

        # Write individual JSON and Markdown
        json_filename = f"{article_order:03d}_{slug}.json"
        with open(os.path.join(ARTICLES_JSON_DIR, json_filename), 'w', encoding='utf-8') as f:
            json.dump(art_obj, f, ensure_ascii=False, indent=2)
        with open(os.path.join(SRC_ARTICLES_DIR, json_filename), 'w', encoding='utf-8') as f:
            json.dump(art_obj, f, ensure_ascii=False, indent=2)

        # Build Markdown content including exercises
        md_content = f"# {title}\n\n**Category:** {category} | **Level:** {art_obj['level']} | **Time:** {read_time} | **Access:** {'FREE' if is_free else 'PREMIUM'}\n\n---\n\n{main_essay}\n"
        if exercises:
            md_content += "\n\n---\n\n## Practice Exercises & Questions\n\n"
            for ex in exercises:
                md_content += f"### {ex.get('instruction', 'Exercise')}\n"
                if ex.get('description'):
                    md_content += f"*{ex['description']}*\n\n"
                if ex.get('word_bank') and len(ex['word_bank']) > 0:
                    md_content += f"**Word Bank:** `{', '.join(ex['word_bank'])}`\n\n"
                for q in ex.get('questions', []):
                    md_content += f"- {q}\n"
                md_content += "\n"

        md_filename = f"{article_order:03d}_{slug}.md"
        with open(os.path.join(ARTICLES_MD_DIR, md_filename), 'w', encoding='utf-8') as f:
            f.write(md_content)

        print(f"  [{article_order:02d}] {title}: {len(vocabulary)} vocab, {len(exercises)} exercises")
        article_order += 1

    # Part B: Accurate Topic Page Boundaries in IDEA BOOK.pdf
    idea_book_path = os.path.join(ARTICLES_DIR, 'IDEA BOOK.pdf')
    if os.path.exists(idea_book_path):
        print(f"\nProcessing topics from IDEA BOOK.pdf...")
        reader = pypdf.PdfReader(idea_book_path)
        total_pages = len(reader.pages)

        # Find all sequential topic starting pages
        topic_boundaries = []
        for p in range(total_pages):
            txt = reader.pages[p].extract_text()
            lines = [l.strip() for l in txt.split('\n') if l.strip()]
            for l in lines[:5]:
                m = re.search(r'^\s*(\d{1,2})\.\s+([A-Z][a-zA-Z0-9\s\:\,\-\–\—\(\)\/\'\"]{3,})', l)
                if m and int(m.group(1)) <= 50:
                    num = int(m.group(1))
                    t_title = m.group(2).strip()
                    if not any(t[1] == num for t in topic_boundaries) and not any(t_title.lower().startswith(x) for x in ['crime prevention', 'enhanced public', 'evidence collection', 'privacy concerns', 'high installation', 'misuse of', 'continuous observation', 'feeling safe', 'gathering proof', 'interference with', 'damage or']):
                        topic_boundaries.append((p, num, t_title))
                        break

        print(f"Found {len(topic_boundaries)} sequential topics in IDEA BOOK.pdf")

        for idx, (start_p, t_num, raw_t) in enumerate(topic_boundaries):
            end_p = topic_boundaries[idx+1][0] if (idx + 1) < len(topic_boundaries) else total_pages
            pages_text = [reader.pages[p].extract_text() for p in range(start_p, end_p)]
            full_text = "\n\n".join(pages_text)

            title = clean_title(raw_t)
            main_essay, vocabulary, exercises = parse_topic_text(full_text)
            main_essay = format_bold_highlights(main_essay)
            category = guess_category(title, main_essay)

            base_slug = slugify(title)
            slug = base_slug
            count = 1
            while slug in seen_slugs:
                slug = f"{base_slug}-{count}"
                count += 1
            seen_slugs.add(slug)

            word_count = len(main_essay.split())
            read_time = f"{max(3, round(word_count / 180))} min read"

            paras = [p for p in main_essay.split('\n\n') if len(p.strip()) > 60 and not p.startswith('#')]
            excerpt = (paras[0] if paras else main_essay[:180]).replace('\n', ' ')
            if len(excerpt) > 200:
                excerpt = excerpt[:197] + '...'

            is_free = (article_order <= 3)

            art_obj = {
                "order_index": article_order,
                "title": title,
                "slug": slug,
                "category": category,
                "level": "C1 (IELTS 7.5+)" if article_order % 2 == 0 else "B2 (IELTS 6.5+)",
                "read_time": read_time,
                "is_free": is_free,
                "image_url": "",
                "excerpt": excerpt,
                "content": main_essay,
                "vocabulary": vocabulary,
                "exercises": exercises,
                "source": f"IDEA BOOK.pdf (Pages {start_p+1}-{end_p})"
            }

            articles.append(art_obj)

            # Write individual JSON and Markdown
            json_filename = f"{article_order:03d}_{slug}.json"
            with open(os.path.join(ARTICLES_JSON_DIR, json_filename), 'w', encoding='utf-8') as f:
                json.dump(art_obj, f, ensure_ascii=False, indent=2)
            with open(os.path.join(SRC_ARTICLES_DIR, json_filename), 'w', encoding='utf-8') as f:
                json.dump(art_obj, f, ensure_ascii=False, indent=2)

            md_content = f"# {title}\n\n**Category:** {category} | **Level:** {art_obj['level']} | **Time:** {read_time} | **Access:** {'FREE' if is_free else 'PREMIUM'}\n\n---\n\n{main_essay}\n"
            if exercises:
                md_content += "\n\n---\n\n## Practice Exercises & Questions\n\n"
                for ex in exercises:
                    md_content += f"### {ex.get('instruction', 'Exercise')}\n"
                    if ex.get('description'):
                        md_content += f"*{ex['description']}*\n\n"
                    if ex.get('word_bank') and len(ex['word_bank']) > 0:
                        md_content += f"**Word Bank:** `{', '.join(ex['word_bank'])}`\n\n"
                    for q in ex.get('questions', []):
                        md_content += f"- {q}\n"
                    md_content += "\n"

            md_filename = f"{article_order:03d}_{slug}.md"
            with open(os.path.join(ARTICLES_MD_DIR, md_filename), 'w', encoding='utf-8') as f:
                f.write(md_content)

            print(f"  [{article_order:02d}] {title}: {len(vocabulary)} vocab, {len(exercises)} exercises")
            article_order += 1

    # Save to Master JSON
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"\n==========================================")
    print(f"Generated {len(articles)} total articles.")
    print(f"Articles with exercises: {sum(1 for a in articles if len(a['exercises']) > 0)}")
    print(f"Total exercises generated: {sum(len(a['exercises']) for a in articles)}")
    print(f"==========================================")

if __name__ == '__main__':
    generate_all_articles()
