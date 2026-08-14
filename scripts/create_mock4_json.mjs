import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mock4Data = {
  id: "istudy-full-mock-4",
  title: "iStudy Full Mock Test 4",
  testFormat: "full_mock",
  testType: "authentic_material",
  level: "medium",
  center: "istudy",
  sections: {
    listening: {
      title: "iStudy Full Mock 4 — Listening",
      testFormat: "full_test",
      timer: 30,
      totalQuestions: 40,
      audio: "https://pub-e1b4bb7172ab47648a4ad3899784693e.r2.dev/mock4_listening.mp3",
      parts: [
        {
          partNumber: 1,
          questionRange: "1-10",
          image: null,
          questionGroups: [
            {
              groupType: "note_completion",
              instruction: "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
              questions: [
                {
                  number: 1,
                  question: "<b>Lifeguard Application</b><br><br><b>Personal information</b><ul><li>Name: Peter Smith</li><li>Address: 130 South Main Street, Lake ______</li></ul>",
                  answer: "Elsinore",
                  alternativeAnswers: []
                },
                {
                  number: 2,
                  question: "<ul><li>Contact number: ______ (cellphone)</li></ul>",
                  answer: "077896245",
                  alternativeAnswers: []
                },
                {
                  number: 3,
                  question: "<b>Work experience</b><ul><li>has a part-time job as a ______</li></ul>",
                  answer: "waiter",
                  alternativeAnswers: []
                },
                {
                  number: 4,
                  question: "<ul><li>is studying PE now</li><li>hopes to work in a high school as a ______ coach</li></ul>",
                  answer: "baseball",
                  alternativeAnswers: []
                },
                {
                  number: 5,
                  question: "<ul><li>Other relevant work experience: worked at the ______ as a lifeguard</li></ul>",
                  answer: "beach",
                  alternativeAnswers: ["local beach", "the beach", "the local beach"]
                },
                {
                  number: 6,
                  question: "<b>Qualification for water safety</b><ul><li>Good level of concentration</li><li>Good vision</li><li>Other relevant skills: ______</li></ul>",
                  answer: "diving",
                  alternativeAnswers: []
                },
                {
                  number: 7,
                  question: "<ul><li>Needs a certificate: it expires in ______</li></ul>",
                  answer: "October",
                  alternativeAnswers: []
                },
                {
                  number: 8,
                  question: "<b>Other information</b><ul><li>Preferred working time: ______ mornings</li></ul>",
                  answer: "Saturday",
                  alternativeAnswers: []
                },
                {
                  number: 9,
                  question: "<ul><li>He can start to work at: ______ o'clock</li></ul>",
                  answer: "6",
                  alternativeAnswers: ["six", "6:00"]
                },
                {
                  number: 10,
                  question: "<ul><li>Source of information: ______</li></ul>",
                  answer: "Radio",
                  alternativeAnswers: ["radio"]
                }
              ]
            }
          ]
        },
        {
          partNumber: 2,
          questionRange: "11-20",
          image: "https://pub-e1b4bb7172ab47648a4ad3899784693e.r2.dev/mock4_part2_map.png",
          questionGroups: [
            {
              groupType: "note_completion",
              instruction: "Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
              questions: [
                {
                  number: 11,
                  question: "<b>Barton House</b><ul><li>Before Barton bought this house, it was a ______</li></ul>",
                  answer: "farm",
                  alternativeAnswers: ["a farm"]
                },
                {
                  number: 12,
                  question: "<ul><li>The Chinese wallpaper was painted in the ______ century.</li></ul>",
                  answer: "18th",
                  alternativeAnswers: ["eighteenth", "18"]
                },
                {
                  number: 13,
                  question: "<ul><li>Barton died in the ______ room.</li></ul>",
                  answer: "bird",
                  alternativeAnswers: ["the bird"]
                },
                {
                  number: 14,
                  question: "<ul><li>The dining room has many antiques such as the ______ sold by Japanese.</li></ul>",
                  answer: "chairs",
                  alternativeAnswers: []
                },
                {
                  number: 15,
                  question: "<b>Backyard Garden</b><ul><li>______ plants that have been there for years.</li></ul>",
                  answer: "rare",
                  alternativeAnswers: []
                },
                {
                  number: 16,
                  question: "<ul><li>______ were introduced by the government.</li></ul>",
                  answer: "flamingos",
                  alternativeAnswers: ["flamingoes"]
                },
                {
                  number: 17,
                  question: "<ul><li>The most popular animal is the ______</li></ul>",
                  answer: "swans",
                  alternativeAnswers: ["swan"]
                }
              ]
            },
            {
              groupType: "map_labeling",
              instruction: "Label the map below. Choose the correct letter, A-F, next to questions 18-20.",
              questions: [
                {
                  number: 18,
                  question: "gallery",
                  answer: "C"
                },
                {
                  number: 19,
                  question: "woodland",
                  answer: "F"
                },
                {
                  number: 20,
                  question: "gift shop",
                  answer: "E"
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
              groupType: "matching",
              instruction: "What did the students say about each of the following volcanoes for their presentation? Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 21-25.",
              options: [
                "A need more photos to support",
                "B repeat other people's studies",
                "C inaccurate information",
                "D need first-hand material",
                "E need more details",
                "F no need to talk about it",
                "G check again"
              ],
              questions: [
                {
                  number: 21,
                  question: "shield volcanoes",
                  answer: "B"
                },
                {
                  number: 22,
                  question: "stratovolcanoes",
                  answer: "E"
                },
                {
                  number: 23,
                  question: "rhyolite caldera complexes",
                  answer: "C"
                },
                {
                  number: 24,
                  question: "monogenetic fields",
                  answer: "G"
                },
                {
                  number: 25,
                  question: "cinder cones",
                  answer: "F"
                }
              ]
            },
            {
              groupType: "multiple_choice",
              instruction: "Choose the correct letter, A, B or C.",
              questions: [
                {
                  number: 26,
                  question: "In Erica's view, what is wrong with Ian's last presentation?",
                  options: [
                    "A He did not read loud enough.",
                    "B He did not understand the main reason.",
                    "C He did not provide enough evidence."
                  ],
                  answer: "B"
                },
                {
                  number: 27,
                  question: "What materials do the students agree to add to their presentation?",
                  options: [
                    "A a complete documentary",
                    "B photographs included in the handouts",
                    "C Internet video clips"
                  ],
                  answer: "C"
                },
                {
                  number: 28,
                  question: "By using extinct and dormant volcanoes, the students try to",
                  options: [
                    "A distinguish between scientific and popular terms.",
                    "B distinguish between two different types of volcanoes.",
                    "C distinguish whether an eruption is about to happen."
                  ],
                  answer: "A"
                },
                {
                  number: 29,
                  question: "What did the professor say about Erica's last presentation?",
                  options: [
                    "A She carried out an in-depth discussion with other students.",
                    "B She did not provide sufficient data.",
                    "C She did not fully develop a personal point."
                  ],
                  answer: "C"
                },
                {
                  number: 30,
                  question: "The students both agree that volcanoes",
                  options: [
                    "A haven't caused disastrous outcomes.",
                    "B cannot help to reshape the landscape.",
                    "C are not fully recognised for their values."
                  ],
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
              instruction: "Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
              questions: [
                {
                  number: 31,
                  question: "<b>Introduction to Taxation</b><br><br><b>To certify income</b><ul><li>Enough ______ is needed, including:</li><li>wage statements</li><li>independent freelancer statements</li><li>invoices</li></ul>",
                  answer: "evidence",
                  alternativeAnswers: []
                },
                {
                  number: 32,
                  question: "<ul><li>______ statements</li></ul>",
                  answer: "bank",
                  alternativeAnswers: []
                },
                {
                  number: 33,
                  question: "<b>A tax year</b><ul><li>starts from ______</li></ul>",
                  answer: "April",
                  alternativeAnswers: []
                },
                {
                  number: 34,
                  question: "<ul><li>requires a statement of employment from ______</li></ul>",
                  answer: "employers",
                  alternativeAnswers: ["employer"]
                },
                {
                  number: 35,
                  question: "<b>Penalty for failing to pay tax</b><ul><li>the maximum amount is $ ______</li></ul>",
                  answer: "3,000",
                  alternativeAnswers: ["3000", "3 000"]
                },
                {
                  number: 36,
                  question: "<b>Tips</b><ul><li>Tax rate will be changed when buying a ______</li></ul>",
                  answer: "car",
                  alternativeAnswers: ["new car", "a car", "a new car"]
                },
                {
                  number: 37,
                  question: "<ul><li>______ for one single kind of tax is easier.</li></ul>",
                  answer: "calculation",
                  alternativeAnswers: []
                },
                {
                  number: 38,
                  question: "<b>Online tax service</b><ul><li>Information occupies small ______ space.</li></ul>",
                  answer: "storage",
                  alternativeAnswers: []
                },
                {
                  number: 39,
                  question: "<ul><li>Fewer ______ are made.</li></ul>",
                  answer: "mistakes",
                  alternativeAnswers: []
                },
                {
                  number: 40,
                  question: "<ul><li>A ______ is helpful to find the right kind of form.</li></ul>",
                  answer: "questionnaire",
                  alternativeAnswers: []
                }
              ]
            }
          ]
        }
      ]
    },
    reading: {
      title: "iStudy Full Mock 4 — Reading",
      testFormat: "full_test",
      timer: 60,
      totalQuestions: 40,
      passages: [
        {
          passageNumber: 1,
          title: "Sydney Opera House",
          image: null,
          content: "Sydney Opera House is an example of late modern architecture; it is admired internationally and treasured by the people of Australia.\n\nIn 1956 the Premier of New South Wales, Australia, announced an international competition for the design of an opera house for Sydney. It attracted more than 200 entries from around the world and was won by Jørn Utzon, a relatively little-known architect from Denmark. The story goes that during the judging of the competition, one judge, American architect Eero Saarinen, arrived in Sydney after the other three judges had started assessing the entries. He looked through their rejected entries and stopped at the Utzon design, declaring it to be outstanding.\n\nIt was Utzon’s life and travels that had shaped his design for the Sydney Opera House. Though he had never visited the site, he used his maritime background to study naval charts of Sydney Harbour. His early exposure to shipbuilding provided the inspiration for the design of the roof of the Sydney Opera House, which is a series of curved ‘shells’ that look like the sails of a sailing ship billowing on the wind. From his travels to Mexico, he had the idea of placing his building on a wide horizontal platform.\n\nConstruction of the platform began in 1959, and throughout the early 1960s Utzon amended his original designs in order to develop a way to build the large ‘shells’ that cover the two main halls. The construction of the roof brought together some of the world’s best engineers with Utzon’s vision. The design was one of the first examples of the use of computer-aided design for complex shapes.\n\nAlthough Utzon had spectacular plans for the interior, he was unable to realize them. Cost overruns contributed to criticism of the project and, after a change of government, the Minister of Works began questioning Utzon’s schedules and cost estimates. Payments to Utzon were stopped and he was forced to withdraw as chief architect in 1966. Following his resignation, there were protests through the streets led by prominent architect Harry Seidler and others, demanding Utzon be reinstated as architect. However, Utzon was not reinstated and left Australia in 1966. He never returned and new architects were appointed to complete the building in his absence.\n\nThe original cost estimate for the Opera House was $7 million, with the completion date set at 26 January 1963. However, the Opera House was not formally completed until 1973, having cost $102 million.\n\nSince its opening in 1973, Sydney Opera House has earned a reputation as a world-class performing arts centre, and become a symbol of both Sydney and Australia. Situated at Bennelong Point on Sydney Harbour, it consists of a series of large precast ‘shells’ made of concrete, each composed of sections of a sphere of 75.2 metres radius, forming the roofs of the structure, set on a monumental platform. The building is 183 metres long and 120 metres wide at its widest point. It is supported on 588 concrete piers which are sunk approximately 25 metres below sea level.\n\nAlthough the roof structures are commonly referred to as ‘shells’, they are precast concrete panels supported by concrete ribs. The ‘shells’ are covered with 1,056,006 white and cream-coloured tiles manufactured in a factory in Sweden that generally produced stoneware tiles for the paper-mill industry. The design solution and construction of the shell structure took eight years to complete, and the development of the special ceramic tiles took over three years. Apart from the tiles covering the ‘shells’, the building’s exterior is mostly clad with granite quarried in Australia.\n\nContrary to its name, Sydney Opera House includes multiple performance venues. It is among the busiest performing arts centres in the world, holding over 1,500 performances each year. It hosts a large number of performing arts companies, including the four resident companies: Opera Australia, the Australian Ballet, the Sydney Theatre Company and the Sydney Symphony Orchestra.\n\nWith its grand setting and cathedral-like atmosphere, the Concert Hall is Sydney Opera House’s most prestigious performance space. The largest of all Sydney Opera House interior venues, it delivers outstanding acoustics thanks to its high ceiling and wood panelling. There is a sizeable outdoor forecourt from which people ascend to the main entrance. The steps, which lead up from the forecourt to the main performance venues, are nearly 100 metres wide.\n\nIn 1999, Utzon was re-engaged to develop a set of design principles to act as a guide for future changes to the building. All of this design work he did from his base in Europe. These principles help to ensure that the building’s architectural integrity is maintained. The first alteration to the exterior of the building was the addition of a new colonnade, which shades nine large glass openings into the previously solid exterior wall. This Utzon-led project, completed in 2006, enabled theatre patrons to see the harbour for the first time from the theatre foyers. The design also incorporates the first public lift and interior escalators to assist less mobile patrons.\n\nSince 2007, the cultural, heritage and architectural importance of Sydney Opera House has been protected by its inclusion on the World Heritage List.",
          questionGroups: [
            {
              groupType: "true_false_not_given",
              instruction: "Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
              questions: [
                {
                  number: 1,
                  question: "Utzon was famous for his work before he designed the Opera House.",
                  answer: "FALSE"
                },
                {
                  number: 2,
                  question: "Utzon’s design was favoured by the four judges of the competition from the beginning.",
                  answer: "FALSE"
                },
                {
                  number: 3,
                  question: "Utzon’s knowledge of boats gave him the idea for parts of the Opera House.",
                  answer: "TRUE"
                },
                {
                  number: 4,
                  question: "Utzon was impressed by the opera houses he had seen in Mexico.",
                  answer: "NOT GIVEN"
                },
                {
                  number: 5,
                  question: "Utzon changed his designs in the 1960s after construction began.",
                  answer: "TRUE"
                },
                {
                  number: 6,
                  question: "Seidler defended Utzon’s role as architect.",
                  answer: "TRUE"
                },
                {
                  number: 7,
                  question: "Utzon went back to Australia in 1973 for the opening of the Opera House.",
                  answer: "FALSE"
                }
              ]
            },
            {
              groupType: "note_completion",
              instruction: "Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.",
              questions: [
                {
                  number: 8,
                  question: "<b>Sydney Opera House</b><br><br><b>Final cost</b><ul><li>$ ______</li></ul>",
                  answer: "102 million",
                  alternativeAnswers: ["102,000,000", "102m", "102M"]
                },
                {
                  number: 9,
                  question: "<b>Construction</b><ul><li>a large platform acting as a base for the building</li><li>concrete panels used to make ‘shells’, which are covered in tiles</li><li>over a million tiles from ______</li></ul>",
                  answer: "Sweden",
                  alternativeAnswers: []
                },
                {
                  number: 10,
                  question: "<ul><li>______ from Australia covering the outside walls</li></ul>",
                  answer: "granite",
                  alternativeAnswers: []
                },
                {
                  number: 11,
                  question: "<b>Use</b><ul><li>More than 1,500 performances annually</li><li>______ performing arts companies have their home base at the Opera House</li></ul>",
                  answer: "four",
                  alternativeAnswers: ["4"]
                },
                {
                  number: 12,
                  question: "<b>Outside</b><ul><li>A large ______ at the foot of a wide staircase</li></ul>",
                  answer: "forecourt",
                  alternativeAnswers: []
                },
                {
                  number: 13,
                  question: "<b>Alteration</b><ul><li>A colonnade was added in 2006</li><li>Openings made the ______ visible from foyers</li></ul>",
                  answer: "harbour",
                  alternativeAnswers: ["harbor"]
                }
              ]
            }
          ]
        },
        {
          passageNumber: 2,
          title: "Beachcombing for Early Humans in Africa",
          image: null,
          content: "From the earliest modern humans to the present day, our species has evolved dramatically in both biological and behavioural terms. What forces prompted these momentous changes?\n\nA  Kenya has long been known as the ‘cradle of mankind’ following the discovery of fossils thought to be of the first members of the human family, which arose in Africa around 6–7 million years ago. Various distinct species evolved from these ancestors over millions of years, including our own – Homo sapiens – around 250,000 years ago. ‘A lot of the research on the origins of modern humans has focused on defining their point of origin, then understanding why humans left Africa about 60,000 years ago to colonise the rest of the world,’ says anthropologist Dr Marta Mirazón Lahr of Cambridge University. ‘But we have no idea what happened between 200,000 years and 60,000 years ago. We also have very little information on what occurred inside Africa after 60,000 years, when the different population groups and languages we see today evolved. The genetics suggest that the expansion out of Africa is just the tip of a massive population expansion inside the continent.’\n\nB  Along with fellow Cambridge anthropologist Professor Robert Foley, Mirazón Lahr is investigating the evolutionary history of modern human populations. ‘The challenge is to find the sites where evidence of these early people can be recovered – their stone tools, the animals they hunted, their ornaments and, ultimately, the fossils of the people themselves,’ she says. She has chosen to focus on East Africa based on the theory that its past environment was suitable for sustained occupation over time. But the region is huge, and finding the right place to look is absolutely crucial. ‘In the past there were periods of enormous rainfall in the tropics,’ she says. ‘The lakes were much higher and their margins were wider. We are looking at where the ancient lake margins would have been when the lakes were last high, and that’s where we look.’\n\nC  Some of their most spectacular finds have been on the ancient Turkana beaches in Kenya’s Rift Valley. ‘Ten thousand years ago, this area was wetter, with animals such as gazelles, hippos and lions, and the beaches are still there, even though the lake is long gone. We’ve found a great many shells on the surface, and a small number of harpoons the people fished with. A lot has already been exposed by the wind, and occasionally we find sites where things are buried, and then we dig,’ she says. ‘We’re looking at the stone tools and how these relate to times of particularly high water levels. Then we’re looking at the fauna and, if we’re lucky, we find actual human fossils. The oldest fossil ever found that looks like a modern human is 200,000 years old, and comes from the Turkana Basin. We’re trying to find the fossils that mark the origin of Homo sapiens.’\n\nD  The primitive technologies that our early ancestors left behind gradually evolve, and comparing finds dated to different times can advance understanding of our own evolutionary trajectory. ‘We think the evolution to modern humans is associated with changes in behaviour and in technology, for example in their tool use. We’ve already found evidence that they started using animal bones to make tools, which was rare in earlier populations,’ says Mirazón Lahr. ‘The people who lived around here 10,000 years ago used microliths – a form of miniaturised stone tool technology,’ adds her colleague Foley. ‘Instead of producing one or two big flakes like the earliest modern humans, they produced lots of very small flakes to make composite tools. We’ve also found a beach in the Turkana Basin from about 200,000 years ago and that has its own very different fossilised fauna, and very different stone tools. The technology and the people changed a lot during the past 200,000 years.’\n\nE  Mirazón Lahr emphasises that geography and climate played a critical role in the origins and diversification of modern humans. ‘The times when the lakes were high were periods of plenty in East Africa,’ she says. ‘When it was very wet there were lots of animals to hunt, the vegetation could grow, and you can imagine that the people would have thrived.’ East Africa had a unique mosaic environment with lake basins, highlands and plains that provided alternative niches for foraging populations over this period. ‘We think that early modern humans could live in the region throughout these long periods, even if they had to move between basins.’ With a network of habitable zones, human populations survived by expanding, contracting and shifting ranges according to the state of the environment at any given time.\n\nF  By comparing the fossil records from different basins over time, Mirazón Lahr is trying to establish a spatial and temporal image of human occupation over the past 200,000 years. She believes that the way to find novel insights is to consider each problem from various angles. Drawing on her wide-ranging interests from molecular genetics to prehistory, and combining genetic, fossil, archaeological and palaeoclimatic information, she hopes to form an accurate and complete picture of our early ancestors’ lives and the external forces that shaped their evolution, both biological and behavioural.",
          questionGroups: [
            {
              groupType: "matching_headings",
              instruction: "Reading Passage 2 has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–vii.",
              questions: [
                {
                  number: 14,
                  question: "Paragraph A",
                  answer: "iii",
                  options: [
                    "i. How weather affected human evolution",
                    "ii. A disappointing find",
                    "iii. Two gaps in our knowledge",
                    "iv. A multi-disciplinary approach",
                    "v. Evidence of an earlier landscape",
                    "vi. Developments in artefacts over time",
                    "vii. Difficulties identifying where to focus research"
                  ]
                },
                {
                  number: 15,
                  question: "Paragraph B",
                  answer: "vii"
                },
                {
                  number: 16,
                  question: "Paragraph C",
                  answer: "v"
                },
                {
                  number: 17,
                  question: "Paragraph D",
                  answer: "vi"
                },
                {
                  number: 18,
                  question: "Paragraph E",
                  answer: "i"
                },
                {
                  number: 19,
                  question: "Paragraph F",
                  answer: "iv"
                }
              ]
            },
            {
              groupType: "summary_completion",
              instruction: "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
              questions: [
                {
                  number: 20,
                  question: "<b>The Ancient Turkana Beaches</b><br><br>Ten thousand years ago, a wide range of ______ lived in this area.",
                  answer: "animals",
                  alternativeAnswers: []
                },
                {
                  number: 21,
                  question: "The ______ which was in the basin disappeared a long time ago, but its beaches remain.",
                  answer: "lake",
                  alternativeAnswers: []
                },
                {
                  number: 22,
                  question: "A lot of ______ have been discovered on the ground,",
                  answer: "shells",
                  alternativeAnswers: []
                },
                {
                  number: 23,
                  question: "along with a few ______ which ancient humans used for fishing.",
                  answer: "harpoons",
                  alternativeAnswers: []
                },
                {
                  number: 24,
                  question: "The wind has uncovered many interesting objects, and others have been found by digging. Sometimes human remains are found in the form of ______.",
                  answer: "fossils",
                  alternativeAnswers: []
                }
              ]
            },
            {
              groupType: "multiple_choice_multiple",
              instruction: "Which TWO aspects of early humans do Mirazón Lahr and Foley's research focus on? Choose TWO letters, A–E.",
              questions: [
                {
                  numbers: [25, 26],
                  question: "Which TWO aspects of early humans do Mirazón Lahr and Foley's research focus on?",
                  options: [
                    "A the type of artefacts they created",
                    "B the way they interacted with other populations",
                    "C the kind of societies they lived in",
                    "D the regions they inhabited",
                    "E the form of language they used"
                  ],
                  answers: ["A", "D"]
                }
              ]
            }
          ]
        },
        {
          passageNumber: 3,
          title: "All in the Family",
          image: null,
          content: "A person's brothers and sisters can have a powerful effect on their adult behaviour.\n\nWe can choose our friends, the saying goes, but we cannot choose our family of origin. Our parents provide the genetic material and make powerful early role models, but even more influential in determining what kind of adult we will become are our brothers and sisters – our siblings. They occupy a position of unique intimacy in our lives and cast a longer shadow than many recognise or are prepared to acknowledge. By turns enraging and lovable, familiar and mysterious, our brothers and sisters are the human beings who people our first social relationships. And a sibling relationship is the most enduring relationship many of us will ever have – no less emotionally intense than the bonds we form with our spouses and our own children – if only because they started when we were so young.\n\nSurprising new research by Dr Gene Brody found that having older children who do well in school and are well liked by other children leads to parental ‘basking’ – increasing mothers’ self-esteem. It is clear that in turn this is associated with more positive parenting of younger children, who display fewer behavioural problems as a result. Conversely, parents who get a difficult first child may in turn experience a negative spiral of household tension.\n\nInternational sports star Piri Weepu is a rugby hard man, but at least some of his tough temperament was forged long ago in the family home. His older brother Billy started rugby-tackling little Piri when he was just four – to ‘harden him up’. It seemed to work: Piri followed his brother in playing for the under-sevens league before he even started school. There are as many such stories as there are families: in the formative hothouse of the family, siblings interact in complex ways with the powerful forcefields of parents, genetics and personality already at work. It starts with birth order, which determines play roles: the firstborn leader, the middle-child mediator and the rebellious youngest. These are roles that can stick for life.\n\nClinical psychologist Claire Cartwright says she has clients who believe, and it might not have been true, that they were treated differently from their siblings, that one child in the family was preferred over others. They are quite convinced that the parental judgements on them all those years ago were harsher, and that they were the ones who always got into trouble. Later, in the workplace, such a person might be particularly defensive, and so behave in a way more prone to attracting harsh judgements.\n\nHowever, the research shows that being Mummy or Daddy’s favourite has its own traps. If you were the easy-going, co-operative child at home, you probably excelled at pleasing parents and, later, bosses. But you might, as an adult, find it hard to be assertive with authority figures and lack direction. On the other hand, the sibling who is disruptive and annoying as a child may be able to reinterpret that role later, turning those attention-seeking characteristics into strengths like determination and leadership.\n\nHow is it that full siblings, despite sharing DNA, can turn out so differently? One answer is that, in fact, each sibling grows up in a different family, a unique micro-culture. For example, the firstborn is, for a while, an only child, and therefore has a completely different experience of the parents than those born later. The parents themselves are growing up too, weathering hardship or good fortune, so one sibling might experience stability and closeness while another might be raised in the midst of crisis.\n\nOf course, there are many positive aspects of sibling relationships. Annette Henderson, a lecturer in psychology, says firstborn children learn vocabulary more quickly than their siblings because they are not competing to spend one-on-one time with parents. But younger children in turn benefit from unintentional instruction from their bigger brothers and sisters, acquiring entire phrases and an understanding of social concepts such as politeness. Similarly, a Cambridge University study of 140 children found that even when there is a great deal of conflict, siblings will still create a rich world of play and make-believe that extends them developmentally. Love-hate relationships were common among the children, but even those who fought the most had as many positive interactions as the other sibling pairs. It is also true that children compete for parental attention by making themselves different from their brothers and sisters, particularly if they are close in age. A 2003 research paper studied adolescents from 185 families over two years, finding that those who changed, to differentiate themselves from their siblings, increased the amount of warmth they gained from parents, and also developed stronger personalities and a better sense of their own identity.\n\nAnother consideration is that many families today are smaller and more intimate than their historical counterparts. This may be advantageous because siblings tend to know each other better and remain lifelong friends compared to children from bigger or more widely spaced families, who perhaps lose touch with one another after leaving home. Then there was a 2010 American study which found that having a sister, whether younger or older, meant that 10- to 14-year-olds were less likely to feel lonely, unloved, self-conscious or fearful. The same study found that having a loving sibling of either gender promoted good deeds, such as helping a neighbour around the house or helping other children at school.",
          questionGroups: [
            {
              groupType: "yes_no_not_given",
              instruction: "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
              questions: [
                {
                  number: 27,
                  question: "Parents and siblings play equal roles in shaping people's adult personalities.",
                  answer: "NO"
                },
                {
                  number: 28,
                  question: "People's first social relationships tend to be with siblings of their own gender.",
                  answer: "NOT GIVEN"
                },
                {
                  number: 29,
                  question: "People's relationships with their siblings tend to receive less attention when they marry.",
                  answer: "NO"
                },
                {
                  number: 30,
                  question: "Parental 'basking' is advantageous for later siblings.",
                  answer: "YES"
                }
              ]
            },
            {
              groupType: "multiple_choice_single",
              instruction: "Choose the correct letter, A, B, C or D.",
              questions: [
                {
                  number: 31,
                  question: "What point does the writer make about birth order in the third paragraph?",
                  options: [
                    "A Its role is underestimated by parents.",
                    "B It may shape the characteristics of adults.",
                    "C Its importance decreases as children grow up.",
                    "D It has more influence on personality than genetics."
                  ],
                  answer: "B"
                },
                {
                  number: 32,
                  question: "What are we told about some of Claire Cartwright's clients?",
                  options: [
                    "A Their parents treated them fairly.",
                    "B They were treated harshly by their siblings.",
                    "C Their perceptions of childhood may be inaccurate.",
                    "D They have closer relations with their siblings as adults."
                  ],
                  answer: "C"
                },
                {
                  number: 33,
                  question: "What is the writer’s main point about siblings in the fifth paragraph?",
                  options: [
                    "A Parents tend to repeat their own parents’ mistakes.",
                    "B Favoured children are likely to make good leaders as adults.",
                    "C Negative characteristics in children can become positive in adults.",
                    "D Attention-seeking children are unlikely to please bosses in later life."
                  ],
                  answer: "C"
                },
                {
                  number: 34,
                  question: "Which of the following best summarises the writer’s argument in the sixth paragraph?",
                  options: [
                    "A Many children have a favourite parent.",
                    "B Parenting skills improve with later children.",
                    "C The family environment may change over time.",
                    "D Parents give more attention to firstborn children."
                  ],
                  answer: "C"
                }
              ]
            },
            {
              groupType: "summary_completion_with_options",
              instruction: "Complete the summary using the list of words, A–K, below.",
              questions: [
                {
                  number: 35,
                  question: "<b>The Positive Aspects of Sibling Relationships</b><br><br>Annette Henderson suggests that young children's interactions with older siblings involve ______.",
                  options: [
                    "A. parental love",
                    "B. imaginative games",
                    "C. physical development",
                    "D. generous behaviour",
                    "E. strong marriages",
                    "F. greater individuality",
                    "G. learning experiences",
                    "H. career success",
                    "I. closer relationships",
                    "J. healthy competition",
                    "K. mental well-being"
                  ],
                  answer: "G"
                },
                {
                  number: 36,
                  question: "Also, a Cambridge study found that siblings still enjoy ______ even when they have a tendency to fight.",
                  options: [
                    "A. parental love",
                    "B. imaginative games",
                    "C. physical development",
                    "D. generous behaviour",
                    "E. strong marriages",
                    "F. greater individuality",
                    "G. learning experiences",
                    "H. career success",
                    "I. closer relationships",
                    "J. healthy competition",
                    "K. mental well-being"
                  ],
                  answer: "B"
                },
                {
                  number: 37,
                  question: "Research conducted in 2003 suggests that children develop ______ as a result of seeking attention.",
                  options: [
                    "A. parental love",
                    "B. imaginative games",
                    "C. physical development",
                    "D. generous behaviour",
                    "E. strong marriages",
                    "F. greater individuality",
                    "G. learning experiences",
                    "H. career success",
                    "I. closer relationships",
                    "J. healthy competition",
                    "K. mental well-being"
                  ],
                  answer: "F"
                },
                {
                  number: 38,
                  question: "Another factor is the trend for smaller families, which may mean that today's siblings enjoy ______ as adults.",
                  options: [
                    "A. parental love",
                    "B. imaginative games",
                    "C. physical development",
                    "D. generous behaviour",
                    "E. strong marriages",
                    "F. greater individuality",
                    "G. learning experiences",
                    "H. career success",
                    "I. closer relationships",
                    "J. healthy competition",
                    "K. mental well-being"
                  ],
                  answer: "I"
                },
                {
                  number: 39,
                  question: "A 2010 American study linked having a sister with ______ among children aged 10–14.",
                  options: [
                    "A. parental love",
                    "B. imaginative games",
                    "C. physical development",
                    "D. generous behaviour",
                    "E. strong marriages",
                    "F. greater individuality",
                    "G. learning experiences",
                    "H. career success",
                    "I. closer relationships",
                    "J. healthy competition",
                    "K. mental well-being"
                  ],
                  answer: "K"
                },
                {
                  number: 40,
                  question: "Finally, having a sibling may promote ______ according to the same study.",
                  options: [
                    "A. parental love",
                    "B. imaginative games",
                    "C. physical development",
                    "D. generous behaviour",
                    "E. strong marriages",
                    "F. greater individuality",
                    "G. learning experiences",
                    "H. career success",
                    "I. closer relationships",
                    "J. healthy competition",
                    "K. mental well-being"
                  ],
                  answer: "D"
                }
              ]
            }
          ]
        }
      ]
    },
    writing: {
      title: "iStudy Full Mock 4 — Writing",
      testFormat: "full_test",
      timer: 60,
      tasks: [
        {
          taskNumber: 1,
          title: "Writing Task 1",
          content: "You should spend about 20 minutes on this task.\n\nThe graph below shows the global demand for different textile fibres between 1980 and 2015.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
          image: "https://pub-e1b4bb7172ab47648a4ad3899784693e.r2.dev/mock4_writing_task1.png"
        },
        {
          taskNumber: 2,
          title: "Writing Task 2",
          content: "You should spend about 40 minutes on this task.\n\nIn many countries, people's eating habits are leading to obesity and other health problems. Why do so many people have unhealthy eating habits? What is the most effective way to help people improve their eating habits?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
          image: null
        }
      ]
    }
  }
};

const outputPath = join(__dirname, '..', 'testlar', 'full_mock_istudy_4.json');
writeFileSync(outputPath, JSON.stringify(mock4Data, null, 2), 'utf-8');
console.log(`✅ full_mock_istudy_4.json muvaffaqiyatli yaratildi: ${outputPath}`);
