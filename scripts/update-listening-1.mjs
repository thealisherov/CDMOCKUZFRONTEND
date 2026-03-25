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
const supabase = createClient(supabaseUrl, supabaseKey);

const testData = {
  "id": "cambridge-listening-1",
  "title": "Cambridge Listening 1",
  "testFormat": "full_test",
  "testType": "volume",
  "level": "medium",
  "timer": 40,
  "totalQuestions": 40,
  "testTution": "paid",
  "audio": "Cambridge listening 1",
  "parts": [
    {
      "partNumber": 1,
      "questionRange": "1-10",
      "image": null,
      "questionGroups": [
        {
          "groupType": "note_completion",
          "instruction": "Complete the notes below. Write ONE WORD for each answer.",
          "questions": [
            {
              "number": 1,
              "question": "<b>SELF-DRIVE TOURS IN THE USA</b><br>Example<br>Name: Andrea Brown<br>Address: 24 ______ Road",
              "answer": "Ardleigh",
              "alternativeAnswers": ["ardleigh", "ARDLEIGH"]
            },
            {
              "number": 2,
              "question": "Postcode: BH5 2OP<br>Phone: (mobile) 077 8664 3091<br>Heard about company from: ______",
              "answer": "newspaper",
              "alternativeAnswers": ["Newspaper", "NEWSPAPER"]
            },
            {
              "number": 3,
              "question": "<b>Possible self-drive tours</b><br><b>Trip One:</b><ul><li>Los Angeles: customer wants to visit some ______ parks with her children</li></ul>",
              "answer": "theme",
              "alternativeAnswers": ["Theme", "THEME"]
            },
            {
              "number": 4,
              "question": "<ul><li>Yosemite Park: customer wants to stay in a lodge, not a ______</li></ul>",
              "answer": "tent",
              "alternativeAnswers": ["Tent", "TENT"]
            },
            {
              "number": 5,
              "question": "<b>Trip Two:</b><ul><li>Customer wants to see the ______ on the way to Cambria</li></ul>",
              "answer": "castle",
              "alternativeAnswers": ["Castle", "CASTLE"]
            },
            {
              "number": 6,
              "question": "<ul><li>At Santa Monica: not interested in shopping</li><li>At San Diego, wants to spend time on the ______</li></ul>",
              "answer": "beach",
              "alternativeAnswers": ["Beach", "BEACH", "beaches", "Beaches"]
            }
          ]
        },
        {
          "groupType": "table_completion",
          "instruction": "Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
          "questions": [
            {
              "number": 0,
              "question": "&nbsp; | Number of days | Total distance | Price (per person) | Includes",
              "answer": ""
            },
            {
              "number": 7,
              "question": "<b>Trip One</b> | 12 days | {7} km | £525 | <ul><li>accommodation</li><li>car</li><li>one {8}</li></ul>",
              "answer": "2020",
              "alternativeAnswers": []
            },
            {
              "number": 8,
              "question": "#hidden#",
              "answer": "flight",
              "alternativeAnswers": ["Flight", "FLIGHT"]
            },
            {
              "number": 9,
              "question": "<b>Trip Two</b> | 9 days | 980 km | £{9} | <ul><li>accommodation</li><li>car</li><li>{10}</li></ul>",
              "answer": "429",
              "alternativeAnswers": []
            },
            {
              "number": 10,
              "question": "#hidden#",
              "answer": "dinner",
              "alternativeAnswers": ["Dinner", "DINNER"]
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
          "groupType": "multiple_choice_multiple_answer",
          "instruction": "Choose TWO letters A-E. Which TWO facilities at the leisure club have recently been improved?",
          "options": [
            "A the gym",
            "B the tracks",
            "C the indoor pool",
            "D the outdoor pool",
            "E the sports training for children"
          ],
          "questions": [
            {
              "number": 11,
              "question": "First facility:",
              "answer": "A"
            },
            {
              "number": 12,
              "question": "Second facility:",
              "answer": "C"
            }
          ]
        },
        {
          "groupType": "note_completion",
          "instruction": "Complete the notes below. Write NO MORE THEN TWO WORDS for each answer.",
          "questions": [
            {
              "number": 13,
              "question": "<b>Joining the leisure club</b><br><b>Personal Assessment</b><ul><li>New members should describe any ______ .</li></ul>",
              "answer": "health problems",
              "alternativeAnswers": ["Health problems", "HEALTH PROBLEMS"]
            },
            {
              "number": 14,
              "question": "<ul><li>The ______ will be explained to you before you use the equipment.</li></ul>",
              "answer": "safety rules",
              "alternativeAnswers": ["Safety rules", "SAFETY RULES"]
            },
            {
              "number": 15,
              "question": "<ul><li>You will be given a six-week ______ .</li></ul>",
              "answer": "plan",
              "alternativeAnswers": ["Plan", "PLAN"]
            },
            {
              "number": 16,
              "question": "<b>Types of membership</b><ul><li>There is a compulsory £90 ______ fee for members.</li></ul>",
              "answer": "joining",
              "alternativeAnswers": ["Joining", "JOINING"]
            },
            {
              "number": 17,
              "question": "<ul><li>Gold members are given ______ to all the LP clubs.</li></ul>",
              "answer": "free entry",
              "alternativeAnswers": ["Free entry", "FREE ENTRY"]
            },
            {
              "number": 18,
              "question": "<ul><li>Premier members are given priority during ______ hours.</li></ul>",
              "answer": "peak",
              "alternativeAnswers": ["Peak", "PEAK"]
            },
            {
              "number": 19,
              "question": "<ul><li>Premier members can bring some ______ every month.</li></ul>",
              "answer": "guests",
              "alternativeAnswers": ["Guests", "GUESTS"]
            },
            {
              "number": 20,
              "question": "<ul><li>Members should always take their ______ with them.</li></ul>",
              "answer": "photo card",
              "alternativeAnswers": ["Photo card", "photo cards", "Photo cards", "PHOTO CARD"]
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
          "groupType": "multiple_choice",
          "instruction": "Choose the correct letter, A, B or C.",
          "questions": [
            {
              "number": 21,
              "question": "<b>Global Design Competition</b><br>Students entering the design competition have to",
              "options": [
                "A produce an energy-efficient design.",
                "B adapt an existing energy-saving appliance.",
                "C develop a new use for current technology."
              ],
              "answer": "C"
            },
            {
              "number": 22,
              "question": "John chose a dishwasher because he wanted to make dishwashers",
              "options": [
                "A more appealing.",
                "B more common.",
                "C more economical."
              ],
              "answer": "A"
            },
            {
              "number": 23,
              "question": "The stone in John’s ‘Rockpool’ design is used",
              "options": [
                "A for decoration.",
                "B to switch it on.",
                "C to stop water escaping."
              ],
              "answer": "B"
            },
            {
              "number": 24,
              "question": "In the holding chamber, the carbon dioxide",
              "options": [
                "A changes back to a gas.",
                "B dries the dishes.",
                "C is allowed to cool."
              ],
              "answer": "A"
            },
            {
              "number": 25,
              "question": "At the end of the cleaning process, the carbon dioxide",
              "options": [
                "A is released into the air.",
                "B is disposed of with the waste.",
                "C is collected ready to be re-used."
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
              "number": 26,
              "question": "<ul><li>John needs help preparing for his ______ .</li></ul>",
              "answer": "presentation",
              "alternativeAnswers": ["Presentation", "PRESENTATION"]
            },
            {
              "number": 27,
              "question": "<ul><li>The professor advises John to make a ______ of his design.</li></ul>",
              "answer": "model",
              "alternativeAnswers": ["Model", "MODEL"]
            },
            {
              "number": 28,
              "question": "<ul><li>John’s main problem is getting good quality ______ .</li></ul>",
              "answer": "material",
              "alternativeAnswers": ["Material", "materials", "Materials", "MATERIAL"]
            },
            {
              "number": 29,
              "question": "<ul><li>The professor suggests John apply for a ______ .</li></ul>",
              "answer": "grant",
              "alternativeAnswers": ["Grant", "GRANT"]
            },
            {
              "number": 30,
              "question": "<ul><li>The professor will check the ______ information in John’s written report.</li></ul>",
              "answer": "technical",
              "alternativeAnswers": ["Technical", "TECHNICAL"]
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
          "groupType": "note_completion",
          "instruction": "Complete the notes below. Write ONE WORD ONLY for each answer.",
          "questions": [
            {
              "number": 31,
              "question": "<b>THE SPIRIT BEAR</b><br><b>General facts</b><ul><li>It is a white bear belonging to the black bear family.</li><li>Its colour comes from an uncommon ______ .</li></ul>",
              "answer": "gene",
              "alternativeAnswers": ["Gene", "GENE"]
            },
            {
              "number": 32,
              "question": "<ul><li>Local people believe that it has unusual ______ .</li></ul>",
              "answer": "power",
              "alternativeAnswers": ["Power", "powers", "Powers", "POWER"]
            },
            {
              "number": 33,
              "question": "<ul><li>They protect the bear from ______ .</li></ul>",
              "answer": "strangers",
              "alternativeAnswers": ["Strangers", "STRANGERS"]
            },
            {
              "number": 34,
              "question": "<b>Habitat</b><ul><li>The bear’s relationship with the forest is complex.</li><li>Tree roots stop ______ along salmon streams.</li></ul>",
              "answer": "erosion",
              "alternativeAnswers": ["Erosion", "EROSION"]
            },
            {
              "number": 35,
              "question": "<ul><li>The bears’ feeding habits provide nutrients for forest vegetation.</li><li>It is currently found on a small number of ______ .</li></ul>",
              "answer": "islands",
              "alternativeAnswers": ["Islands", "ISLANDS"]
            },
            {
              "number": 36,
              "question": "<b>Threats</b><ul><li>Habitat is being lost due to deforestation and construction of ______ by logging companies.</li></ul>",
              "answer": "roads",
              "alternativeAnswers": ["Roads", "ROADS"]
            },
            {
              "number": 37,
              "question": "<ul><li>Unrestricted ______ is affecting the salmon supply.</li></ul>",
              "answer": "fishing",
              "alternativeAnswers": ["Fishing", "FISHING"]
            },
            {
              "number": 38,
              "question": "<ul><li>The bears’ existence is also threatened by their low rate of ______ .</li></ul>",
              "answer": "reproduction",
              "alternativeAnswers": ["Reproduction", "REPRODUCTION"]
            },
            {
              "number": 39,
              "question": "<b>Going forward</b><ul><li>Interested parties are working together.</li><li>Logging companies must improve their ______ of logging.</li></ul>",
              "answer": "method",
              "alternativeAnswers": ["Method", "methods", "Methods", "METHOD"]
            },
            {
              "number": 40,
              "question": "<ul><li>Maintenance and ______ of the spirit bears’ territory is needed.</li></ul>",
              "answer": "expansion",
              "alternativeAnswers": ["Expansion", "EXPANSION"]
            }
          ]
        }
      ]
    }
  ]
};

async function updateTest() {
  const { error } = await supabase
    .from("Tests")
    .update({ data: testData })
    .eq("test_id", "cambridge-listening-1");

  if (error) console.error("Error updating test:", error);
  else console.log("✅ Successfully updated cambridge-listening-1 !!");
}

updateTest();
