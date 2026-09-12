import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read passage texts from fullmock8/TEST-2.md
const test2Md = readFileSync(join(__dirname, '..', 'testlar', 'fullmock8', 'TEST-2.md'), 'utf-8');

// Helper to extract passages with proper paragraph splits
function extractPassages(md) {
  // Passage 1
  const p1Start = md.indexOf("Wood: A Valuable Resource in New Zealand's Economy");
  const p1End = md.indexOf("Questions 1–6");
  let p1Raw = md.substring(p1Start, p1End).trim();
  p1Raw = p1Raw.replace("Wood: A Valuable Resource in New Zealand's Economy", '').trim();
  const p1Paras = p1Raw.split('\n').map(l => l.trim()).filter(Boolean);
  const p1Text = p1Paras.join('\n\n');

  // Passage 2
  const p2Start = md.indexOf("Intelligent Behaviour in Birds");
  const p2End = md.indexOf("Questions 14–20");
  let p2Raw = md.substring(p2Start, p2End).trim();
  p2Raw = p2Raw.replace("Intelligent Behaviour in Birds", '').trim();
  const p2Lines = p2Raw.split('\n').map(l => l.trim()).filter(Boolean);
  const p2Sections = [];
  for (let i = 0; i < p2Lines.length; i++) {
    const line = p2Lines[i];
    if (/^[A-G]$/.test(line)) {
      const letter = line;
      const body = p2Lines[i + 1] || '';
      p2Sections.push(`Paragraph ${letter}\n${body}`);
      i++;
    } else if (line.startsWith('*')) {
      p2Sections.push(line);
    }
  }
  const p2Text = p2Sections.join('\n\n');

  // Passage 3
  const p3Start = md.indexOf("Jean Piaget 1896 – 1980");
  const p3End = md.indexOf("Questions 27–31");
  let p3Raw = md.substring(p3Start, p3End).trim();
  p3Raw = p3Raw.replace("Jean Piaget 1896 – 1980", '').trim();
  if (p3Raw.startsWith("Seymour Papert looks at the work of pioneering Swiss philosopher and psychologist")) {
    p3Raw = p3Raw.replace("Seymour Papert looks at the work of pioneering Swiss philosopher and psychologist", '').trim();
  }
  const p3Paras = p3Raw.split('\n').map(l => l.trim()).filter(Boolean);
  const p3Text = p3Paras.join('\n\n');

  return { p1Text, p2Text, p3Text };
}

const { p1Text, p2Text, p3Text } = extractPassages(test2Md);

const mock8Data = {
  id: "istudy-full-mock-8",
  title: "iStudy Full Mock Test 8",
  testFormat: "full_mock",
  testType: "authentic_material",
  level: "medium",
  center: "istudy",
  sections: {
    listening: {
      title: "iStudy Full Mock 8 — Listening",
      testFormat: "full_test",
      timer: 32,
      totalQuestions: 40,
      audio: "https://pub-e1b4bb7172ab47648a4ad3899784693e.r2.dev/Test%203%20(1).mp3",
      parts: [
        {
          partNumber: 1,
          questionRange: "1-10",
          image: null,
          questionGroups: [
            {
              groupType: "note_completion",
              instruction: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
              questions: [
                {
                  number: 1,
                  question: "<b>Planning a party</b><br><br><b>EVENT DETAILS</b><ul><li>Reason for event: wife’s promotion</li><li>Event option: large surprise party</li><li>Number of people: ______</li></ul>",
                  answer: "80",
                  alternativeAnswers: ["80 people", "eighty"]
                },
                {
                  number: 2,
                  question: "<ul><li>Date: ______</li><li>Day of week: Friday</li><li>Time: 6 – 10 p.m.</li></ul>",
                  answer: "26 September",
                  alternativeAnswers: ["26th September", "September 26", "September 26th", "26 Sept"]
                },
                {
                  number: 3,
                  question: "<ul><li>Location: the ______ Room</li></ul>",
                  answer: "King",
                  alternativeAnswers: ["king", "King's", "Kings"]
                },
                {
                  number: 4,
                  question: "<ul><li>Type of music: ______</li></ul>",
                  answer: "jazz",
                  alternativeAnswers: ["Jazz"]
                },
                {
                  number: 5,
                  question: "<b>FOOD</b><ul><li>Service option: ______</li></ul>",
                  answer: "table",
                  alternativeAnswers: ["Table", "table service"]
                },
                {
                  number: 6,
                  question: "<ul><li>Flavour of cake: ______</li></ul>",
                  answer: "lemon",
                  alternativeAnswers: ["Lemon"]
                },
                {
                  number: 7,
                  question: "<ul><li>Message on cake: ______</li></ul>",
                  answer: "congratulations",
                  alternativeAnswers: ["Congratulations", "\"congratulations\"", "\"Congratulations\""]
                },
                {
                  number: 8,
                  question: "<b>PAYMENT</b><ul><li>Reservation fee paid: $100</li><li>Credit card type: Mastercard</li><li>Credit card number: ______</li></ul>",
                  answer: "5544120043268887",
                  alternativeAnswers: ["5544 1200 4326 8887"]
                },
                {
                  number: 9,
                  question: "<ul><li>Name: Brian ______ Troy</li></ul>",
                  answer: "SEBASTIAN",
                  alternativeAnswers: ["Sebastian", "sebastian"]
                },
                {
                  number: 10,
                  question: "<ul><li>Additional fees: extra charge for ______</li></ul>",
                  answer: "service",
                  alternativeAnswers: ["Service"]
                }
              ]
            }
          ]
        },
        {
          partNumber: 2,
          questionRange: "11-20",
          image: null,
          questionGroups: [
            {
              groupType: "multiple_choice",
              instruction: "Choose the correct letter, A, B or C.",
              questions: [
                {
                  number: 11,
                  question: "Joan normally gets up at",
                  options: [
                    "A 5.30 a.m",
                    "B 6.30 a.m",
                    "C 7.30 a.m"
                  ],
                  answer: "B"
                },
                {
                  number: 12,
                  question: "Joan’s first task of the day is to",
                  options: [
                    "A clean the horses.",
                    "B organise her son.",
                    "C do farm work."
                  ],
                  answer: "B"
                }
              ]
            },
            {
              groupType: "summary_completion",
              instruction: "Complete the summary below. Write ONE WORD AND/OR A NUMBER for each answer.",
              questions: [
                {
                  number: 13,
                  question: "Joan’s official title in Riding for the Disabled (RDA) is chairperson. In her local district there are at present twenty-two riders and ______ helpers on the volunteer list,",
                  answer: "40",
                  alternativeAnswers: ["forty"]
                },
                {
                  number: 14,
                  question: "out of whom ______ come regularly.",
                  answer: "25",
                  alternativeAnswers: ["twenty-five", "twenty five"]
                }
              ]
            },
            {
              groupType: "matching",
              instruction: "How much does Joan like doing each of the following activities? Choose the correct letter, A, B or C, next to questions 15–18.",
              options: [
                "A She really likes it.",
                "B She doesn’t mind it.",
                "C She hates it."
              ],
              questions: [
                {
                  number: 15,
                  question: "correspondence",
                  answer: "B"
                },
                {
                  number: 16,
                  question: "fund-raising",
                  answer: "C"
                },
                {
                  number: 17,
                  question: "calling riders",
                  answer: "A"
                },
                {
                  number: 18,
                  question: "organising accounts",
                  answer: "C"
                }
              ]
            },
            {
              groupType: "multiple_choice_multiple_answer",
              instruction: "Joan says the TWO ways the RDA needs to improve are by. Choose TWO letters, A–E.",
              options: [
                "A giving special training.",
                "B making fund-raising more effective.",
                "C opening more RDA centres.",
                "D providing more helpers.",
                "E recognising difficulties of disabled riders."
              ],
              questions: [
                {
                  number: 19,
                  question: "First way:",
                  answer: "B",
                  alternativeAnswers: ["E"]
                },
                {
                  number: 20,
                  question: "Second way:",
                  answer: "E",
                  alternativeAnswers: ["B"]
                }
              ]
            }
          ]
        },
        {
          partNumber: 3,
          questionRange: "21-30",
          image: null,
          questionGroups: [
            {
              groupType: "multiple_choice_multiple_answer",
              instruction: "Which TWO topics were the aims of the geography lesson related to? Choose TWO letters, A–E.",
              options: [
                "A global interdependency",
                "B manufacturing method",
                "C the environmental impact of trade",
                "D transport systems",
                "E the development of writing tools"
              ],
              questions: [
                {
                  number: 21,
                  question: "First topic:",
                  answer: "A",
                  alternativeAnswers: ["D"]
                },
                {
                  number: 22,
                  question: "Second topic:",
                  answer: "D",
                  alternativeAnswers: ["A"]
                }
              ]
            },
            {
              groupType: "multiple_choice_multiple_answer",
              instruction: "Which TWO problems do Dean and Hannah identify in their lesson? Choose TWO letters, A–E.",
              options: [
                "A the materials",
                "B the student grouping",
                "C the lesson structure",
                "D the teacher coordination",
                "E the timing"
              ],
              questions: [
                {
                  number: 23,
                  question: "First problem:",
                  answer: "B",
                  alternativeAnswers: ["E"]
                },
                {
                  number: 24,
                  question: "Second problem:",
                  answer: "E",
                  alternativeAnswers: ["B"]
                }
              ]
            },
            {
              groupType: "flow_chart",
              title: "Geography lesson plan: student activities",
              instruction: "Complete the flow-chart below. Choose SIX correct answers, A–H, next to questions 25–30.",
              options: [
                "A export routes",
                "B future",
                "C talk",
                "D homework",
                "E worksheet",
                "F history",
                "G producers",
                "H methods of transport"
              ],
              questions: [
                {
                  number: 0,
                  question: "Examine a pencil and discuss where the component materials come from"
                },
                {
                  number: 25,
                  question: "Locate the top ______ on a world map",
                  answer: "G"
                },
                {
                  number: 26,
                  question: "Discuss the pros and cons of different ______",
                  answer: "H"
                },
                {
                  number: 27,
                  question: "In groups, discuss countries' possible ______ to the USA",
                  answer: "A"
                },
                {
                  number: 28,
                  question: "Complete a ______ about pencil distribution within the USA.",
                  answer: "E"
                },
                {
                  number: 29,
                  question: "Share ideas about the ______ of pencils.",
                  answer: "B"
                },
                {
                  number: 30,
                  question: "Prepare a ______",
                  answer: "C"
                }
              ]
            }
          ]
        },
        {
          partNumber: 4,
          questionRange: "31-40",
          image: null,
          questionGroups: [
            {
              groupType: "note_completion",
              instruction: "Complete the notes below. Write ONE WORD ONLY for each answer.",
              questions: [
                {
                  number: 31,
                  question: "<b>The world’s oldest mechanical computer: the Antikythera mechanism</b><br><br><b>Discovery</b><ul><li>It was part of a ship’s ______, found in the sea near Antikythera, in Greece.</li></ul>",
                  answer: "cargo",
                  alternativeAnswers: ["Cargo"]
                },
                {
                  number: 32,
                  question: "<ul><li>It was wrongly thought to be a piece of ______.</li><li>It was later found to be a mechanism that had broken into pieces.</li></ul>",
                  answer: "rock",
                  alternativeAnswers: ["Rock"]
                },
                {
                  number: 33,
                  question: "<b>Equipment used for analysis of the mechanism</b><ul><li>\"Dome\" - produces photographs which make the ______ clearer</li></ul>",
                  answer: "inscriptions",
                  alternativeAnswers: ["Inscriptions", "inscription"]
                },
                {
                  number: 34,
                  question: "<ul><li>\"BladeRunner\" - produces X-rays - originally used to identify ______ in engines</li></ul>",
                  answer: "cracks",
                  alternativeAnswers: ["Cracks", "crack"]
                },
                {
                  number: 35,
                  question: "<b>Description</b><br>The mechanism consisted of:<ul><li>30 or more gear wheels made of ______</li><li>models of the sun, moon and planets</li></ul>",
                  answer: "metal",
                  alternativeAnswers: ["Metal"]
                },
                {
                  number: 36,
                  question: "<ul><li>a framework made of ______</li></ul>",
                  answer: "wood",
                  alternativeAnswers: ["Wood"]
                },
                {
                  number: 37,
                  question: "<b>How the mechanism was used</b><ul><li>The operator turned a ______ to move the gear wheels.</li><li>The sun, moon and planets could be moved into their correct positions for any date.</li></ul>",
                  answer: "handle",
                  alternativeAnswers: ["Handle"]
                },
                {
                  number: 38,
                  question: "<ul><li>Most surprisingly, the mechanism could calculate when an ______ would occur.</li></ul>",
                  answer: "eclipse",
                  alternativeAnswers: ["Eclipse"]
                },
                {
                  number: 39,
                  question: "<ul><li>It may have been used as a ______ when planning festivals.</li></ul>",
                  answer: "calendar",
                  alternativeAnswers: ["Calendar"]
                },
                {
                  number: 40,
                  question: "<b>Later use of similar technology</b><ul><li>13th – 14th centuries: used for making ______ in Western Europe.</li></ul>",
                  answer: "clocks",
                  alternativeAnswers: ["Clocks", "clock"]
                }
              ]
            }
          ]
        }
      ]
    },
    reading: {
      title: "iStudy Full Mock 8 — Reading",
      testFormat: "full_test",
      timer: 60,
      totalQuestions: 40,
      passages: [
        {
          passageNumber: 1,
          title: "Wood: A Valuable Resource in New Zealand's Economy",
          content: p1Text,
          image: null,
          questionGroups: [
            {
              groupType: "true_false_not_given",
              instruction: "Do the following statements agree with the information given in Reading Passage 1?\nIn boxes 1–6, choose:\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this",
              questions: [
                {
                  number: 1,
                  question: "Settlers realised that wooden houses were more dangerous than other types of structure.",
                  answer: "FALSE"
                },
                {
                  number: 2,
                  question: "During the 1800s, New Zealand exported wood for use in boat-building.",
                  answer: "TRUE"
                },
                {
                  number: 3,
                  question: "Plantation-grown wood is generally better for construction than native forest wood.",
                  answer: "NOT GIVEN"
                },
                {
                  number: 4,
                  question: "Compared to other types of wood, pine has a narrow range of uses.",
                  answer: "FALSE"
                },
                {
                  number: 5,
                  question: "Demand for housing in New Zealand is predicted to fall in the next few years.",
                  answer: "NOT GIVEN"
                },
                {
                  number: 6,
                  question: "In future, the expansion of New Zealand's wood industry will depend on its exports.",
                  answer: "TRUE"
                }
              ]
            },
            {
              groupType: "short_answer",
              instruction: "Answer the questions below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
              questions: [
                {
                  number: 7,
                  question: "Apart from exchange rates, which factor has had a negative impact on New Zealand's forestry exports?",
                  answer: "shipping costs",
                  alternativeAnswers: ["Shipping costs", "shipping cost"]
                },
                {
                  number: 8,
                  question: "Which part of New Zealand's economy does the forestry industry rank third in?",
                  answer: "export sector",
                  alternativeAnswers: ["Export sector", "export"]
                },
                {
                  number: 9,
                  question: "According to the New Zealand forestry industry, what could be the size of its workforce by 2025?",
                  answer: "60,000",
                  alternativeAnswers: ["60000", "sixty thousand"]
                },
                {
                  number: 10,
                  question: "What kind of timber product is available in large amounts from renewable forests in New Zealand?",
                  answer: "softwood",
                  alternativeAnswers: ["Softwood"]
                },
                {
                  number: 11,
                  question: "Which aspect of timber production are New Zealand's main customers increasingly concerned about?",
                  answer: "sustainability",
                  alternativeAnswers: ["Sustainability"]
                },
                {
                  number: 12,
                  question: "Outside the southern hemisphere, who are New Zealand forestry's main competitors?",
                  answer: "Scandinavian countries",
                  alternativeAnswers: ["scandinavian countries", "Scandinavia"]
                },
                {
                  number: 13,
                  question: "Which group of products is New Zealand's forestry industry now having to compete with?",
                  answer: "wood substitutes",
                  alternativeAnswers: ["Wood substitutes", "wood substitute"]
                }
              ]
            }
          ]
        },
        {
          passageNumber: 2,
          title: "Intelligent Behaviour in Birds",
          content: p2Text,
          image: null,
          questionGroups: [
            {
              groupType: "matching_headings",
              instruction: "Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–ix, in boxes 14–20.",
              options: [
                "i The theory linking capacity for tool use in birds and survival",
                "ii The influence of humans on tool use",
                "iii The theory linking cognitive ability and living in a society",
                "iv Reviewing long-held beliefs",
                "v Intelligence helps birds to remember",
                "vi How some birds trick each other",
                "vii Physiological evidence of birds' intelligence",
                "viii Several examples of birds who use tools",
                "ix One species' multiple tool-using techniques"
              ],
              questions: [
                {
                  number: 14,
                  question: "Paragraph A",
                  options: [
                    "i The theory linking capacity for tool use in birds and survival",
                    "ii The influence of humans on tool use",
                    "iii The theory linking cognitive ability and living in a society",
                    "iv Reviewing long-held beliefs",
                    "v Intelligence helps birds to remember",
                    "vi How some birds trick each other",
                    "vii Physiological evidence of birds' intelligence",
                    "viii Several examples of birds who use tools",
                    "ix One species' multiple tool-using techniques"
                  ],
                  answer: "iv"
                },
                {
                  number: 15,
                  question: "Paragraph B",
                  options: [
                    "i The theory linking capacity for tool use in birds and survival",
                    "ii The influence of humans on tool use",
                    "iii The theory linking cognitive ability and living in a society",
                    "iv Reviewing long-held beliefs",
                    "v Intelligence helps birds to remember",
                    "vi How some birds trick each other",
                    "vii Physiological evidence of birds' intelligence",
                    "viii Several examples of birds who use tools",
                    "ix One species' multiple tool-using techniques"
                  ],
                  answer: "viii"
                },
                {
                  number: 16,
                  question: "Paragraph C",
                  options: [
                    "i The theory linking capacity for tool use in birds and survival",
                    "ii The influence of humans on tool use",
                    "iii The theory linking cognitive ability and living in a society",
                    "iv Reviewing long-held beliefs",
                    "v Intelligence helps birds to remember",
                    "vi How some birds trick each other",
                    "vii Physiological evidence of birds' intelligence",
                    "viii Several examples of birds who use tools",
                    "ix One species' multiple tool-using techniques"
                  ],
                  answer: "i"
                },
                {
                  number: 17,
                  question: "Paragraph D",
                  options: [
                    "i The theory linking capacity for tool use in birds and survival",
                    "ii The influence of humans on tool use",
                    "iii The theory linking cognitive ability and living in a society",
                    "iv Reviewing long-held beliefs",
                    "v Intelligence helps birds to remember",
                    "vi How some birds trick each other",
                    "vii Physiological evidence of birds' intelligence",
                    "viii Several examples of birds who use tools",
                    "ix One species' multiple tool-using techniques"
                  ],
                  answer: "ix"
                },
                {
                  number: 18,
                  question: "Paragraph E",
                  options: [
                    "i The theory linking capacity for tool use in birds and survival",
                    "ii The influence of humans on tool use",
                    "iii The theory linking cognitive ability and living in a society",
                    "iv Reviewing long-held beliefs",
                    "v Intelligence helps birds to remember",
                    "vi How some birds trick each other",
                    "vii Physiological evidence of birds' intelligence",
                    "viii Several examples of birds who use tools",
                    "ix One species' multiple tool-using techniques"
                  ],
                  answer: "vii"
                },
                {
                  number: 19,
                  question: "Paragraph F",
                  options: [
                    "i The theory linking capacity for tool use in birds and survival",
                    "ii The influence of humans on tool use",
                    "iii The theory linking cognitive ability and living in a society",
                    "iv Reviewing long-held beliefs",
                    "v Intelligence helps birds to remember",
                    "vi How some birds trick each other",
                    "vii Physiological evidence of birds' intelligence",
                    "viii Several examples of birds who use tools",
                    "ix One species' multiple tool-using techniques"
                  ],
                  answer: "iii"
                },
                {
                  number: 20,
                  question: "Paragraph G",
                  options: [
                    "i The theory linking capacity for tool use in birds and survival",
                    "ii The influence of humans on tool use",
                    "iii The theory linking cognitive ability and living in a society",
                    "iv Reviewing long-held beliefs",
                    "v Intelligence helps birds to remember",
                    "vi How some birds trick each other",
                    "vii Physiological evidence of birds' intelligence",
                    "viii Several examples of birds who use tools",
                    "ix One species' multiple tool-using techniques"
                  ],
                  answer: "vi"
                }
              ]
            },
            {
              groupType: "matching",
              instruction: "Look at the following characteristics (Questions 21–26) and the list of birds below.\nMatch each characteristic with the correct bird, A, B, or C.\nYou may use any letter more than once.",
              options: [
                "A White-winged choughs",
                "B Black kites",
                "C New Caledonian crows"
              ],
              questions: [
                {
                  number: 21,
                  question: "keeping tools that they like to use",
                  answer: "C"
                },
                {
                  number: 22,
                  question: "drawing out their prey by frightening it",
                  answer: "B"
                },
                {
                  number: 23,
                  question: "the use of tools to remove the outer covering from food",
                  answer: "A"
                },
                {
                  number: 24,
                  question: "using food to attract their prey",
                  answer: "B"
                },
                {
                  number: 25,
                  question: "the use of unfamiliar materials to make tools",
                  answer: "C"
                },
                {
                  number: 26,
                  question: "engaging in certain activities for the benefit of observers",
                  answer: "A"
                }
              ]
            }
          ]
        },
        {
          passageNumber: 3,
          title: "Jean Piaget 1896 – 1980",
          content: p3Text,
          image: null,
          questionGroups: [
            {
              groupType: "multiple_choice_single",
              instruction: "Choose the correct letter, A, B, C or D.",
              questions: [
                {
                  number: 27,
                  question: "In the second paragraph the writer mentions the example of modern anthropology to illustrate",
                  options: [
                    "A the universality of Piaget’s insights into the workings of the mind.",
                    "B the similarity between children’s thought processing in different cultures.",
                    "C how Piaget’s work represents a crucial turning-point in our approach to education.",
                    "D how Piaget’s work has aided our understanding of man’s evolution from primitive origins."
                  ],
                  answer: "C"
                },
                {
                  number: 28,
                  question: "According to the writer, what point is illustrated by the dialogue about the wind?",
                  options: [
                    "A The factual accuracy of what children say is of minor significance.",
                    "B Children want to learn about scientific principles.",
                    "C Children’s reasoning processes can be amusing to adults.",
                    "D Children often pretend that they know the answers to questions."
                  ],
                  answer: "A"
                },
                {
                  number: 29,
                  question: "Piaget believed in the importance of",
                  options: [
                    "A preventing children from making false assumptions.",
                    "B giving children honest feedback on their hypotheses.",
                    "C showing children how to formulate their own ideas about the world.",
                    "D maintaining children’s confidence in their ability to interpret the world."
                  ],
                  answer: "D"
                },
                {
                  number: 30,
                  question: "What does the writer suggest in the seventh paragraph?",
                  options: [
                    "A Children’s sense of their surroundings changes as they get older.",
                    "B Children are able to grasp certain complex ideas as well as adults are.",
                    "C Even apparently irrational ideas can be worthy of interest.",
                    "D Sometimes the simplest explanations are the best."
                  ],
                  answer: "C"
                },
                {
                  number: 31,
                  question: "The writer’s main purpose is to",
                  options: [
                    "A outline Piaget’s contribution to a range of scientific fields.",
                    "B summarise how education has benefited from Piaget’s finding.",
                    "C discuss Piaget’s role in the development of 20th-century psychology.",
                    "D express doubts about a number of Piaget’s theories."
                  ],
                  answer: "C"
                }
              ]
            },
            {
              groupType: "summary_completion_with_options",
              instruction: "Complete the summary using the list of words, A–I, below.",
              questions: [
                {
                  number: 32,
                  question: "<b>Piaget’s Theories on Children’s Cognitive Development</b><br><br>Piaget maintained that children’s mental processes were far more ______ than they might appear.",
                  options: [
                    "A correct",
                    "B theories",
                    "C brain",
                    "D simple",
                    "E teachers",
                    "F psychology",
                    "G logical",
                    "H thought",
                    "I philosopher"
                  ],
                  answer: "G",
                  alternativeAnswers: ["logical", "G (logical)"]
                },
                {
                  number: 33,
                  question: "He encouraged the view that a child was not a ‘blank slate’ waiting to be filled with information, but rather a systematic builder of knowledge who regularly tries out his or her own ______ about the world.",
                  options: [
                    "A correct",
                    "B theories",
                    "C brain",
                    "D simple",
                    "E teachers",
                    "F psychology",
                    "G logical",
                    "H thought",
                    "I philosopher"
                  ],
                  answer: "B",
                  alternativeAnswers: ["theories", "B (theories)"]
                },
                {
                  number: 34,
                  question: "Piaget’s impact on the area of ______ could well outlast that of more celebrated pioneers of this discipline.",
                  options: [
                    "A correct",
                    "B theories",
                    "C brain",
                    "D simple",
                    "E teachers",
                    "F psychology",
                    "G logical",
                    "H thought",
                    "I philosopher"
                  ],
                  answer: "F",
                  alternativeAnswers: ["psychology", "F (psychology)"]
                },
                {
                  number: 35,
                  question: "Despite doubts cast over his ideas by the current view associating knowledge exclusively with the ______, the effects of his work are still strong today.",
                  options: [
                    "A correct",
                    "B theories",
                    "C brain",
                    "D simple",
                    "E teachers",
                    "F psychology",
                    "G logical",
                    "H thought",
                    "I philosopher"
                  ],
                  answer: "C",
                  alternativeAnswers: ["brain", "C (brain)"]
                },
                {
                  number: 36,
                  question: "His principles are still widely used in the professional development of ______ .",
                  options: [
                    "A correct",
                    "B theories",
                    "C brain",
                    "D simple",
                    "E teachers",
                    "F psychology",
                    "G logical",
                    "H thought",
                    "I philosopher"
                  ],
                  answer: "E",
                  alternativeAnswers: ["teachers", "E (teachers)"]
                }
              ]
            },
            {
              groupType: "yes_no_not_given",
              instruction: "Do the following statements agree with the claims of the writer?\nIn boxes 37–40, choose:\nYES if the statement agrees with the claims of the writer\nNO if the statement contradicts the claims of the writer\nNOT GIVEN if it is impossible to say what the writer thinks about this",
              questions: [
                {
                  number: 37,
                  question: "Piaget’s early work in Paris involved innovative research techniques.",
                  answer: "NOT GIVEN"
                },
                {
                  number: 38,
                  question: "Piaget gave clear guidelines as to how adults should give information to children.",
                  answer: "NO"
                },
                {
                  number: 39,
                  question: "Piaget made a significant contribution to the field of epistemology.",
                  answer: "YES"
                },
                {
                  number: 40,
                  question: "We still have much to learn about the nature of knowledge.",
                  answer: "YES"
                }
              ]
            }
          ]
        }
      ]
    },
    writing: {
      title: "iStudy Full Mock 8 — Writing",
      testFormat: "full_test",
      timer: 60,
      tasks: [
        {
          taskNumber: 1,
          title: "Writing Task 1",
          content: "You should spend about 20 minutes on this task.\n\nThe maps below show the Riverside Park in 2010 and now.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          image: "https://pub-e1b4bb7172ab47648a4ad3899784693e.r2.dev/istudymocktest8.jpg"
        },
        {
          taskNumber: 2,
          title: "Writing Task 2",
          content: "You should spend about 40 minutes on this task.\n\nIn many parts of the world, people now often throw away broken items and buy new ones, whereas in the past, broken items were repaired and reused. Why do you think this is the case? What problems may this lead to?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
          image: null
        }
      ]
    }
  }
};

const outputPath = join(__dirname, '..', 'testlar', 'full_mock_istudy_8.json');
writeFileSync(outputPath, JSON.stringify(mock8Data, null, 2), 'utf-8');
console.log('Successfully generated full_mock_istudy_8.json at:', outputPath);
