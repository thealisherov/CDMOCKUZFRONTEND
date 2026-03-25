import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const testData = {
  "id": "authentic-reading-15",
  "title": "Authentic Reading 15",
  "testFormat": "full_test",
  "testType": "authentic_material",
  "level": "medium",
  "timer": 60,
  "totalQuestions": 40,
  "testTution": "paid",
  "passages": [
    {
      "passageNumber": 1,
      "title": "Footprints in the muds of time",
      "image": null,
      "content": "The dinosaurs may have risen to power in as little as 10,000 years...\n\nEverybody knows that the dinosaurs became extinct as a result of a large asteroid; something big hit the Earth 65 million years ago and, when the dust had fallen, so had the great reptiles. There is thus a nice, if ironic, symmetry in the idea that a similar impact brought about the dinosaurs' rise. That is the thesis proposed by Paul Olsen of Columbia University.\n\nDinosaurs first appear in the fossil record 230 million years ago. during the Triassic period. But they were mostly small, and they shared the Earth with lots of other sorts of reptile. It was in the subsequent Jurassic period, which began 202 million years ago, that they overran the planet and turned into the monsters realistically depicted in modern books and movies. Dr Olsen and his colleagues are not the first to suggest that the dinosaurs inherited the Earth as the result of an asteroid strike. But they are the first to show that the takeover did. indeed, happen in a geological eye blink.\n\nDinosaur skeletons are rare. Dinosaur footprints are, however, surprisingly abundant. And the size of the prints is as good an indication of the size of the beasts as are the skeletons themselves. Dr Olsen and his colleagues therefore concentrated on prints, not bones. The prints in question were made in Eastern North America, a part of the world then full of rift valleys similar to those in East Africa today. Like the modern African rift valleys, the Triassic/Jurassic American ones contained lakes, and these lakes grew and shrank at regular intervals because of climatic changes. Rocks from this place and period can be dated to within a few thousand years. As a bonus, squishy lake-edge sediments are just the things for recording the tracks of passing animals. By dividing the labour between them, the research team were able to study such tracks at 80 sites and look at 18 so-called 'ichnotaxa'. These are recognisable types of footprint that cannot be matched precisely within the species of animal that left them. But they can be matched with a general sort of animal, and thus act as an indicator of the fate of that group, even when there are no bones to tell the story.\n\nTheir findings show that five of the ichnotaxa disappear before the end of the Triassic, and four march confidently across the boundary into the Jurassic. Six, however, vanish at the boundary, or only just splutter across it; and three appear from nowhere, almost as soon as the Jurassic begins. That boundary itself is suggestive. The first geological indication of the impact that killed the dinosaurs was an unusually high level of iridium in rocks at the end of the Cretaceous period, when the beasts disappear from the fossil record. Iridium is normally rare at the Earth's surface, but it is more abundant in meteorites. When people began to believe the impact theory, they started looking for other Cretaceous-end anomalies. One that turned up was a surprising abundance of fern spores in rocks just above the boundary layer - a phenomenon known as 'fern spike'.\n\nThat matched the theory nicely. Many modern ferns are opportunists. They cannot compete against plants with leaves, but if a piece of land is cleared by, say, a volcanic eruption, they are often the first things to set up shop there. An asteroid strike would have scoured much of the Earth of its vegetable cover, and provided a paradise for ferns. A fern spike in the rocks is thus a good indication that something terrible has happened.\n\nThe surprises are how rapidly the new ichnotaxa appeared and how quickly they increased in size. Dr Olsen and his colleagues suggest that the explanation for this may be a phenomenon called ecological release. This is seen today when reptiles (which in modern times tend to be small creatures) reach islands where they face no competitors. The most spectacular example is on the Indonesian island of Komodo, where local lizards have grown so large that they are often referred to as dragons. The dinosaurs, in other words, could flourish only when the competition had been knocked out.\n\nThat leaves the question of where the impact happened. No large hole in the Earth's crust seems to be 202 million years old. It may, of course, have been overlooked. Old craters are eroded and buried, and not always easy to find. Alternatively, it may have vanished. Although continental crust is more or less permanent, the ocean floor is constantly recycled by the tectonic processes that bring about continental drift. There is no ocean floor left that is more than 200 million years old, so a crater that formed in the ocean would have been swallowed up by now.\n\nThere is a third possibility, however. This is that the crater is known, but has been misdated. The Manicouagan 'structure', a crater in Quebec, is thought to be 214 million years old. It is huge - some 100 kilometres across - and seems to be the largest of between three and five craters that formed within a few hours of each other as the lumps of disintegrated comet hit the Earth one by one. Such an impact would surely have had a perceptible effect on the world, but the rocks from 214 million years ago do not record one. It is possible, therefore, that Manicouagan has been misdated. That will be the next thing to check.",
      "questionGroups": [
        {
          "groupType": "true_false_not_given",
          "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE, or NOT GIVEN.",
          "questions": [
            {
              "number": 1,
              "question": "There is still doubt about the theory that an asteroid strike killed the dinosaurs.",
              "answer": "FALSE"
            },
            {
              "number": 2,
              "question": "Books and the cinema have exaggerated the size of dinosaurs.",
              "answer": "FALSE"
            },
            {
              "number": 3,
              "question": "Other scientists have rejected Olsen’s idea of a sudden dinosaur occupation of the Earth.",
              "answer": "NOT GIVEN"
            },
            {
              "number": 4,
              "question": "Dinosaur footprints are found more frequently than dinosaur skeletons.",
              "answer": "TRUE"
            },
            {
              "number": 5,
              "question": "Ichnotaxa offer an exact identification of a dinosaur species.",
              "answer": "FALSE"
            },
            {
              "number": 6,
              "question": "There is evidence that some groups of dinosaur survived from the Triassic period into the Jurassic period.",
              "answer": "TRUE"
            }
          ]
        },
        {
          "groupType": "summary_completion",
          "instruction": "Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
          "questions": [
            {
              "number": 7,
              "question": "Dr Olsen's group believe that the sudden increase in the size of dinosaurs may have been due to something known as <b>7</b> ______.",
              "answer": "ecological release",
              "alternativeAnswers": ["Ecological release"]
            },
            {
              "number": 8,
              "question": "A current example of this can be found on Komod Island in Indonesia, where some of the lizards are commonly called <b>8</b> ______ because of their size.",
              "answer": "dragons",
              "alternativeAnswers": ["Dragons"]
            },
            {
              "number": 9,
              "question": "Apparently, they have grown this big because they do not have any <b>9</b> ______.",
              "answer": "competitors",
              "alternativeAnswers": ["Competitors", "competition", "Competition"]
            },
            {
              "number": 10,
              "question": "The asteroid strike that may have cleared the way for dinosaurs to become the dominant group probably occurred 202 million years ago.<br/><br/>According to the writer, there are three possible reasons why we have not found a large hole in the Earth's crust dating back 202 million years. First, it may have been <b>10</b> ______ by scientists, because craters are easily covered up.",
              "answer": "overlooked",
              "alternativeAnswers": ["Overlooked"]
            },
            {
              "number": 11,
              "question": "Or, it could have <b>11</b> ______ ;",
              "answer": "vanished",
              "alternativeAnswers": ["Vanished"]
            },
            {
              "number": 12,
              "question": "for example, if the hole had been in the ocean, it would no longer exist because of the <b>12</b> ______ that produce continental drift.",
              "answer": "tectonic processes",
              "alternativeAnswers": ["Tectonic processes"]
            },
            {
              "number": 13,
              "question": "Thirdly, the hole could still exist but have been <b>13</b> ______.",
              "answer": "misdated",
              "alternativeAnswers": ["Misdated"]
            }
          ]
        }
      ]
    },
    {
      "passageNumber": 2,
      "title": "The Constant Evolution of the Humble Tomato",
      "image": null,
      "content": "Heirloom tomatoes—varieties that have been passed down through several generations of a family because they are thought to have a particularly good flavor—are really no more 'natural' than the varieties available in grocery stores. New studies promise to restore their lost, healthy genes.\n\nA. Famous for their taste, color, and organic appearance, heirloom tomatoes are favorites of gardeners and advocates of locally grown foods. The tomato enthusiast might conclude that, given the immense varieties, heirlooms must have a more diverse and superior set of genes than the tomatoes available in grocery stores, those ordinary hybrid varieties such as cherry and plum. However, their seeming diversity is only skin-deep: heirlooms are actually feeble and inbred—the defective product of breeding experiments that began hundreds of years ago, and exploded thanks to enthusiastic backyard gardeners. The irony of all this,\" says Steven Tanksley, a geneticist at Cornell University, is all that diversity of heirlooms can be accounted for by a handful of genes. There're probably no more than 10 mutant genes that create the diversity of heirlooms you see. But rather than simply proving that the myth about the heirloom's diversity is wrong, Tanksley's deconstruction of the tomato genome, along with work by others, is showing how a small berry-like fruit from the Andes became one of the world's top crops.\n\nB. The cultivated tomato is a member of the nightshade family that includes New World crops such as the potato, which spread around the globe after Christopher Columbus brought them back to Spain in the 15th century. But whereas scientists have uncovered a wealth of archaeological evidence on early farming practices in the New World, the record is blank when it comes to the tomato. The modern tomato seems to have its origins in the Andes in South America and may have been domesticated in Vera Cruz, Mexico. Primitive varieties still grow throughout the Americas. All told, botanists call as many as 13 species 'tomatoes' and consider an additional four to be closely related.\n\nC. One might assume that one of these known wild species became today's cultivated crop, but that's not the case: the Mother Tomato has never been found. The closest relative is the currant tomato, which, based on genetic comparisons, split from today's tomato some 1.4 million years ago. So researchers like Tanksley have to work backward, crossing tomato varieties and species in order to understand how various genes influence shape and size. Once isolated, Tanksley later inserts those genes into other tomato varieties to make his case with a dramatic transformation.\n\nD. Tanksley concludes from his analyses that in their effort to make bigger, tastier, and faster-growing fruit, our ancestors ultimately exploited just 30 mutations out of the tomato's 35,000 genes. Most of these genes have only small effects on tomato size and shape, but recently Tanksley and his colleagues reported that they found a gene that increases fruit size by 50 percent. It was probably the most important event in domestication. The first written record of tomatoes—from Spain in the 1500s—confirms that this mutation, which enlarges tomatoes by producing compartments known as locules, existed back in the same yellow tomatoes that gave Italians the word pomodoro, or golden apple. Besides size, tomato farmers also selected for shape. To discover those genes, Esther van der Knaap, a Tanksley alumnus now at The Ohio State University, took a gene from one heirloom tomato and inserted it into a wild relative. She observed that, as a result, the tiny fruits became shaped like pears.\n\nE. The selection of these traits has, however, affected the heirloom's hardiness. They often suffer from infections that cause the fruit to crack, split, and otherwise rot quickly. Wild plants must continuously evolve to fend off such infections, points out Roger Chetelat of the Tomato Genetics Resource Center at the University of California. But in their quest for size, shape, and flavor, humans have inadvertently eliminated defensive genes. As a result, most possess only a single disease-resistant gene. Chetelat elaborates that heirlooms' taste may have less to do with their genes than with the productivity of the plant and the growing environment. Any plant that produces only two fruits, as heirlooms sometimes do, is highly likely to produce juicier, sweeter, and more flavorful fruit than varieties that produce 100, as commercial types do. In addition, heirlooms are sold ripened on the vine, a certain way to get tastier results than allowing them to mature on the shelf. This means breeders feel confident that getting germ-beating genes back into heirlooms won't harm the desirable aspects of the fruit. Modern breeding has resuscitated grocery store tomatoes with an influx of wild genes; in the past 50 years, as many as 40 disease-resistant genes have been bred back into commercial crops.\n\nF. In 1996, a tomato breeder and former Tanksley student named Doug Heath began a favorite project. After 12 years of traditional breeding with the help of molecular markers, he created a new multi-colored tomato less prone to cracking and also endowed with 12 disease-resistant genes. The original heirloom plant, Heath explains, had defective flowers, which is one reason why it produced only two fruits compared with the 30 he gets from his new variety. He claims he is also able to maintain a comparable flavor and sugar profile even on productive plants. The heirloom's defects are, after all, just an accident of a narrow breeding strategy left over from the very beginning of genetic modification.",
      "questionGroups": [
        {
          "groupType": "matching_paragraphs",
          "instruction": "Reading Passage 2 has six paragraphs, A-F. Which paragraph contains the following information?",
          "questions": [
            {
              "number": 14,
              "question": "An explanation of research aimed at restoring the health of the heirloom tomato",
              "answer": "F"
            },
            {
              "number": 15,
              "question": "A reference to a false belief about the heirloom tomato",
              "answer": "A"
            },
            {
              "number": 16,
              "question": "A description of the flavor of the heirloom tomato",
              "answer": "E"
            },
            {
              "number": 17,
              "question": "A reference to a single gene that significantly improves the cultivation of tomatoes",
              "answer": "D"
            }
          ]
        },
        {
          "groupType": "matching",
          "instruction": "Look at the following statements (Questions 18-21) and the list of researchers below. Match each statement with the correct researcher, A, B, C, or D.",
          "questions": [
            {
              "number": 18,
              "question": "The transplanting of certain genes into tomatoes can change their shape.",
              "options": [
                "A. Steven Tanksley",
                "B. Esther van der Knaap",
                "C. Roger Chetelat",
                "D. Doug Heath"
              ],
              "answer": "B"
            },
            {
              "number": 19,
              "question": "The flavor of the heirloom tomato is largely dependent on actual yield and cultivation.",
              "options": [
                "A. Steven Tanksley",
                "B. Esther van der Knaap",
                "C. Roger Chetelat",
                "D. Doug Heath"
              ],
              "answer": "C"
            },
            {
              "number": 20,
              "question": "A new type of tomato can be produced that is stronger than the original heirloom tomato yet equally sweet and flavorsome.",
              "options": [
                "A. Steven Tanksley",
                "B. Esther van der Knaap",
                "C. Roger Chetelat",
                "D. Doug Heath"
              ],
              "answer": "D"
            },
            {
              "number": 21,
              "question": "The wide variety of heirloom tomatoes is due to only a small number of genes.",
              "options": [
                "A. Steven Tanksley",
                "B. Esther van der Knaap",
                "C. Roger Chetelat",
                "D. Doug Heath"
              ],
              "answer": "A"
            }
          ]
        },
        {
          "groupType": "sentence_completion",
          "instruction": "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
          "questions": [
            {
              "number": 22,
              "question": "There is little information on the origin of the tomato despite the existence of __________ data on the growing of other New World crops.",
              "answer": "archaeological",
              "alternativeAnswers": ["Archaeological"]
            },
            {
              "number": 23,
              "question": "Although it is uncertain, the tomato is thought to have first grown in the __________.",
              "answer": "Andes",
              "alternativeAnswers": ["andes"]
            },
            {
              "number": 24,
              "question": "In regard to genetic similarities, the type of tomato __________ is the nearest to the earliest.",
              "answer": "currant",
              "alternativeAnswers": ["Currant"]
            },
            {
              "number": 25,
              "question": "A genetic __________ which is evident in pomodoro produced larger tomatoes.",
              "answer": "mutation",
              "alternativeAnswers": ["Mutation"]
            },
            {
              "number": 26,
              "question": "__________ are a problem for heirloom tomatoes because they frequently lead to damage and deterioration.",
              "answer": "infections",
              "alternativeAnswers": ["Infections"]
            }
          ]
        }
      ]
    },
    {
      "passageNumber": 3,
      "title": "Crossing the Threshold",
      "image": null,
      "content": "The renovated Auckland Art Gallery in New Zealand unites old and new, creating an irresistible urge to step inside.\n\nArchitects are finding it very difficult in today's cultural landscape. The profession faces a three-way threat: a public that apparently doesn't understand what architects do, developers who couldn't care less what they do, and overbearing councils micromanaging every single aspect of what they do. According to sources within the architectural profession, the situation is much worse when architects work on municipal buildings, as architects FIMT and Archimedia discovered with their Auckland Gallery makeover, where a vast number of external pressures threatened the project, and with so many bureaucratic difficulties it looked doomed to fail.\n\nThe major challenge of the gallery renovation project was that it involved two parts. The first was to restore the heritage building, dating back to 1888, which contained a network of small spaces, refurbished so often it contained 17 different floor heights. The second was to deliver a new extension that would not only double floor and exhibition space but also attract new patrons, a total necessity. While the old building's circulation was off-putting, so was something intangible yet just as powerful: its atmosphere. For many, Auckland Art Gallery was just an old building that served a limited range of patrons with highbrow interests, missing its chance to engage with new audiences.\n\nA 2003 survey of young people's impressions of the gallery confirmed this opinion, sounding more like references to an abandoned building. For the survey authors, \"threshold fear\"—where certain groups are intimidated from entering certain spaces by their off-putting atmosphere—was the institution's undoing, something no architect wants anything to do with. For those young people, Auckland Art Gallery was \"undemocratic, dusty\" and \"cold—the epitome of threshold fear.\" Also, 16% of the sample group had no idea where it even was, despite being interviewed on the pavement right outside it. Clearly, the gallery was fatally out of step at a time when New Zealand's national museum in Wellington was successfully engaging broader audiences with contemporary branding and marketing, interactive displays, and temporary events.\n\nThe decision to evolve the gallery was actually made in 2000, although it took eight years for building to commence, as the architects fought off heritage committees and conservationists trying to stop them. The architects were not just dealing with a disillusioned public, but also with precious timber and the parkland which surrounds the building. Pushing the design through the Environment Court, the body which approves renovations of this scale, alone took three years. During this time, the budget blew out by several million dollars, the funding dried up, and the new wing had to be completely redesigned.\n\nEven after the redesigns, the use of kauri timber, with its significance to New Zealand's Maori people, stirred up political debate. In the new building, the architects have used kauri to produce a canopy with a curving interior roof supported by tapered steel columns, also clad in kauri. The canopy represents a signature public face, its curvature filtering light to the forecourt to the west and creating a visual echo of the canopy of pohutukawa trees in Albert Park to the east. The park also has cultural significance to Maori as it was the site of early settlements.\n\nAnother success is the refurbishment of the heritage building, especially the Mackelvie Gallery, in disrepair after its characteristic early twentieth-century Edwardian decoration had been stripped out or walled away in previous renovations. Remarkably, the Mackelvie space has been reconstructed from two old photos, although the problem of multiple floor levels was so serious that scaffolding had to be erected at the highest level, with work progressing downwards—the reverse of normal practice. When it was over, a fascinating detail was retained: the lowest level visible under glass embedded in the new floor, the building itself as artwork, while elsewhere columns from the old gallery have been exposed in the walls of the new wing.\n\nThe connection is reinforced by sculptures from Maori artist Arnold Wilson decorating the columns, while fellow artist Bernard Makoare was a consultant, ensuring the gallery emphasized Maori beliefs. Still, that didn't stop the conservationist Stephen King from accusing the architects of 'throwing' kauri at a 'mediocre building' and of misappropriating the 'mana' (spiritual energy) of the precious material (which is almost extinct: harvesting of both petrified and swamp kauri has been likened to a gold rush). However, the kauri that was used here was from the forest floor, and King's misconceptions sum up the prejudice that surrounded the project.\n\nObjections also came from the Auckland Regional Council, worrying about the extension's impact on Albert Park, yet the project's relationship with parkland is one of the most successful outcomes. Impact is not only minimal, but it improves the park's social function. The extension's enormous glass atrium opens up the building by directing the gaze from street level to the parkland beyond, while inside, the new art space is fronted along the east by a continuous glass wall incorporating the park into the gallery. The glass becomes a \"screen\" for viewing the outside world and makes the art accessible to those in the park, a far cry from both \"white cube\" galleries worldwide, the plain boxes where paintings are hung in antiseptic walls, and also the dusty, impermeable Auckland Gallery of old.\n\nIn 2008, the gallery averaged just 190,000 visitors annually. After reopening, it had 300,000 in five months. Cynics will chalk that up to the novelty of the new, but the fact is the gallery is now an alluring cultural space which is crawling with young people.",
      "questionGroups": [
        {
          "groupType": "multiple_choice_single",
          "instruction": "Choose the correct letter, A, B, C, or D.",
          "questions": [
            {
              "number": 27,
              "question": "What is the writer's main point in the first paragraph?",
              "options": [
                "A. Criticism of architects by different groups is unfair.",
                "B. The architectural profession is generally well respected.",
                "C. The most difficult projects for architects are public buildings.",
                "D. Failure to deliver buildings is a result of poor communication."
              ],
              "answer": "C"
            },
            {
              "number": 28,
              "question": "The Auckland Gallery project was particularly difficult because",
              "options": [
                "A. the existing building was old and parts of it had fallen down.",
                "B. there was a high number of floors in the building.",
                "C. it involved renovating the existing building and adding a new one.",
                "D. it needed to satisfy the requirements of the existing patrons."
              ],
              "answer": "C"
            },
            {
              "number": 29,
              "question": "What disturbing information did the architects find out from the survey of young people?",
              "options": [
                "A. They did not visit the gallery because of the way it made them feel.",
                "B. They thought that the gallery buildings were not in use.",
                "C. The gallery had the reputation of being dirty.",
                "D. They did not like the entrance."
              ],
              "answer": "A"
            },
            {
              "number": 30,
              "question": "What point is the writer making when he says that 16% of the sample group did not know where the museum was?",
              "options": [
                "A. Young people are not interested in galleries.",
                "B. The gallery was not reaching out to involve young people.",
                "C. The entrance to the gallery was not well signposted.",
                "D. The location of the gallery was difficult to access."
              ],
              "answer": "B"
            },
            {
              "number": 31,
              "question": "Maori artists were used on this project to",
              "options": [
                "A. satisfy the concerns of conservationists.",
                "B. protect sacred materials in the Albert Park site.",
                "C. make sure the gallery respects Maori culture.",
                "D. ensure that certain sources of kauri were not used."
              ],
              "answer": "C"
            }
          ]
        },
        {
          "groupType": "yes_no_not_given",
          "instruction": "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES, NO, or NOT GIVEN.",
          "questions": [
            {
              "number": 32,
              "question": "Before the renovation, the Auckland Art Gallery was regarded as an elitist institution.",
              "answer": "YES"
            },
            {
              "number": 33,
              "question": "Stephen King's intervention in the project shows his understanding of the architects' use of kauri.",
              "answer": "NO"
            },
            {
              "number": 34,
              "question": "The way the building interacts with its surroundings is a triumph.",
              "answer": "YES"
            },
            {
              "number": 35,
              "question": "The glass flooring in the Mackelvie Gallery which reveals old features",
              "answer": "NOT GIVEN"
            },
            {
              "number": 36,
              "question": "The design of the extension to the Auckland Art Gallery is similar to the design of white cube galleries in other parts of the world.",
              "answer": "NO"
            }
          ]
        },
        {
          "groupType": "matching_sentence_endings",
          "instruction": "Complete each sentence with the correct ending, A-F, below.",
          "questions": [
            {
              "number": 37,
              "question": "The destruction of Edwardian ornamentation",
              "options": [
                "A. resulted in work being done in the opposite direction to that usually followed.",
                "B. is more than cosmetic and has improved the circulation.",
                "C. was the clue to rebuilding the Mackelvie Gallery successfully.",
                "D. has resulted in the building itself becoming a work of art.",
                "E. means that you should be able to tell whether you are in the old wing or the new one.",
                "F. was the result of earlier attempts to modernise the building."
              ],
              "answer": "F"
            },
            {
              "number": 38,
              "question": "It is extraordinary that a limited number of photographs",
              "options": [
                "A. resulted in work being done in the opposite direction to that usually followed.",
                "B. is more than cosmetic and has improved the circulation.",
                "C. was the clue to rebuilding the Mackelvie Gallery successfully.",
                "D. has resulted in the building itself becoming a work of art.",
                "E. means that you should be able to tell whether you are in the old wing or the new one.",
                "F. was the result of earlier attempts to modernise the building."
              ],
              "answer": "C"
            },
            {
              "number": 39,
              "question": "The problem of having so many floor levels to deal with",
              "options": [
                "A. resulted in work being done in the opposite direction to that usually followed.",
                "B. is more than cosmetic and has improved the circulation.",
                "C. was the clue to rebuilding the Mackelvie Gallery successfully.",
                "D. has resulted in the building itself becoming a work of art.",
                "E. means that you should be able to tell whether you are in the old wing or the new one.",
                "F. was the result of earlier attempts to modernise the building."
              ],
              "answer": "A"
            },
            {
              "number": 40,
              "question": "The glass flooring in the Mackelvie Gallery which reveals old features",
              "options": [
                "A. resulted in work being done in the opposite direction to that usually followed.",
                "B. is more than cosmetic and has improved the circulation.",
                "C. was the clue to rebuilding the Mackelvie Gallery successfully.",
                "D. has resulted in the building itself becoming a work of art.",
                "E. means that you should be able to tell whether you are in the old wing or the new one.",
                "F. was the result of earlier attempts to modernise the building."
              ],
              "answer": "D"
            }
          ]
        }
      ]
    }
  ]
};

async function run() {
  const { data: existing } = await supabase.from('Tests').select('id').eq('test_id', testData.id).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('Tests').update({ data: testData }).eq('test_id', testData.id);
    console.log(error ? `❌ ${error.message}` : `✅ Updated: ${testData.title}`);
  } else {
    const { error } = await supabase.from('Tests').insert({ test_id: testData.id, type: 'reading', data: testData });
    console.log(error ? `❌ ${error.message}` : `✅ Inserted: ${testData.title}`);
  }
}
run();
