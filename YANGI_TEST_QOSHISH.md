# 📝 Yangi Test Qo'shish Bo'yicha Ko'rsatma

## Umumiy tuzilma

```
src/data/
├── tests.js                        ← Test ro'yxatlari (dashboard uchun)
├── listening/
│   ├── listening1.json             ← Listening Test 1 savollari
│   ├── listening2.json             ← Listening Test 2 savollari
│   └── ...
└── reading/
    ├── reading1.json               ← Reading Test 1 savollari
    ├── reading2.json               ← Reading Test 2 savollari
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
  { id: 2, title: "Listening Test 2", description: "Standard 4-Part Listening · 40 Questions", duration: 40, difficulty: "Medium", questions: 40, access: "free", completed: false },  // ← YANGI
];
```

> ⚠️ **Muhim:** `id` raqami JSON fayl nomidagi raqamga mos bo'lishi kerak!
> `id: 2` → `listening2.json` yuklaydi

**Tamom!** Boshqa hech qayerga tegish shart emas.

---

## 📋 JSON formatlar (Savol turlari)

Har bir JSON fayl — massiv (array). Ichida savol bloklari bo'ladi.
Quyida har bir savol turi uchun format va namuna keltirilgan.

---

### 1. `gap_fill` — Bo'sh joylarni to'ldirish

> Matn ichidagi `{1}`, `{2}` o'rniga input maydon chiqadi.

```json
{
  "id": "section1_notes",
  "type": "gap_fill",
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
- `\n` — yangi qator uchun (matn ichida)
- Raqamlar ketma-ket bo'lishi kerak: `{1}`, `{2}`, `{3}` ...

---

### 2. `true_false` — True/False/Not Given, Yes/No/Not Given, Multiple Choice (A/B/C)

> Radio tugmalar bilan javob tanlash.

#### True / False / Not Given:
```json
{
  "id": "p1_tfng",
  "type": "true_false",
  "instruction": "Do the following statements agree with the information given in the reading passage?",
  "options": ["TRUE", "FALSE", "NOT GIVEN"],
  "questions": [
    { "id": "11", "text": "Glass beads were the first glass objects ever made." },
    { "id": "12", "text": "Roman glassware was only found within the Roman Empire." }
  ],
  "answers": { "11": "TRUE", "12": "FALSE" }
}
```

#### Yes / No / Not Given:
```json
{
  "id": "p1_ynng",
  "type": "true_false",
  "instruction": "Do the following statements agree with the claims of the writer?",
  "options": ["YES", "NO", "NOT GIVEN"],
  "questions": [
    { "id": "11", "text": "There is a link between optimism and good health." },
    { "id": "12", "text": "Optimists have better relationships." }
  ],
  "answers": { "11": "YES", "12": "NOT GIVEN" }
}
```

#### Multiple Choice (A, B, C yoki A, B, C, D):
```json
{
  "id": "section2_mcq",
  "type": "true_false",
  "instruction": "Choose the correct letter A, B or C.",
  "options": ["A", "B", "C"],
  "questions": [
    { "id": "21", "text": "What do participants need to bring?" },
    { "id": "22", "text": "What does the entrance fee include?" }
  ],
  "answers": { "21": "A", "22": "B" }
}
```

**Qoidalar:**
- `type` doim `"true_false"` (MCQ uchun ham!)
- `options` — tanlash variantlari massivi
- `questions[].id` — savol raqami (string). Bu `answers` dagi kalitga mos bo'lishi kerak
- `answers` — kalit = savol id, qiymat = to'g'ri javob

---

### 3. `matrix_match` — Matching / Map Labeling

> Jadval ko'rinishida: har bir savolga A-H dan birini tanlash.

```json
{
  "id": "section2_map",
  "type": "matrix_match",
  "instruction": "Which paragraph contains the following information? Write the correct letter, A-H.",
  "columnOptions": ["A", "B", "C", "D", "E", "F", "G", "H"],
  "questions": [
    { "id": "14", "text": "a description of how a test showed evidence to be fake" },
    { "id": "15", "text": "reasons why scientists may be unwilling to admit" },
    { "id": "16", "text": "the result of a trick going wrong" }
  ],
  "answers": { "14": "E", "15": "A", "16": "F" }
}
```

**Qoidalar:**
- `columnOptions` — ustundagi variantlar (A, B, C, ...)
- Har bir qator (savol)ga faqat bitta variant tanlanadi
- Map labeling uchun ham xuddi shu format ishlatiladi

---

## 📐 To'liq JSON fayl namunasi (Listening)

```json
[
  {
    "id": "section1_notes",
    "type": "gap_fill",
    "instruction": "Complete the notes below. Write ONE WORD AND/OR A NUMBER.",
    "content": "Booking Details\n\nName: {1}\nPhone: {2}\nDate: {3} March",
    "answers": {
      "1": "Smith",
      "2": "07456",
      "3": "15"
    }
  },
  {
    "id": "section1_mcq",
    "type": "true_false",
    "instruction": "Choose the correct letter A, B or C.",
    "options": ["A", "B", "C"],
    "questions": [
      { "id": "4", "text": "What time does the event start?" },
      { "id": "5", "text": "How much does a ticket cost?" }
    ],
    "answers": { "4": "B", "5": "A" }
  },
  {
    "id": "section2_matching",
    "type": "matrix_match",
    "instruction": "Label the map. Choose the correct letter A-F.",
    "columnOptions": ["A", "B", "C", "D", "E", "F"],
    "questions": [
      { "id": "6", "text": "Reception" },
      { "id": "7", "text": "Library" },
      { "id": "8", "text": "Cafeteria" }
    ],
    "answers": { "6": "C", "7": "A", "8": "E" }
  }
]
```

---

## ⚠️ Eng ko'p uchraydigan xatolar

| Xato | Tuzatish |
|------|----------|
| Savol chiqmaydi | `type` to'g'ri yozilganmi tekshiring: `gap_fill`, `true_false`, `matrix_match` |
| Javob noto'g'ri hisoblanadi | `answers` dagi kalit `questions[].id` bilan **aynan mos** bo'lishi kerak |
| Test topilmadi (404) | JSON fayl nomi `listening{ID}.json` formatda bo'lishi kerak, `tests.js` dagi `id` bilan mos |
| Input chiqmaydi (gap_fill) | `content` ichida `{1}`, `{2}` figurniy qavslar bilan yozilganmi tekshiring |
| Natijada band score chiqmaydi | 40 ta savol bo'lishi zarur emas, lekin band score 40 taga asoslanadi |

---

## 🔢 Savol raqamlari haqida

Savol raqamlari **global tartib** bilan chiqadi. Masalan:

```
Block 1 (gap_fill):  {1}, {2}, {3}        →  Savollar: 1, 2, 3
Block 2 (true_false): id: "4", "5", "6"   →  Savollar: 4, 5, 6
Block 3 (matrix):     id: "7", "8"         →  Savollar: 7, 8
```

> `questions[].id` qiymatlari to'g'ri ketma-ketlikda bo'lishi kerak.
> Gap fill da `content` ichidagi raqamlar (`{1}`, `{2}`) global raqam bo'ladi.

---

## 🎯 Test qo'shish checklist

- [ ] JSON fayl yaratildi (`listeningN.json` yoki `readingN.json`)
- [ ] JSON to'g'ri format (massiv ichida bloklar)
- [ ] Har bir blokda `id`, `type`, `instruction`, `answers` bor
- [ ] `tests.js` ga yangi test qo'shildi
- [ ] `tests.js` dagi `id` va JSON fayl nomidagi raqam mos
- [ ] Brauzerda `/dashboard/listening/N` yoki `/dashboard/reading/N` ochib tekshirildi
