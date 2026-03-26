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

const test4 = {
  "id": "cambridge-listening-4",
  "audio": "https://pub-359de657d62948868dbf1b069ed70702.r2.dev/Cambridge%20Listening/Cambridge-10%20Listening-Test-4.mp3",
  "level": "medium",
  "parts": [
    {
      "image": null,
      "partNumber": 1,
      "questionRange": "1-10",
      "questionGroups": [
        {
          "groupType": "note_completion",
          "questions": [
            {
              "answer": "Pargetter",
              "number": 1,
              "question": "<b>THORNDYKE’S BUILDERS</b><br>Example<br>Customer heard about Thorndyke’s from a friend<br>Name: Edith ______",
              "alternativeAnswers": [
                "pargetter",
                "PARGETTER"
              ]
            },
            {
              "answer": "East",
              "number": 2,
              "question": "Address: Flat 4,<br>______ Park Flats",
              "alternativeAnswers": [
                "east",
                "EAST"
              ]
            },
            {
              "answer": "library",
              "number": 3,
              "question": "(Behind the ______) ",
              "alternativeAnswers": [
                "Library",
                "LIBRARY"
              ]
            },
            {
              "answer": "morning",
              "number": 4,
              "question": "Phone number: 875934<br>Best time to contact customer: during the ______",
              "alternativeAnswers": [
                "mornings",
                "Morning",
                "Mornings",
                "MORNING",
                "MORNINGS"
              ]
            },
            {
              "answer": "postbox",
              "number": 5,
              "question": "Where to park: opposite entrance next to the ______",
              "alternativeAnswers": [
                "Postbox",
                "POSTBOX"
              ]
            },
            {
              "answer": "prices",
              "number": 6,
              "question": "Needs full quote showing all the jobs and the ______",
              "alternativeAnswers": [
                "Prices",
                "PRICES"
              ]
            }
          ],
          "instruction": "Complete the notes below. Write ONE WORD ONLY for each answer."
        },
        {
          "groupType": "note_completion",
          "questions": [
            {
              "answer": "glass",
              "number": 7,
              "question": "<b>Kitchen</b><ul><li>Replace the ______ in the door (Fix tomorrow)</li></ul>",
              "alternativeAnswers": [
                "Glass",
                "GLASS"
              ]
            },
            {
              "answer": "cooker",
              "number": 8,
              "question": "<ul><li>Paint wall above the ______</li></ul>",
              "alternativeAnswers": [
                "Cooker",
                "COOKER"
              ]
            },
            {
              "answer": "week",
              "number": 9,
              "question": "<ul><li>Strip paint and plaster approximately one ______ in advance</li></ul>",
              "alternativeAnswers": [
                "Week",
                "WEEK"
              ]
            },
            {
              "answer": "fence",
              "number": 10,
              "question": "<b>Garden</b><ul><li>One ______ needs replacing (end of garden)</li></ul>",
              "alternativeAnswers": [
                "Fence",
                "FENCE"
              ]
            }
          ],
          "instruction": "Complete the table below. Write ONE WORD ONLY for each answer."
        }
      ]
    },
    {
      "image": null,
      "partNumber": 2,
      "questionRange": "11-20",
      "questionGroups": [
        {
          "groupType": "multiple_choice",
          "questions": [
            {
              "answer": "B",
              "number": 11,
              "options": [
                "A It was safe from enemy attack.",
                "B It was convenient for river transport.",
                "C It had a good position on the sea coast."
              ],
              "question": "<b>MANHAM PORT</b><br>Why did a port originally develop at Manham?"
            },
            {
              "answer": "B",
              "number": 12,
              "options": [
                "A the improvement in mining techniques",
                "B the increase in demand for metals",
                "C the discovery of tin in the area"
              ],
              "question": "What caused Manham’s sudden expansion during the Industrial Revolution?"
            },
            {
              "answer": "A",
              "number": 13,
              "options": [
                "A shortage of fuel",
                "B poor transport systems",
                "C lack of skills among local people"
              ],
              "question": "Why did rocks have to be sent away from Manham to be processed?"
            },
            {
              "answer": "A",
              "number": 14,
              "options": [
                "A The workers went away.",
                "B Traditional skills were lost.",
                "C Buildings were used for new purposes."
              ],
              "question": "What happened when the port declined in the twentieth century?"
            },
            {
              "answer": "C",
              "number": 15,
              "options": [
                "A discover the location of the original port",
                "B provide jobs for the unemployed",
                "C rebuild the port complex"
              ],
              "question": "What did the Manham Trust hope to do?"
            }
          ],
          "instruction": "Choose the correct letter, A, B or C."
        },
        {
          "groupType": "note_completion",
          "questions": [
            {
              "answer": "trains",
              "number": 16,
              "question": "<b>Tourist attractions in Manham</b><br><b>copper mine</b><ul><li>specially adapted miners’ ______ take visitors into the mountain</li></ul>",
              "alternativeAnswers": [
                "Trains",
                "TRAINS"
              ]
            },
            {
              "answer": "dark",
              "number": 17,
              "question": "<ul><li>the mine is ______ and enclosed – unsuitable for children and animals</li></ul>",
              "alternativeAnswers": [
                "Dark",
                "DARK"
              ]
            },
            {
              "answer": "games",
              "number": 18,
              "question": "<b>village school</b><ul><li>classrooms and a special exhibition of ______</li></ul>",
              "alternativeAnswers": [
                "Games",
                "GAMES"
              ]
            },
            {
              "answer": "guided tour",
              "number": 19,
              "question": "<ul><li>a ______ is recommended</li></ul>",
              "alternativeAnswers": [
                "Guided tour",
                "GUIDED TOUR"
              ]
            },
            {
              "answer": "ladder",
              "number": 20,
              "question": "<b>‘The George’ (old sailing ship)</b><ul><li>the ship’s wheel (was lost but has now been restored)</li><li>children shouldn’t use the ______</li></ul>",
              "alternativeAnswers": [
                "ladders",
                "Ladder",
                "Ladders",
                "LADDER",
                "LADDERS"
              ]
            }
          ],
          "instruction": "Complete the table below. Write NO MORE THAN TWO WORDS for each answer."
        }
      ]
    },
    {
      "image": null,
      "partNumber": 3,
      "questionRange": "21-30",
      "questionGroups": [
        {
          "options": [
            "A communication",
            "B design",
            "C IT",
            "D marketing",
            "E organisation"
          ],
          "groupType": "multiple_choice_multiple_answer",
          "questions": [
            {
              "answer": "A",
              "number": 21,
              "question": "First skill:"
            },
            {
              "answer": "E",
              "number": 22,
              "question": "Second skill:"
            }
          ],
          "instruction": "Choose TWO letters, A-E. Which TWO skills did Laura improve as a result of her work placement?"
        },
        {
          "options": [
            "A updates for its software",
            "B cost savings",
            "C an improved image",
            "D new clients",
            "E a growth in sales"
          ],
          "groupType": "multiple_choice_multiple_answer",
          "questions": [
            {
              "answer": "B",
              "number": 23,
              "question": "First benefit:"
            },
            {
              "answer": "C",
              "number": 24,
              "question": "Second benefit:"
            }
          ],
          "instruction": "Choose TWO letters, A-E. Which TWO immediate benefits did the company get from Laura’s work placement?"
        },
        {
          "options": [
            "A company manager",
            "B company’s personnel department",
            "C personal tutor",
            "D psychology department",
            "E mentor",
            "F university careers officer",
            "G internet"
          ],
          "groupType": "matching",
          "questions": [
            {
              "answer": "D",
              "number": 25,
              "question": "obtaining booklet"
            },
            {
              "answer": "F",
              "number": 26,
              "question": "discussing options"
            },
            {
              "answer": "G",
              "number": 27,
              "question": "getting updates"
            },
            {
              "answer": "B",
              "number": 28,
              "question": "responding to invitation for interview"
            },
            {
              "answer": "E",
              "number": 29,
              "question": "informing about outcome of interview"
            },
            {
              "answer": "C",
              "number": 30,
              "question": "requesting a reference"
            }
          ],
          "instruction": "What source of information should Tim use at each of the following stages of the work placement? Choose SIX answers from the box and write the correct letter, A-G, next to questions 25-30."
        }
      ]
    },
    {
      "image": null,
      "partNumber": 4,
      "questionRange": "31-40",
      "questionGroups": [
        {
          "groupType": "multiple_choice",
          "questions": [
            {
              "answer": "C",
              "number": 31,
              "options": [
                "A it could threaten our way of life.",
                "B it could be used to spy on people.",
                "C it is misunderstood by the public."
              ],
              "question": "<b>Nanotechnology: technology on a small scale</b><br>The speaker says that one problem with nanotechnology is that"
            },
            {
              "answer": "B",
              "number": 32,
              "options": [
                "A should be restricted to secure environments.",
                "B should be used with more caution.",
                "C should only be developed for essential products."
              ],
              "question": "According to the speaker, some scientists believe that nono-particles"
            },
            {
              "answer": "C",
              "number": 33,
              "options": [
                "A has yet to win popular support.",
                "B could be seen as unethical.",
                "C ought to be continued."
              ],
              "question": "In the speaker’s opinion, research into nanotechnology"
            }
          ],
          "instruction": "Choose the correct letter, A, B or C."
        },
        {
          "groupType": "note_completion",
          "questions": [
            {
              "answer": "metal",
              "number": 34,
              "question": "<b>Uses of Nanotechnology</b><br><b>Transport</b><ul><li>Nanotechnology could allow the development of stronger ______</li></ul>",
              "alternativeAnswers": [
                "metals",
                "Metal",
                "Metals",
                "METAL",
                "METALS"
              ]
            },
            {
              "answer": "space",
              "number": 35,
              "question": "<ul><li>Planes would be much lighter in weight.</li><li>______ travel will be made available to the masses.</li></ul>",
              "alternativeAnswers": [
                "Space",
                "SPACE"
              ]
            },
            {
              "answer": "memory",
              "number": 36,
              "question": "<b>Technology</b><ul><li>Computers will be even smaller, faster, and will have a greater ______</li></ul>",
              "alternativeAnswers": [
                "Memory",
                "MEMORY"
              ]
            },
            {
              "answer": "solar",
              "number": 37,
              "question": "<ul><li>______ Energy will become more affordable.</li></ul>",
              "alternativeAnswers": [
                "Solar",
                "SOLAR"
              ]
            },
            {
              "answer": "oil",
              "number": 38,
              "question": "<b>The Environment</b><ul><li>Nano-robots could rebuild the ozone layer.</li><li>Pollutants such as ______ could be removed from water</li></ul>",
              "alternativeAnswers": [
                "Oil",
                "OIL"
              ]
            },
            {
              "answer": "waste",
              "number": 39,
              "question": "<ul><li>There will be no ______ from manufacturing.</li></ul>",
              "alternativeAnswers": [
                "Waste",
                "WASTE"
              ]
            },
            {
              "answer": "tests",
              "number": 40,
              "question": "<b>Health and Medicine</b><ul><li>New methods of food production could eradicate famine.</li><li>Analysis of medical ______ will be speeded up.</li><li>Life expectancy could be increased.</li></ul>",
              "alternativeAnswers": [
                "Tests",
                "TESTS"
              ]
            }
          ],
          "instruction": "Complete the notes below. Write ONE WORD ONLY for each answer."
        }
      ]
    }
  ],
  "timer": 30.5,
  "title": "Cambridge Listening 4",
  "testType": "volume",
  "testFormat": "full_test",
  "testTution": "free",
  "totalQuestions": 40
};

const test9 = {
  "id": "cambridge-listening-9",
  "audio": "https://pub-359de657d62948868dbf1b069ed70702.r2.dev/Cambridge%20Listening/IELTS-12-Test-5.mp3",
  "level": "medium",
  "parts": [
    {
      "image": null,
      "partNumber": 1,
      "questionRange": "1-10",
      "questionGroups": [
        {
          "groupType": "note_completion",
          "questions": [
            {
              "answer": "mountains",
              "number": 1,
              "question": "<b>FAMILY EXCURSIONS</b><br><b>Cruise on a lake</b><br>Example<br><ul><li>Travel on an old steamship</li><li>Can take photos of the ______ that surround the lake</li></ul>",
              "alternativeAnswers": [
                "Mountains",
                "MOUNTAINS"
              ]
            },
            {
              "answer": "horse",
              "number": 2,
              "question": "<b>Farm visit</b><ul><li>Children can help feed the sheep</li><li>Visit can include a 40-minute ride on a ______</li></ul>",
              "alternativeAnswers": [
                "Horse",
                "HORSE"
              ]
            },
            {
              "answer": "gardens",
              "number": 3,
              "question": "<ul><li>Visitors can walk in the farm’s ______ by the lake</li></ul>",
              "alternativeAnswers": [
                "garden",
                "Garden",
                "Gardens",
                "GARDEN",
                "GARDENS"
              ]
            },
            {
              "answer": "lunch",
              "number": 4,
              "question": "<ul><li>______ is available at extra cost</li></ul>",
              "alternativeAnswers": [
                "Lunch",
                "LUNCH"
              ]
            },
            {
              "answer": "map",
              "number": 5,
              "question": "<b>Cycling trips</b><ul><li>Cyclists explore the Back Road</li><li>A ______ is provided</li></ul>",
              "alternativeAnswers": [
                "Map",
                "MAP"
              ]
            },
            {
              "answer": "experience",
              "number": 6,
              "question": "<ul><li>Only suitable for cyclists who have some ______</li></ul>",
              "alternativeAnswers": [
                "Experience",
                "EXPERIENCE"
              ]
            },
            {
              "answer": "Ratchesons",
              "number": 7,
              "question": "<ul><li>Bikes can be hired from ______ (near the Cruise Ship Terminal)</li></ul>",
              "alternativeAnswers": [
                "ratchesons",
                "RATCHESONS"
              ]
            },
            {
              "answer": "helmet",
              "number": 8,
              "question": "<ul><li>Cyclists need:</li><li>a repair kit</li><li>food and drink</li><li>a ______ (can be hired)</li></ul>",
              "alternativeAnswers": [
                "Helmet",
                "HELMET"
              ]
            },
            {
              "answer": "shops",
              "number": 9,
              "question": "<ul><li>There are no ______ or accommodation in the area</li></ul>",
              "alternativeAnswers": [
                "Shops",
                "SHOPS"
              ]
            },
            {
              "answer": "267",
              "number": 10,
              "question": "<b>Cost</b><ul><li>Total cost for whole family of cruise and farm visit: $______</li></ul>",
              "alternativeAnswers": [
                "two hundred and sixty-seven",
                "two hundred sixty-seven"
              ]
            }
          ],
          "instruction": "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer."
        }
      ]
    },
    {
      "image": null,
      "partNumber": 2,
      "questionRange": "11-20",
      "questionGroups": [
        {
          "groupType": "multiple_choice",
          "questions": [
            {
              "answer": "A",
              "number": 11,
              "options": [
                "A the variety of work",
                "B the friendly atmosphere",
                "C the opportunities for promotion"
              ],
              "question": "<b>Talk to new kitchen assistants</b><br>According to the manager, what do most people like about the job of kitchen assistant?"
            },
            {
              "answer": "A",
              "number": 12,
              "options": [
                "A jewellery.",
                "B hair styles.",
                "C shoes."
              ],
              "question": "The manager is concerned about some of the new staff’s"
            },
            {
              "answer": "C",
              "number": 13,
              "options": [
                "A it is a public holiday.",
                "B the head chef is absent.",
                "C the restaurant is almost fully booked."
              ],
              "question": "The manager says that the day is likely to be busy for kitchen staff because"
            },
            {
              "answer": "C",
              "number": 14,
              "options": [
                "A the waste disposal unit.",
                "B the electric mixer.",
                "C the meat slicer."
              ],
              "question": "Only kitchen staff who are 18 or older are allowed to use"
            }
          ],
          "instruction": "Choose the correct letter, A, B or C."
        },
        {
          "options": [
            "A They have to follow orders immediately.",
            "B The kitchen gets very hot.",
            "C They may not be able to take a break.",
            "D They have to do overtime.",
            "E The work is physically demanding."
          ],
          "groupType": "multiple_choice_multiple_answer",
          "questions": [
            {
              "answer": "A",
              "number": 15,
              "question": "First thing:"
            },
            {
              "answer": "E",
              "number": 16,
              "question": "Second thing:"
            }
          ],
          "instruction": "Choose TWO letters, A-E. According to the manager, which TWO things can make the job of kitchen assistant stressful?"
        },
        {
          "options": [
            "A training courses",
            "B food stocks",
            "C first aid",
            "D breakages",
            "E staff discounts",
            "F timetables"
          ],
          "groupType": "matching",
          "questions": [
            {
              "answer": "F",
              "number": 17,
              "question": "Joy Parkins"
            },
            {
              "answer": "C",
              "number": 18,
              "question": "David Field"
            },
            {
              "answer": "D",
              "number": 19,
              "question": "Dexter Wills"
            },
            {
              "answer": "B",
              "number": 20,
              "question": "Mike Smith"
            }
          ],
          "instruction": "What is the responsibility of each of the following restaurant staff? Choose FOUR answers from the box and write the correct letter, A-F, next to Questions 17-20"
        }
      ]
    },
    {
      "image": null,
      "partNumber": 3,
      "questionRange": "21-30",
      "questionGroups": [
        {
          "groupType": "multiple_choice",
          "questions": [
            {
              "answer": "B",
              "number": 21,
              "options": [
                "A how public library services are organised in different countries",
                "B how changes in society are reflected in public libraries",
                "C how the funding of public libraries has changed"
              ],
              "question": "<b>Paper on Public Libraries</b><br>What will be the main topic of Trudie and Stewart’s paper?"
            },
            {
              "answer": "C",
              "number": 22,
              "options": [
                "A they may take a long time to read.",
                "B they can be difficult to read.",
                "C they are generally old."
              ],
              "question": "They agree that one disadvantage of free digitalised books is that"
            },
            {
              "answer": "C",
              "number": 23,
              "options": [
                "A maintain their traditional function.",
                "B become centres for local communities.",
                "C no longer contain any books."
              ],
              "question": "Stewart expect that in the future libraries will"
            }
          ],
          "instruction": "Choose the correct letter, A, B or C."
        },
        {
          "groupType": "note_completion",
          "questions": [
            {
              "answer": "budget",
              "number": 24,
              "question": "<b>Study of local library: possible questions</b><br><ul><li>whether it has a ______ of its own</li></ul>",
              "alternativeAnswers": [
                "Budget",
                "BUDGET"
              ]
            },
            {
              "answer": "employment",
              "number": 25,
              "question": "<ul><li>its policy regarding noise of various kinds</li><li>how it’s affected by laws regarding all aspects of ______</li></ul>",
              "alternativeAnswers": [
                "Employment",
                "EMPLOYMENT"
              ]
            },
            {
              "answer": "safety",
              "number": 26,
              "question": "<ul><li>how the design needs to take the ______ of customers into account</li></ul>",
              "alternativeAnswers": [
                "Safety",
                "SAFETY"
              ]
            },
            {
              "answer": "insurance",
              "number": 27,
              "question": "<ul><li>what ______ is required in case of accidents</li></ul>",
              "alternativeAnswers": [
                "Insurance",
                "INSURANCE"
              ]
            },
            {
              "answer": "diary",
              "number": 28,
              "question": "<ul><li>why a famous person’s ______ is located in the library</li></ul>",
              "alternativeAnswers": [
                "Diary",
                "DIARY"
              ]
            },
            {
              "answer": "database",
              "number": 29,
              "question": "<ul><li>whether it has a ______ of local organisations</li></ul>",
              "alternativeAnswers": [
                "Database",
                "DATABASE"
              ]
            },
            {
              "answer": "museum",
              "number": 30,
              "question": "<ul><li>how it’s different from a library in a ______</li></ul>",
              "alternativeAnswers": [
                "Museum",
                "MUSEUM"
              ]
            }
          ],
          "instruction": "Complete the notes below. Write ONE WORD ONLY for each answer."
        }
      ]
    },
    {
      "image": null,
      "partNumber": 4,
      "questionRange": "31-40",
      "questionGroups": [
        {
          "groupType": "note_completion",
          "questions": [
            {
              "answer": "damage",
              "number": 31,
              "question": "<b>Four business values</b><br>Many business values can result in ______ .",
              "alternativeAnswers": [
                "Damage",
                "DAMAGE"
              ]
            },
            {
              "answer": "side effects",
              "number": 32,
              "question": "Senior managers need to understand and deal with the potential ______ that may result.",
              "alternativeAnswers": [
                "Side effects",
                "SIDE EFFECTS"
              ]
            },
            {
              "answer": "bridge",
              "number": 33,
              "question": "<b>Collaboration</b><br>During a training course, the speaker was in a team that had to build a ______ .",
              "alternativeAnswers": [
                "Bridge",
                "BRIDGE"
              ]
            },
            {
              "answer": "confusion",
              "number": 34,
              "question": "Other teams experienced ______ from trying to collaborate.<br>The speaker’s team won because they reduced collaboration.",
              "alternativeAnswers": [
                "Confusion",
                "CONFUSION"
              ]
            },
            {
              "answer": "smartphone",
              "number": 35,
              "question": "Sales of a ______ were poor because of collaboration.",
              "alternativeAnswers": [
                "Smartphone",
                "SMARTPHONE"
              ]
            },
            {
              "answer": "resources",
              "number": 36,
              "question": "<b>Industriousness</b><br>Hard work may be a bad use of various company ______ .",
              "alternativeAnswers": [
                "Resources",
                "RESOURCES"
              ]
            },
            {
              "answer": "unnecessary",
              "number": 37,
              "question": "The word ‘lazy’ in this context refers to people who avoid doing tasks that are ______ .",
              "alternativeAnswers": [
                "not necessary",
                "Unnecessary",
                "Not necessary",
                "UNNECESSARY"
              ]
            },
            {
              "answer": "chocolate bar",
              "number": 38,
              "question": "<b>Creativity</b><br>An advertising campaign for a ______ was memorable but failed to boost sales.",
              "alternativeAnswers": [
                "Chocolate bar",
                "CHOCOLATE BAR"
              ]
            },
            {
              "answer": "problem",
              "number": 39,
              "question": "Creativity should be used as a response to a particular ______ .",
              "alternativeAnswers": [
                "Problem",
                "PROBLEM"
              ]
            },
            {
              "answer": "market share",
              "number": 40,
              "question": "<b>Excellence</b><br>According to one study, on average, pioneers had a ______ that was far higher than that of followers.<br>Companies that always aim at excellence may miss opportunities.",
              "alternativeAnswers": [
                "Market share",
                "MARKET SHARE"
              ]
            }
          ],
          "instruction": "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer."
        }
      ]
    }
  ],
  "timer": 40,
  "title": "Cambridge Listening 9",
  "testType": "volume",
  "testFormat": "full_test",
  "testTution": "free",
  "totalQuestions": 40
};

async function insertOrUpdate(testData) {
  const { data: existing } = await supabase
    .from("Tests")
    .select("id")
    .eq("test_id", testData.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("Tests")
      .update({ data: testData })
      .eq("test_id", testData.id);
    if (error) console.error("Error updating", testData.id, error);
    else console.log("✅ Updated:", testData.title);
  } else {
    const { error } = await supabase.from("Tests").insert({
      test_id: testData.id,
      type: "listening",
      data: testData
    });
    if (error) console.error("Error inserting", testData.id, error);
    else console.log("✅ Inserted:", testData.title);
  }
}

async function run() {
  await insertOrUpdate(test4);
  await insertOrUpdate(test9);
}

run();
