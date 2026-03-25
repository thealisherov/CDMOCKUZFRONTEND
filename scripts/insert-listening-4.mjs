import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) env[key.trim()] = val.join("=").trim();
});

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testData = {
  "id": "cambridge-listening-4",
  "title": "Cambridge Listening 4",
  "testFormat": "full_test",
  "testType": "volume",
  "level": "medium",
  "timer": 30.5,
  "totalQuestions": 40,
  "testTution": "free",
  "audio": "https://pub-359de657d62948868dbf1b069ed70702.r2.dev/Cambridge%20Listening/Cambridge-10%20Listening-Test-4.mp3",
  "parts": [
    {
      "partNumber": 1,
      "questionRange": "1-10",
      "image": null,
      "questionGroups": [
        {
          "groupType": "note_completion",
          "instruction": "Complete the notes below. Write ONE WORD ONLY for each answer.",
          "questions": [
            {
              "number": 1,
              "question": "<b>THORNDYKE’S BUILDERS</b><br>Example<br>Customer heard about Thorndyke’s from a friend<br>Name: Edith ______",
              "answer": "Pargetter",
              "alternativeAnswers": ["pargetter", "PARGETTER"]
            },
            {
              "number": 2,
              "question": "Address: Flat 4,<br>______ Park Flats",
              "answer": "East",
              "alternativeAnswers": ["east", "EAST"]
            },
            {
              "number": 3,
              "question": "(Behind the ______) ",
              "answer": "library",
              "alternativeAnswers": ["Library", "LIBRARY"]
            },
            {
              "number": 4,
              "question": "Phone number: 875934<br>Best time to contact customer: during the ______",
              "answer": "morning",
              "alternativeAnswers": ["mornings", "Morning", "Mornings", "MORNING", "MORNINGS"]
            },
            {
              "number": 5,
              "question": "Where to park: opposite entrance next to the ______",
              "answer": "postbox",
              "alternativeAnswers": ["Postbox", "POSTBOX"]
            },
            {
              "number": 6,
              "question": "Needs full quote showing all the jobs and the ______",
              "answer": "prices",
              "alternativeAnswers": ["Prices", "PRICES"]
            }
          ]
        },
        {
          "groupType": "note_completion",
          "instruction": "Complete the table below. Write ONE WORD ONLY for each answer.",
          "questions": [
            {
              "number": 7,
              "question": "<b>Kitchen</b><ul><li>Replace the ______ in the door (Fix tomorrow)</li></ul>",
              "answer": "glass",
              "alternativeAnswers": ["Glass", "GLASS"]
            },
            {
              "number": 8,
              "question": "<ul><li>Paint wall above the ______</li></ul>",
              "answer": "cooker",
              "alternativeAnswers": ["Cooker", "COOKER"]
            },
            {
              "number": 9,
              "question": "<ul><li>Strip paint and plaster approximately one ______ in advance</li></ul>",
              "answer": "week",
              "alternativeAnswers": ["Week", "WEEK"]
            },
            {
              "number": 10,
              "question": "<b>Garden</b><ul><li>One ______ needs replacing (end of garden)</li></ul>",
              "answer": "fence",
              "alternativeAnswers": ["Fence", "FENCE"]
            }
          ]
        }
      ]
    },
    {
      "partNumber": 2,
      "questionRange": "11-20",
      "image": null,
      "questionGroups": [
        {
          "groupType": "multiple_choice",
          "instruction": "Choose the correct letter, A, B or C.",
          "questions": [
            {
              "number": 11,
              "question": "<b>MANHAM PORT</b><br>Why did a port originally develop at Manham?",
              "options": [
                "A It was safe from enemy attack.",
                "B It was convenient for river transport.",
                "C It had a good position on the sea coast."
              ],
              "answer": "B"
            },
            {
              "number": 12,
              "question": "What caused Manham’s sudden expansion during the Industrial Revolution?",
              "options": [
                "A the improvement in mining techniques",
                "B the increase in demand for metals",
                "C the discovery of tin in the area"
              ],
              "answer": "B"
            },
            {
              "number": 13,
              "question": "Why did rocks have to be sent away from Manham to be processed?",
              "options": [
                "A shortage of fuel",
                "B poor transport systems",
                "C lack of skills among local people"
              ],
              "answer": "A"
            },
            {
              "number": 14,
              "question": "What happened when the port declined in the twentieth century?",
              "options": [
                "A The workers went away.",
                "B Traditional skills were lost.",
                "C Buildings were used for new purposes."
              ],
              "answer": "A"
            },
            {
              "number": 15,
              "question": "What did the Manham Trust hope to do?",
              "options": [
                "A discover the location of the original port",
                "B provide jobs for the unemployed",
                "C rebuild the port complex"
              ],
              "answer": "C"
            }
          ]
        },
        {
          "groupType": "note_completion",
          "instruction": "Complete the table below. Write NO MORE THAN TWO WORDS for each answer.",
          "questions": [
            {
              "number": 16,
              "question": "<b>Tourist attractions in Manham</b><br><b>copper mine</b><ul><li>specially adapted miners’ ______ take visitors into the mountain</li></ul>",
              "answer": "trains",
              "alternativeAnswers": ["Trains", "TRAINS"]
            },
            {
              "number": 17,
              "question": "<ul><li>the mine is ______ and enclosed – unsuitable for children and animals</li></ul>",
              "answer": "dark",
              "alternativeAnswers": ["Dark", "DARK"]
            },
            {
              "number": 18,
              "question": "<b>village school</b><ul><li>classrooms and a special exhibition of ______</li></ul>",
              "answer": "games",
              "alternativeAnswers": ["Games", "GAMES"]
            },
            {
              "number": 19,
              "question": "<ul><li>a ______ is recommended</li></ul>",
              "answer": "guided tour",
              "alternativeAnswers": ["Guided tour", "GUIDED TOUR"]
            },
            {
              "number": 20,
              "question": "<b>‘The George’ (old sailing ship)</b><ul><li>the ship’s wheel (was lost but has now been restored)</li><li>children shouldn’t use the ______</li></ul>",
              "answer": "ladder",
              "alternativeAnswers": ["ladders", "Ladder", "Ladders", "LADDER", "LADDERS"]
            }
          ]
        }
      ]
    },
    {
      "partNumber": 3,
      "questionRange": "21-30",
      "image": null,
      "questionGroups": [
        {
          "groupType": "multiple_choice_multiple_answer",
          "instruction": "Choose TWO letters, A-E. Which TWO skills did Laura improve as a result of her work placement?",
          "options": [
            "A communication",
            "B design",
            "C IT",
            "D marketing",
            "E organisation"
          ],
          "questions": [
            {
              "number": 21,
              "question": "First skill:",
              "answer": "A"
            },
            {
              "number": 22,
              "question": "Second skill:",
              "answer": "E"
            }
          ]
        },
        {
          "groupType": "multiple_choice_multiple_answer",
          "instruction": "Choose TWO letters, A-E. Which TWO immediate benefits did the company get from Laura’s work placement?",
          "options": [
            "A updates for its software",
            "B cost savings",
            "C an improved image",
            "D new clients",
            "E a growth in sales"
          ],
          "questions": [
            {
              "number": 23,
              "question": "First benefit:",
              "answer": "B"
            },
            {
              "number": 24,
              "question": "Second benefit:",
              "answer": "C"
            }
          ]
        },
        {
          "groupType": "matching",
          "instruction": "What source of information should Tim use at each of the following stages of the work placement? Choose SIX answers from the box and write the correct letter, A-G, next to questions 25-30.",
          "options": [
            "A company manager",
            "B company’s personnel department",
            "C personal tutor",
            "D psychology department",
            "E mentor",
            "F university careers officer",
            "G internet"
          ],
          "questions": [
            {
              "number": 25,
              "question": "obtaining booklet",
              "answer": "D"
            },
            {
              "number": 26,
              "question": "discussing options",
              "answer": "F"
            },
            {
              "number": 27,
              "question": "getting updates",
              "answer": "G"
            },
            {
              "number": 28,
              "question": "responding to invitation for interview",
              "answer": "B"
            },
            {
              "number": 29,
              "question": "informing about outcome of interview",
              "answer": "E"
            },
            {
              "number": 30,
              "question": "requesting a reference",
              "answer": "C"
            }
          ]
        }
      ]
    },
    {
      "partNumber": 4,
      "questionRange": "31-40",
      "image": null,
      "questionGroups": [
        {
          "groupType": "multiple_choice",
          "instruction": "Choose the correct letter, A, B or C.",
          "questions": [
            {
              "number": 31,
              "question": "<b>Nanotechnology: technology on a small scale</b><br>The speaker says that one problem with nanotechnology is that",
              "options": [
                "A it could threaten our way of life.",
                "B it could be used to spy on people.",
                "C it is misunderstood by the public."
              ],
              "answer": "C"
            },
            {
              "number": 32,
              "question": "According to the speaker, some scientists believe that nono-particles",
              "options": [
                "A should be restricted to secure environments.",
                "B should be used with more caution.",
                "C should only be developed for essential products."
              ],
              "answer": "B"
            },
            {
              "number": 33,
              "question": "In the speaker’s opinion, research into nanotechnology",
              "options": [
                "A has yet to win popular support.",
                "B could be seen as unethical.",
                "C ought to be continued."
              ],
              "answer": "C"
            }
          ]
        },
        {
          "groupType": "note_completion",
          "instruction": "Complete the notes below. Write ONE WORD ONLY for each answer.",
          "questions": [
            {
              "number": 34,
              "question": "<b>Uses of Nanotechnology</b><br><b>Transport</b><ul><li>Nanotechnology could allow the development of stronger ______</li></ul>",
              "answer": "metal",
              "alternativeAnswers": ["metals", "Metal", "Metals", "METAL", "METALS"]
            },
            {
              "number": 35,
              "question": "<ul><li>Planes would be much lighter in weight.</li><li>______ travel will be made available to the masses.</li></ul>",
              "answer": "space",
              "alternativeAnswers": ["Space", "SPACE"]
            },
            {
              "number": 36,
              "question": "<b>Technology</b><ul><li>Computers will be even smaller, faster, and will have a greater ______</li></ul>",
              "answer": "memory",
              "alternativeAnswers": ["Memory", "MEMORY"]
            },
            {
              "number": 37,
              "question": "<ul><li>______ Energy will become more affordable.</li></ul>",
              "answer": "solar",
              "alternativeAnswers": ["Solar", "SOLAR"]
            },
            {
              "number": 38,
              "question": "<b>The Environment</b><ul><li>Nano-robots could rebuild the ozone layer.</li><li>Pollutants such as ______ could be removed from water</li></ul>",
              "answer": "oil",
              "alternativeAnswers": ["Oil", "OIL"]
            },
            {
              "number": 39,
              "question": "<ul><li>There will be no ______ from manufacturing.</li></ul>",
              "answer": "waste",
              "alternativeAnswers": ["Waste", "WASTE"]
            },
            {
              "number": 40,
              "question": "<b>Health and Medicine</b><ul><li>New methods of food production could eradicate famine.</li><li>Analysis of medical ______ will be speeded up.</li><li>Life expectancy could be increased.</li></ul>",
              "answer": "tests",
              "alternativeAnswers": ["Tests", "TESTS"]
            }
          ]
        }
      ]
    }
  ]
};

async function insertTest() {
  const { data: existing, error: fetchErr } = await supabase
    .from("Tests")
    .select("id")
    .eq("test_id", testData.id)
    .single();

  if (existing) {
    const { error: upErr } = await supabase
      .from("Tests")
      .update({ data: testData })
      .eq("test_id", testData.id);
    if (upErr) console.error("Update match error:", upErr);
    else console.log("✅ Updated successfully:", testData.title);
  } else {
    const { error: insErr } = await supabase.from("Tests").insert({
      test_id: testData.id,
      type: "listening",
      data: testData
    });
    if (insErr) console.error("Insert match error:", insErr);
    else console.log("✅ Inserted successfully:", testData.title);
  }
}

insertTest();
