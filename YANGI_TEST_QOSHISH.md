# 📝 Yangi Test Qo'shish Bo'yicha Ko'rsatma

## Umumiy tuzilma

```
src/data/
├── tests.js                        ← Test ro'yxatlari (dashboard uchun)
├── listening/
│   ├── listening1.json             ← Listening Test 1
│   ├── listening2.json             ← Listening Test 2
│   └── ...
└── reading/
    ├── reading1.json               ← Reading Test 1
    ├── reading2.json               ← Reading Test 2
    └── ...
```

---

## 🚀 Yangi test qo'shish (faqat 2 qadam!)

### 1-qadam: JSON fayl yarating

Fayl nomi qoidasi:
- Listening: `src/data/listening/listening{RAQAM}.json`
- Reading: `src/data/reading/reading{RAQAM}.json`

Masalan: `listening2.json`, `reading5.json`

### 2-qadam: `src/data/tests.js` ga qo'shing

```js
export const listeningTests = [
  { id: 1, title: "Listening Test 1", ... },   // mavjud
  {
    id: 2,
    title: "Listening Test 2",
    description: "4-Part Listening · 40 Questions",
    duration: 40,
    level: "medium",           // "easy", "medium", "hard"
    testType: "full_test",     // "full_test", "section_1", "part_2", etc.
    questions: 40,
    access: "free",            // "free" yoki "premium"
    completed: false,
  },
];
```

> ⚠️ **Muhim:** `id` raqami JSON fayl nomidagi raqamga mos bo'lishi kerak!
> `id: 2` → `listening2.json` yuklaydi

**Tamom!** `page.js` faylga tegish shart emas.

---

## 📋 JSON fayl tuzilishi

### Listening formati

```json
{
  "title": "Listening Test 1",
  "testType": "full_test",
  "level": "medium",
  "timer": 40,
  "totalQuestions": 40,
  "sections": [
    { ... savol bloki 1 ... },
    { ... savol bloki 2 ... }
  ]
}
```

### Reading formati

```json
{
  "title": "Reading Test 1",
  "testType": "full_test",
  "level": "medium",
  "timer": 60,
  "totalQuestions": 40,
  "passages": [
    {
      "id": "passage_1",
      "title": "Passage sarlavhasi",
      "text": "Passage matni... paragraflar \\n\\n bilan ajratiladi",
      "questions": [
        { ... savol bloki 1 ... },
        { ... savol bloki 2 ... }
      ]
    }
  ]
}
```

---

## 🔑 Wrapper metadata maydonlari

| Maydon | Turi | Tavsif | Misol |
|--------|------|--------|-------|
| `title` | string | Test nomi | `"Listening Test 1"` |
| `testType` | string | Test turi | `"full_test"`, `"section_1"`, `"part_2"` |
| `level` | string | Qiyinlik darajasi | `"easy"`, `"medium"`, `"hard"` |
| `timer` | number | Vaqt (daqiqada) | `40`, `60`, `20` |
| `totalQuestions` | number | Umumiy savollar soni | `40`, `10` |

> **Timer haqida:** JSON dagi `timer` qiymati test sahifasidagi timer uchun ishlatiladi.
> Masalan `"timer": 20` → 20 daqiqalik test bo'ladi.

---

## 📋 Savol bloklari (3 tur)

Har bir savol blokida `title` maydoni bo'lishi mumkin (section sarlavhasi):

### 1. `gap_fill` — Bo'sh joylarni to'ldirish

```json
{
  "id": "section1_notes",
  "type": "gap_fill",
  "title": "Section 1: Music Alive Agency",
  "instruction": "Complete the notes below. Write ONE WORD AND/OR A NUMBER.",
  "content": "Contact person: Jim Granley\n- Members' details are on a {1}\n- Type of music: {2} and jazz\n- Cost: £{3}",
  "answers": {
    "1": "database",
    "2": "rock",
    "3": "45"
  }
}
```

**Qoidalar:**
- `content` ichida `{raqam}` — savol placeholder
- `answers` ichida **kalit = raqam** (string), **qiymat = to'g'ri javob**
- `\n` — yangi qator uchun
- Raqamlar ketma-ket: `{1}`, `{2}`, `{3}` ...
- `title` — ixtiyoriy, section nomi (Listening uchun ko'rinadi)

---

### 2. `true_false` — True/False/Not Given, Yes/No/Not Given, MCQ

```json
{
  "id": "section2_mcq",
  "type": "true_false",
  "title": "Section 2: Albany Fishing Competition",
  "instruction": "Choose the correct letter A, B or C.",
  "options": ["A", "B", "C"],
  "questions": [
    { "id": "11", "text": "What do participants need to bring?" },
    { "id": "12", "text": "What does the entrance fee include?" }
  ],
  "answers": { "11": "A", "12": "B" }
}
```

**Options variantlari:**
- `["TRUE", "FALSE", "NOT GIVEN"]`
- `["YES", "NO", "NOT GIVEN"]`
- `["A", "B", "C"]`
- `["A", "B", "C", "D"]`
- `["A", "B", "C", "D", "E"]`

---

### 3. `matrix_match` — Matching / Map Labeling

```json
{
  "id": "section2_map",
  "type": "matrix_match",
  "title": "Section 2: Map Labeling",
  "instruction": "Label the map. Choose the correct letter A-H.",
  "columnOptions": ["A", "B", "C", "D", "E", "F", "G", "H"],
  "legend": [
    "A: the realistic colours",
    "B: the sense of space",
    "C: the unusual interpretation"
  ],
  "questions": [
    { "id": "14", "text": "Registration area" },
    { "id": "15", "text": "Shore fishing area" }
  ],
  "answers": { "14": "E", "15": "A" }
}
```

**Qoidalar:**
- `columnOptions` — ustundagi variantlar
- `legend` — ixtiyoriy, variant tavsiflar ro'yxati (Listening sahifasida ko'rsatiladi)
- `note` — ixtiyoriy, qo'shimcha eslatma

---

## 🔢 testType qiymatlari

| Qiymat | Ma'nosi | Misol |
|--------|---------|-------|
| `full_test` | To'liq test (40 savol) | Listening Full Test |
| `section_1` | Faqat Section 1 | Listening Section 1 |
| `section_2` | Faqat Section 2 | Listening Section 2 |
| `part_1` | Faqat Part 1 | Reading Part 1 |
| `part_2` | Faqat Part 2 | Reading Part 2 |

> Section yoki Part test qilmoqchi bo'lsangiz, JSON faylga faqat o'sha section/part savollarini qo'ying va `timer` ni mos ravishda kamayting (masalan 10-15 daqiqa).

---

## 📐 To'liq Listening JSON namunasi

```json
{
  "title": "Listening Section 1 Practice",
  "testType": "section_1",
  "level": "easy",
  "timer": 10,
  "totalQuestions": 10,
  "sections": [
    {
      "id": "s1_notes",
      "type": "gap_fill",
      "title": "Section 1: Booking Details",
      "instruction": "Complete the notes below. Write ONE WORD AND/OR A NUMBER.",
      "content": "Booking Details\\n\\nName: {1}\\nPhone: {2}\\nDate: {3} March",
      "answers": { "1": "Smith", "2": "07456", "3": "15" }
    },
    {
      "id": "s1_mcq",
      "type": "true_false",
      "title": "Section 1: Multiple Choice",
      "instruction": "Choose the correct letter A, B or C.",
      "options": ["A", "B", "C"],
      "questions": [
        { "id": "4", "text": "What time does the event start?" },
        { "id": "5", "text": "How much does a ticket cost?" }
      ],
      "answers": { "4": "B", "5": "A" }
    }
  ]
}
```

## 📐 To'liq Reading JSON namunasi

```json
{
  "title": "Reading Part 1 Practice",
  "testType": "part_1",
  "level": "hard",
  "timer": 20,
  "totalQuestions": 13,
  "passages": [
    {
      "id": "passage_1",
      "title": "Optimism and Health",
      "text": "Medical studies are concluding that optimists really do have something to be cheerful about...",
      "questions": [
        {
          "id": "p1_summary",
          "type": "gap_fill",
          "instruction": "Complete the summary. Write NO MORE THAN TWO WORDS.",
          "content": "A positive attitude can lengthen lifespan by {1}. A study on {2} male subjects...",
          "answers": { "1": "seven years", "2": "670" }
        },
        {
          "id": "p1_tfng",
          "type": "true_false",
          "instruction": "Do the following statements agree with the claims of the writer?",
          "options": ["YES", "NO", "NOT GIVEN"],
          "questions": [
            { "id": "3", "text": "Optimism has been linked to good health." }
          ],
          "answers": { "3": "YES" }
        }
      ]
    }
  ]
}
```

---

## ⚠️ Eng ko'p uchraydigan xatolar

| Xato | Tuzatish |
|------|----------|
| Test topilmadi (404) | JSON fayl nomi `listening{ID}.json` formatda, `tests.js` dagi `id` bilan mos |
| Savol chiqmaydi | `type` to'g'ri: `gap_fill`, `true_false`, `matrix_match` |
| Javob noto'g'ri hisoblanadi | `answers` kaliti `questions[].id` bilan aynan mos |
| Timer ishlamaydi | JSON da `"timer": 40` (raqam, string emas!) |
| Passage chiqmaydi (Reading) | `passages` massivi ichida `text` maydoni bo'lishi kerak |
| Section sarlavha chiqmaydi (Listening) | Savol blokiga `"title": "Section 1: ..."` qo'shing |

---

## 🎯 Checklist

- [ ] JSON fayl yaratildi (`listeningN.json` yoki `readingN.json`)
- [ ] JSON wrapper to'g'ri: `title`, `testType`, `level`, `timer`, `totalQuestions`
- [ ] Reading: `passages` massivi ichida `id`, `title`, `text`, `questions`
- [ ] Listening: `sections` massivi ichida savol bloklari
- [ ] Har bir savol blokida `id`, `type`, `instruction`, `answers`
- [ ] `tests.js` ga yangi test qo'shildi (id, level, testType mos)
- [ ] Brauzerda `/dashboard/listening/N` yoki `/dashboard/reading/N` ochib tekshirildi

---

## 🎛️ Filterlar

Dashboard dagi test ro'yxatida quyidagi filterlar mavjud:

| Filter | Qiymatlar |
|--------|-----------|
| **Tabs** | All Tests, Free, Premium |
| **Level** | All Levels, Easy, Medium, Hard |
| **Type** | All Types, Full Test, Section, Part |
| **Search** | Test nomidan qidirish |
