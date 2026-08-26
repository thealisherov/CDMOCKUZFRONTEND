import os
import re
import json
import pypdf
from markitdown import MarkItDown

md_converter = MarkItDown()

ARTICLES_DIR = 'cdmockfrontend/articles'
OUTPUT_JSON = 'cdmockfrontend/src/data/articles.json'
ARTICLES_JSON_DIR = 'cdmockfrontend/articles/json'
SRC_ARTICLES_DIR = 'cdmockfrontend/src/data/articles'
ARTICLES_MD_DIR = 'cdmockfrontend/articles/markdown'

os.makedirs('cdmockfrontend/src/data', exist_ok=True)
os.makedirs(ARTICLES_JSON_DIR, exist_ok=True)
os.makedirs(SRC_ARTICLES_DIR, exist_ok=True)
os.makedirs(ARTICLES_MD_DIR, exist_ok=True)

def guess_category(title, text):
    content = (title + " " + text[:500]).lower()
    if any(k in content for k in ['tourism', 'travel', 'culture', 'space exploration', 'newspaper', 'migration', 'countryside']):
        return "Travel & Culture"
    if any(k in content for k in ['urban', 'city', 'crime', 'poverty', 'social', 'population', 'ageing', 'juvenile', 'generation gap', 'nursing', 'cctv', 'surveillance', 'museum', 'gender', 'alone', 'consumerism', 'housing']):
        return "Society"
    if any(k in content for k in ['ai', 'artificial intelligence', 'technology', 'robot', 'computer', 'smart', 'driverless', 'digital', 'game', 'online', 'cyber', 'internet', 'virtual', 'self-driving', 'media', 'phone', 'smartphone']):
        return "Technology"
    if any(k in content for k in ['climate', 'environment', 'pollution', 'plastic', 'wildlife', 'animal', 'zoo', 'energy', 'nuclear', 'solar', 'cars', 'electric', 'agriculture']):
        return "Environment"
    if any(k in content for k in ['education', 'learning', 'school', 'abroad', 'study', 'teacher', 'library', 'language', 'english', 'university', 'homework', 'homeschooling', 'science education']):
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

def extract_vocab_and_exercises_precise(raw_text):
    # Normalize unicode quotes, page breaks and artifacts
    text = raw_text.replace('’', "'").replace('“', '"').replace('”', '"').replace('\x0c', '\n\n')
    
    # Strip introductory prompt phrases from the very top
    text = re.sub(r'(?i)^\s*(?:Absolutely|Here\'s a complete|All key topic vocabulary|After the essay|iSTUDY_ACADEMY|NEVER SAY NEVER)[^\n]*\n+', '', text)
    text = re.sub(r'(?i)^\s*(?:[^\n]*(?:reading or IELTS discussion practice|bolded for easy learning|advanced vocabulary exercises)[^\n]*\n*)+', '', text)

    # Find the exact vocabulary heading line (at end of essay)
    vocab_match = re.search(r'(?im)^\s*(?:Topic Vocabulary & Collocations|Key Topic Vocabulary and Collocations|Topic Vocabulary:|Key Vocabulary:|Key Topic Vocabulary)\s*$', text)
    
    if vocab_match:
        main_essay = text[:vocab_match.start()].strip()
        rest = text[vocab_match.end():].strip()
    else:
        vocab_match2 = re.search(r'(?m)^[ \t]*(?:Topic Vocabulary|Key Vocabulary)[ \t]*$', text, re.IGNORECASE)
        if vocab_match2:
            main_essay = text[:vocab_match2.start()].strip()
            rest = text[vocab_match2.end():].strip()
        else:
            main_essay = text.strip()
            rest = ""

    # Clean main essay
    main_essay = re.sub(r'(?i)iSTUDY_ACADEMY[^\n]*', '', main_essay)
    main_essay = re.sub(r'(?i)NEVER SAY NEVER[^\n]*', '', main_essay)
    main_essay = re.sub(r'^\s*\d+\s*$', '', main_essay, flags=re.MULTILINE)
    
    # Clean top title repetitions
    main_essay = re.sub(r'(?i)^\s*(?:The Pros and Cons of|Causes, Effects and Solutions of|Causes and Solutions of)[^\n]*\n+', '', main_essay)
    main_essay = re.sub(r'\n{3,}', '\n\n', main_essay).strip()

    # Split rest into Vocabulary and Exercises
    vocabulary = []
    exercises = []

    if rest:
        ex_match = re.search(r'(?im)^\s*(?:Advanced Vocabulary Exercises|Practice Exercises|Exercises:|Practice Questions)\s*$', rest)
        if ex_match:
            vocab_part = rest[:ex_match.start()].strip()
            ex_part = rest[ex_match.end():].strip()
        else:
            vocab_part = rest
            ex_part = ""

        # Parse Vocabulary Lines
        cur_type = "academic"
        for line in vocab_part.split('\n'):
            line = line.strip()
            if not line or line.startswith('---'):
                continue
            if re.match(r'(?i)^Collocations:', line):
                cur_type = "collocation"
                continue
            if re.match(r'(?i)^Noun Phrases:', line):
                cur_type = "noun phrase"
                continue
            if re.match(r'(?i)^Topic Vocabulary:', line):
                cur_type = "topic vocab"
                line = re.sub(r'(?i)^Topic Vocabulary:\s*', '', line)

            # Check if line has bullet separated words (e.g. word1 • word2 • word3)
            if any(sym in line for sym in ['•', '', '|']):
                items = [it.strip() for it in re.split(r'[•|]', line) if it.strip()]
                for it in items:
                    if len(it) > 1:
                        vocabulary.append({"word": it.title(), "type": cur_type, "meaning": ""})
                continue

            # Pattern: 1. Word (pos) – definition
            m1 = re.match(r'^(?:\d+[\.\)]\s*)?([A-Za-z\s\-\/\']+?)\s*(?:\(([a-z\.\,\s]+)\))?\s*[-–—:]\s*(.+)$', line)
            if m1:
                w = m1.group(1).strip().title()
                pos = m1.group(2).strip() if m1.group(2) else cur_type
                definition = m1.group(3).strip()
                if len(w) > 1:
                    vocabulary.append({"word": w, "type": pos, "meaning": definition})
            elif ':' in line and not line.startswith('http'):
                parts = line.split(':', 1)
                if len(parts[0].split()) <= 6 and len(parts[1]) > 3:
                    vocabulary.append({
                        "word": parts[0].strip().title(),
                        "type": cur_type,
                        "meaning": parts[1].strip()
                    })
            elif len(line.split()) <= 6 and len(line) > 2:
                # Standalone word or collocation
                clean_w = re.sub(r'^[•\-\*\d\.\)\s]+', '', line).strip()
                if clean_w:
                    vocabulary.append({"word": clean_w.title(), "type": cur_type, "meaning": ""})

        # Parse Exercises
        if ex_part:
            ex_lines = [l.strip() for l in ex_part.split('\n') if l.strip()]
            ex_title = "Practice Questions"
            items = []
            for l in ex_lines:
                if re.match(r'^(?:Exercise|Part|Section)\s*\d+', l, flags=re.IGNORECASE):
                    if items:
                        exercises.append({"instruction": ex_title, "questions": items})
                        items = []
                    ex_title = l
                elif re.match(r'^\d+[\.\)]', l):
                    items.append(l)
                elif items:
                    items[-1] += " " + l
            if items:
                exercises.append({"instruction": ex_title, "questions": items})

    return main_essay, vocabulary, exercises

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
        "Cultural Erosion and Social Problems", "Key Topic Vocabulary and Collocations", "Practice Exercises"
    ]
    for h in headers:
        formatted = re.sub(rf'(?im)^[ \t]*({re.escape(h)})[ \t]*$', rf'### \1\n', formatted)
    
    return formatted

def parse_and_generate_all():
    articles = []
    article_order = 1

    # Part A: 18 Individual PDF files
    indiv_files = sorted([f for f in os.listdir(ARTICLES_DIR) if f.endswith('.pdf') and f != 'IDEA BOOK.pdf'], 
                         key=lambda x: int(re.match(r'(\d+)', x).group(1)) if re.match(r'(\d+)', x) else 999)

    print(f"Processing {len(indiv_files)} individual PDF files with MarkItDown...")
    for filename in indiv_files:
        filepath = os.path.join(ARTICLES_DIR, filename)
        try:
            res = md_converter.convert(filepath)
            raw_text = res.text_content
        except Exception:
            reader = pypdf.PdfReader(filepath)
            raw_text = "\n".join([p.extract_text() for p in reader.pages])

        clean_file_name = re.sub(r'^\d+\.\s*', '', filename.replace('.pdf', '')).strip()
        title = clean_title(clean_file_name)

        main_essay, vocabulary, exercises = extract_vocab_and_exercises_precise(raw_text)
        main_essay = format_bold_highlights(main_essay)
        category = guess_category(title, main_essay)

        slug = slugify(title)
        if any(a['slug'] == slug for a in articles):
            slug = f"{slug}-{article_order}"

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
            "image_url": "", # Placeholder: admin panel orqali rasm yuklanadi
            "excerpt": excerpt,
            "content": main_essay,
            "vocabulary": vocabulary,
            "exercises": exercises,
            "source": filename
        }

        articles.append(art_obj)

        # Save individual JSON file
        json_filename = f"{article_order:03d}_{slug}.json"
        with open(os.path.join(ARTICLES_JSON_DIR, json_filename), 'w', encoding='utf-8') as f:
            json.dump(art_obj, f, ensure_ascii=False, indent=2)
        with open(os.path.join(SRC_ARTICLES_DIR, json_filename), 'w', encoding='utf-8') as f:
            json.dump(art_obj, f, ensure_ascii=False, indent=2)

        # Save individual Markdown file
        md_filename = f"{article_order:03d}_{slug}.md"
        with open(os.path.join(ARTICLES_MD_DIR, md_filename), 'w', encoding='utf-8') as f:
            f.write(f"# {title}\n\n**Category:** {category} | **Level:** {art_obj['level']} | **Time:** {read_time} | **Access:** {'FREE' if is_free else 'PREMIUM'}\n\n---\n\n{main_essay}\n")

        print(f"  [{article_order:02d}] {filename}: {word_count} words in essay, {len(vocabulary)} vocab terms, {len(exercises)} exercises")
        article_order += 1

    print(f"\nProcessing distinct topics from IDEA BOOK.pdf...")

    # Part B: Accurate Topic Page Boundaries in IDEA BOOK.pdf
    idea_book_path = os.path.join(ARTICLES_DIR, 'IDEA BOOK.pdf')
    reader = pypdf.PdfReader(idea_book_path)
    total_pages = len(reader.pages)

    # Scan for top-level topics and their starting pages
    topic_starts = []
    for p_idx, page in enumerate(reader.pages):
        txt = page.extract_text()
        lines = [l.strip() for l in txt.split('\n') if l.strip()]
        for line in lines[:6]:
            if 'iSTUDY_ACADEMY' in line or 'NEVER SAY NEVER' in line or re.match(r'^\d+$', line):
                continue
            
            # Match top-level IELTS topic titles
            m_num = re.match(r'^(\d+)\.\s+([A-Z][a-zA-Z\s\:\,\-\–\—\(\)\/\'\"]{4,})', line)
            m_topic = re.match(r'^(?:Topic:\s*)((?:Pros and [cC]ons|Advantages and [dD]isadvantages|Causes,\s*Effects|Causes and [sS]olutions|Causes,\s*Effects,\s*and [sS]olutions|Meaning,\s*Causes|Definition of|Extreme Sports|Nursing Homes|Ageing Population|Poverty|Health Issues|Alternative Energy|Nuclear Energy|Driverless Cars|Being a Celebrity|Artificial Intelligence|Switching Jobs|Space Exploration|Fast-Food|Self-Driving|Juvenile Delinquency|Generation Gap|Consumerism|Vegetarian Diets|Branding|Cheap Travelling|Migration|Crime|GMO|Plastic Pollution|Robot Teachers)[^\n]*)', line, flags=re.IGNORECASE)
            
            if m_num:
                cand = m_num.group(2).strip()
                if not any(cand.lower().startswith(sub) for sub in ['crime prevention', 'enhanced public', 'evidence collection', 'workplace monitoring', 'traffic management', 'privacy concerns', 'high installation', 'misuse of', 'false sense', 'ethical and', 'digital distraction', 'inequality of', 'overdependence', 'technical issues', 'gathering proof', 'damage or', 'continuous observation', 'feeling safe', 'interference with', 'disadvantages of robot', 'many families', 'poor families', 'restaurants are', 'extreme sports often', 'elderly people', 'self-driving cars face', 'homework often']):
                    if not any(t['page'] == p_idx for t in topic_starts):
                        topic_starts.append({"page": p_idx, "title": cand})
                        break
            elif m_topic:
                cand = m_topic.group(1).strip()
                if not any(t['page'] == p_idx for t in topic_starts):
                    topic_starts.append({"page": p_idx, "title": cand})
                    break

    # Build topic sections
    for i, t in enumerate(topic_starts):
        start_p = t["page"]
        end_p = topic_starts[i+1]["page"] if (i + 1) < len(topic_starts) else total_pages
        if end_p - start_p > 6:
            end_p = start_p + 4

        pages_text = [reader.pages[p].extract_text() for p in range(start_p, end_p)]
        full_topic_text = "\n\n".join(pages_text)

        title = clean_title(t["title"])
        main_essay, vocabulary, exercises = extract_vocab_and_exercises_precise(full_topic_text)
        main_essay = format_bold_highlights(main_essay)
        category = guess_category(title, main_essay)

        base_slug = slugify(title)
        slug = base_slug
        count = 1
        while any(a['slug'] == slug for a in articles):
            slug = f"{base_slug}-{count}"
            count += 1

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
            "image_url": "", # Placeholder: admin panel orqali rasm yuklanadi
            "excerpt": excerpt,
            "content": main_essay,
            "vocabulary": vocabulary,
            "exercises": exercises,
            "source": f"IDEA BOOK.pdf (Pages {start_p+1}-{end_p})"
        }

        articles.append(art_obj)

        # Save individual JSON file
        json_filename = f"{article_order:03d}_{slug}.json"
        with open(os.path.join(ARTICLES_JSON_DIR, json_filename), 'w', encoding='utf-8') as f:
            json.dump(art_obj, f, ensure_ascii=False, indent=2)
        with open(os.path.join(SRC_ARTICLES_DIR, json_filename), 'w', encoding='utf-8') as f:
            json.dump(art_obj, f, ensure_ascii=False, indent=2)

        # Save individual Markdown file
        md_filename = f"{article_order:03d}_{slug}.md"
        with open(os.path.join(ARTICLES_MD_DIR, md_filename), 'w', encoding='utf-8') as f:
            f.write(f"# {title}\n\n**Category:** {category} | **Level:** {art_obj['level']} | **Time:** {read_time} | **Access:** {'FREE' if is_free else 'PREMIUM'}\n\n---\n\n{main_essay}\n")

        article_order += 1

    # Save to Master JSON
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"\n==========================================")
    print(f"Total articles generated: {len(articles)}")
    print(f"   Free articles:    {sum(1 for a in articles if a['is_free'])}")
    print(f"   Premium articles: {sum(1 for a in articles if not a['is_free'])}")
    print(f"==========================================")

if __name__ == '__main__':
    parse_and_generate_all()
