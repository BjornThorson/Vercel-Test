"use client"
import Link from "next/link"
import {useEffect,useState} from "react"

type G={scene:string;clues:string[];flags:string[];trust:Record<string,number>;notes:string[];ending?:string}
type Choice={text:string;to:string;clue?:string;flag?:string;trust?:[string,number];show?:(g:G)=>boolean}
type Deduction={id:string;title:string;needs:string[];result:string}
type Scene={kicker:string;title:string;body:(g:G)=>string[];choices:(g:G)=>Choice[]}
const has=(g:G,x:string)=>g.clues.includes(x)||g.flags.includes(x)
const start:G={scene:"door",clues:[],flags:[],trust:{enfield:1,poole:1,lanyon:1,jekyll:2},notes:["Enfield stopped beside a neglected door." ]}
const deductions:Deduction[]=[
{id:"access",title:"Hyde is not merely blackmailing Jekyll",needs:["Jekyll's extraordinary will","Hyde carries a key to Jekyll's laboratory","Jekyll personally ordered the household to obey Hyde"],result:"Jekyll deliberately gave Hyde inheritance, money and private access. Coercion alone no longer explains their arrangement."},
{id:"identity",title:"Hyde's independence is doubtful",needs:["Jekyll and Hyde share the same handwriting","Jekyll experimented with divided identity"],result:"The handwriting and Lanyon's account support an impossible hypothesis: Hyde may not be a separate associate."},
{id:"danger",title:"Jekyll is in danger inside his own house",needs:["Poole is frightened for Jekyll","Carew was killed with Jekyll's old cane"],result:"Hyde's violence and privileged access make the laboratory a danger, not a refuge."}
]
const scenes:Record<string,Scene>={
door:{kicker:"SUNDAY · A BY-STREET",title:"Story of the Door",body:g=>["Enfield's walking stick stops against the kerb. Across the street, one door spoils an otherwise prosperous row: blistered paint, no bell, no knocker.","“Did you ever remark that door?” he asks.","You know Richard Enfield well enough to hear the invitation hidden inside the casual question."],choices:g=>[
{text:"Let Enfield tell the story in his own way.",to:"enfield",trust:["enfield",1]},
{text:"Ask first why he remembers this particular door.",to:"enfieldWhy",flag:"observant"}
]},
enfieldWhy:{kicker:"THE BY-STREET",title:"A Question Before the Story",body:g=>["Enfield glances at you. “Because I once saw a man come through it who ought to have been horsewhipped.”","That is unusually strong language from him. You say nothing more. Silence does the work."],choices:g=>[{text:"Wait.",to:"enfield",trust:["enfield",1]}]},
enfield:{kicker:"THE BY-STREET",title:"The Man Who Trampled Calmly",body:g=>["At three in the morning Enfield saw a small man collide with a running child—and walk calmly over her body.","The family caught him. A crowd formed. Everyone who looked at the man disliked him at once. To avoid scandal he paid one hundred pounds, most of it by cheque.","The cheque was genuine. The signature belonged to a gentleman whose name Enfield refuses to repeat."],choices:g=>[
{text:"Ask for the stranger's name.",to:"hydeName",clue:"Edward Hyde"},
{text:"Ask about the cheque. A genuine signature matters more than gossip.",to:"cheque",clue:"The cheque was signed by a respected man"},
{text:"Ask Enfield to describe the man.",to:"describe",clue:"Hyde inspires disgust without a describable deformity"}
]},
cheque:{kicker:"THE BY-STREET",title:"A Genuine Signature",body:g=>["“I banked it myself,” Enfield says. “It was no forgery.”","He will not name the drawer. He calls the arrangement blackmail because he cannot imagine another explanation.","You can."],choices:g=>[
{text:"Now ask the stranger's name.",to:"hydeName",clue:"Edward Hyde"},
{text:"Suggest that the respectable man may be protecting Hyde willingly.",to:"hydeName",flag:"voluntary",trust:["enfield",-1]}
]},
describe:{kicker:"THE BY-STREET",title:"A Face That Will Not Resolve",body:g=>["Enfield tries twice. Small. Pale. Something wrong with him. Deformed, perhaps, though no feature is malformed enough to name.","“I can see him now,” he says, irritated, “and still I cannot describe him.”","That failure interests you more than a description would have."],choices:g=>[{text:"Ask his name.",to:"hydeName",clue:"Edward Hyde"}]},
hydeName:{kicker:"THE BY-STREET",title:"Edward Hyde",body:g=>["“Hyde,” Enfield says. “Edward Hyde.”","The name opens a locked drawer in your memory: Henry Jekyll's will.","You and Enfield agree not to speak of the matter again. It is a promise you intend to keep in the narrowest possible sense."],choices:g=>[{text:"Go home and read the will.",to:"will",clue:"Jekyll's extraordinary will"}]},
will:{kicker:"THAT EVENING · UTTERSON'S HOUSE",title:"The Will",body:g=>["The clauses are as offensive as you remember. If Henry Jekyll dies, Edward Hyde inherits everything. If Jekyll disappears for three months, Hyde inherits immediately.","You objected when Jekyll brought it to you. He refused amendment.","Enfield's story changes the document. It no longer looks eccentric. It looks frightened."],choices:g=>[
{text:"Visit Dr Lanyon. Ask about Jekyll before mentioning Hyde.",to:"lanyon",flag:"lanyonFirst"},
{text:"Begin watching the mysterious door. Meet Hyde before asking anyone else's opinion.",to:"watch",flag:"hydeFirst"}
]},
lanyon:{kicker:"CAVENDISH SQUARE",title:"An Old Scientific Quarrel",body:g=>["Lanyon receives you with wine and warmth. Jekyll's name spoils both.","“Henry became too fanciful for me,” he says. “Unscientific balderdash.”","When you ask about Edward Hyde, Lanyon's irritation becomes genuine confusion. He has never heard the name."],choices:g=>[
{text:"Respect the boundary. Ask only when Lanyon last saw Jekyll well.",to:"watch",clue:"Lanyon has never heard of Hyde",trust:["lanyon",1]},
{text:"Use the will. Tell Lanyon Hyde stands to inherit everything.",to:"lanyonDeep",clue:"Lanyon has never heard of Hyde",trust:["lanyon",-1]}
]},
lanyonDeep:{kicker:"CAVENDISH SQUARE",title:"The Shape of the Quarrel",body:g=>["Lanyon reads the relevant clause twice.","He tells you more than he intended: Jekyll had become obsessed with separating elements of human identity that medicine regards as indivisible.","“If Henry has attached a legal person to that nonsense,” Lanyon says, “then I was not alarmed enough.”"],choices:g=>[{text:"Take that warning to the door.",to:"watch",clue:"Jekyll experimented with divided identity"}]},
watch:{kicker:"NIGHTS LATER · THE DOOR",title:"Mr Hyde",body:g=>["You make the door part of your routine. There is no clock ticking; you simply refuse to let patience become an excuse for ignorance.","Eventually footsteps come quickly down the street. The man is small. He carries a key.","“Mr Hyde?”","He turns. Enfield was right. Your dislike arrives before your reason for it."],choices:g=>[
{text:"Be courteous. Ask for his address in case Jekyll's affairs require it.",to:"hydeCivil",clue:"Hyde carries a key to Jekyll's laboratory"},
{text:"Tell him you know about the will and watch his reaction.",to:"hydeWill",clue:"Hyde carries a key to Jekyll's laboratory"}
]},
hydeCivil:{kicker:"THE DOOR",title:"A Civil Exchange",body:g=>["Hyde gives you his Soho address. He even lets you study his face.","Then he asks how you knew him. You mention common friends. Jekyll, for instance.","“He never told you,” Hyde says, suddenly angry.","That is useful. Hyde knows what Jekyll has and has not told you."],choices:g=>[{text:"Go to Jekyll's front door and speak with Poole.",to:"poole",clue:"Hyde's Soho address"}]},
hydeWill:{kicker:"THE DOOR",title:"The Beneficiary",body:g=>["For the first time Hyde loses control of his face.","“A lawyer should know when a document is none of his business.”","“I am the lawyer who holds it.”","He steps closer, then thinks better of whatever impulse moved him. He unlocks the door and disappears.","You have frightened him. You are not sure that was wise, but it was certainly real."],choices:g=>[{text:"Go immediately to Jekyll's house.",to:"poole",flag:"hydeThreatened",clue:"Hyde knows the terms of Jekyll's will"}]},
poole:{kicker:"DR JEKYLL'S HOUSE",title:"The Servant Knows the House",body:g=>["Poole confirms Hyde has a key. More troublingly, every servant has orders to obey him.","You can question Poole as a witness, or speak to him as a man worried about his employer."],choices:g=>[
{text:"Ask formally who authorised Hyde's access and when.",to:"pooleFormal",clue:"Jekyll personally ordered the household to obey Hyde"},
{text:"Tell Poole you are worried about Henry, not the will.",to:"pooleTrust",trust:["poole",2],clue:"Poole is frightened for Jekyll"}
]},
pooleFormal:{kicker:"DR JEKYLL'S HOUSE",title:"On the Record",body:g=>["Poole answers precisely. Dr Jekyll gave the orders himself. Hyde comes and goes through the laboratory and rarely uses the respectable front of the house.","You have facts. Poole has not given you his fear."],choices:g=>[{text:"Stay for Jekyll after dinner.",to:"jekyll"}]},
pooleTrust:{kicker:"DR JEKYLL'S HOUSE",title:"A Quiet Confidence",body:g=>["Poole looks toward the laboratory court before answering.","“I don't like it, sir. None of us do.”","He promises that if the household ever believes Jekyll is in danger, he will send for you before waiting on propriety."],choices:g=>[{text:"Stay for Jekyll after dinner.",to:"jekyll",flag:"poolePromise"}]},
jekyll:{kicker:"TWO WEEKS LATER · AFTER DINNER",title:"Henry Jekyll Quite at Ease",body:g=>["When the last guest leaves, you remain. Jekyll looks healthy, handsome, almost offensively reassuring.","You mention the will. His face changes.","This is where evidence matters. You may confront him only with what you actually learned."],choices:g=>[
{text:"Tell him Hyde has a key and the servants obey him.",to:"jekyllKey",show:g=>has(g,"Hyde carries a key to Jekyll's laboratory")},
{text:"Tell him Lanyon knows about his divided-identity experiments.",to:"jekyllScience",show:g=>has(g,"Jekyll experimented with divided identity")},
{text:"Tell him Hyde knows the terms of the will.",to:"jekyllWill",show:g=>has(g,"Hyde knows the terms of Jekyll's will")},
{text:"Say only that you have met Hyde and are afraid for him.",to:"jekyllGentle"}
]},
jekyllKey:{kicker:"DR JEKYLL'S DINING ROOM",title:"The Key",body:g=>["Jekyll cannot pretend Hyde is an external blackmailer once you describe the household orders.","“I can be rid of Mr Hyde whenever I choose,” he says.","“Then choose.”","For a moment he looks less offended than exhausted. You have forced the question earlier than he wanted."],choices:g=>[{text:"Ask him to surrender Hyde's key tonight.",to:"intervention",flag:"keyDemand",trust:["jekyll",-1]},{text:"Offer confidentiality if he tells you why Hyde exists.",to:"confessionChance",trust:["jekyll",1]}]},
jekyllScience:{kicker:"DR JEKYLL'S DINING ROOM",title:"Two Men in One",body:g=>["At Lanyon's name Jekyll rises from his chair.","You repeat only what Lanyon told you: separation, identity, a scientific quarrel.","Jekyll's anger gives way to fear. You have come dangerously close to the truth without knowing it."],choices:g=>[{text:"Tell him you will listen as a friend, not a solicitor.",to:"confessionChance",trust:["jekyll",2]},{text:"Demand he end the experiment before Hyde hurts someone.",to:"intervention",flag:"scienceDemand"}]},
jekyllWill:{kicker:"DR JEKYLL'S DINING ROOM",title:"A Beneficiary Too Well Informed",body:g=>["Jekyll goes white when you tell him Hyde knows the will's exact terms.","That reaction answers a question you did not ask: Jekyll did not intend Hyde to boast of the arrangement.","“Henry,” you say, “whatever bargain you think you control, the other party is planning around your death.”"],choices:g=>[{text:"Insist the will be revoked tonight.",to:"intervention",flag:"willRevoked"},{text:"Ask what Hyde has over him.",to:"confessionChance",trust:["jekyll",1]}]},
jekyllGentle:{kicker:"DR JEKYLL'S DINING ROOM",title:"A Friend's Promise",body:g=>["Jekyll asks you to trust him. He can be rid of Hyde whenever he chooses.","Then he asks you to promise that if anything happens, you will protect Hyde's rights.","You can hear the plea. You cannot yet hear the truth behind it."],choices:g=>[{text:"Promise only to protect Jekyll, not Hyde.",to:"intervention",trust:["jekyll",1]},{text:"Give the promise he asks for.",to:"carew",flag:"promisedHyde",trust:["jekyll",2]}]},
confessionChance:{kicker:"DR JEKYLL'S DINING ROOM",title:"Almost",body:g=>["Jekyll walks to the fire. Twice he begins to speak.","Your evidence has changed this conversation: he knows you are not guessing. But confession would mean destroying the respectable Henry Jekyll before Hyde has yet destroyed him.","He cannot do it. Not tonight.","He does, however, give you a sealed note: if he sends for you, come at once and bring Lanyon."],choices:g=>[{text:"Take the note. Do not force what he cannot yet say.",to:"carew",flag:"jekyllSignal",trust:["jekyll",1]}]},
intervention:{kicker:"DR JEKYLL'S DINING ROOM",title:"A Line Drawn Early",body:g=>["You leave Jekyll angry, but not untouched. Something changes afterward.","For months Hyde vanishes. Jekyll returns to friends, dinners and charity. Whether you caused the improvement or merely coincided with it, you cannot know.","Then Sir Danvers Carew is murdered in the street."],choices:g=>[{text:"Answer the police summons.",to:"carew",flag:"intervened"}]},
carew:{kicker:"OCTOBER · AFTER MIDNIGHT",title:"The Carew Murder Case",body:g=>["A maid saw Edward Hyde beat an elderly gentleman to death. The victim is Sir Danvers Carew.","Half a heavy cane lies beside the body. You recognise it. You gave that cane to Henry Jekyll years ago.","Inspector Newcomen asks whether the name Edward Hyde means anything to you.","Now your earlier choices stop being private."],choices:g=>[
{text:"Give Newcomen Hyde's Soho address.",to:"soho",show:g=>has(g,"Hyde's Soho address"),clue:"Carew was killed with Jekyll's old cane"},
{text:"Tell Newcomen Hyde has access to Jekyll's laboratory.",to:"policeJekyll",show:g=>has(g,"Hyde carries a key to Jekyll's laboratory"),clue:"Carew was killed with Jekyll's old cane"},
{text:"Withhold Jekyll's connection for now and go to him first.",to:"jekyllAfter",clue:"Carew was killed with Jekyll's old cane",flag:"withheld"}
]},
soho:{kicker:"SOHO · MORNING",title:"Hyde's Rooms",body:g=>["Newcomen searches Hyde's rooms. Fine wine, good pictures, clothes in disorder. The other half of the cane is found behind a door.","Papers have been burned. Hyde is gone.","The police now have a murderer. You still have a mystery."],choices:g=>[{text:"Go to Jekyll. Ask for the truth before the police find it.",to:"jekyllAfter",clue:"The broken cane was found in Hyde's rooms"}]},
policeJekyll:{kicker:"SCOTLAND YARD",title:"A Dangerous Disclosure",body:g=>["Newcomen's interest sharpens immediately. A wanted murderer with private access to a wealthy doctor's laboratory is no longer merely your friend's embarrassment.","You have accelerated the law. Jekyll will have less room to hide—and less room to choose confession."],choices:g=>[{text:"Go with Newcomen to Jekyll's house.",to:"finalLaw",flag:"policeEarly"}]},
jekyllAfter:{kicker:"DR JEKYLL'S LABORATORY",title:"After Carew",body:g=>["Jekyll looks ill. He swears Hyde is gone forever and gives you a letter supposedly written by him.","The letter promises escape. Jekyll wants you to believe the problem has solved itself.","You have learned enough to decide whether to accept that comfort."],choices:g=>[
{text:"Take the letter to Mr Guest for handwriting comparison.",to:"guest",clue:"Hyde's farewell letter"},
{text:"Refuse the letter. Invoke the signal Jekyll gave you and summon Lanyon now.",to:"finalRescue",show:g=>has(g,"jekyllSignal"),flag:"summonedLanyon"},
{text:"Trust Jekyll one last time.",to:"window",trust:["jekyll",1]}
]},
guest:{kicker:"UTTERSON'S HOUSE",title:"The Hand",body:g=>["Mr Guest studies Hyde's letter beside one of Jekyll's dinner invitations. He does not know what you suspect.","He lays the pages side by side. The resemblance is not in one letter but in habit: pressure, spacing, the impatient return of the pen.","“The two hands are in many points identical,” he says. “Only differently sloped.”","You lock both papers away. A fact is not yet an explanation."],choices:g=>[
{text:"Keep the comparison private and observe what Jekyll does next.",to:"recovery",clue:"Jekyll and Hyde share the same handwriting"},
{text:"Give the comparison to Inspector Newcomen.",to:"finalLaw",clue:"Jekyll and Hyde share the same handwriting"}
]},
recovery:{kicker:"NOVEMBER–JANUARY",title:"A Season of Relief",body:g=>["Hyde vanishes. Jekyll emerges.","For nearly two months your friend becomes the man London remembers: dinners, charitable subscriptions, old acquaintances restored. You dine with him and begin, against your training, to believe a problem may truly have ended.","Then Jekyll's door is closed to you. It remains closed. Poole gives the same answer each time.","You go to Lanyon expecting irritation and find a man who appears to have aged years in days."],choices:g=>[
{text:"Ask Lanyon what happened between him and Jekyll.",to:"lanyonIll"},
{text:"Say nothing of Jekyll. Sit with your dying friend.",to:"lanyonIll",trust:["lanyon",1]}
]},
lanyonIll:{kicker:"CAVENDISH SQUARE",title:"A Man Under Sentence",body:g=>["Lanyon's colour is gone. The hearty physician who laughed at Jekyll's science now speaks like a man who has seen his own death approaching.","At Jekyll's name he raises a trembling hand. “I wish to see or hear no more of Dr Jekyll.”","He will not tell you why. One day, after his death, you may learn the right and wrong of it.","Within a fortnight Hastie Lanyon is dead."],choices:g=>[
{text:"Examine the packet Lanyon left for you.",to:"packet",clue:"Lanyon died after a final encounter connected to Jekyll"}
]},
packet:{kicker:"UTTERSON'S HOUSE · AFTER MIDNIGHT",title:"Not to Be Opened",body:g=>["The envelope is addressed in Lanyon's hand. Inside is another, sealed more heavily.","The instruction is precise: not to be opened until the death or disappearance of Dr Henry Jekyll.","A dead friend has given you evidence and forbidden you to read it. As a solicitor, you understand the force of instructions. As a friend, you understand their cruelty."],choices:g=>[
{text:"Seal it in your private safe as instructed.",to:"window",flag:"packetSealed",clue:"Lanyon's sealed narrative"},
{text:"Break the seal now.",to:"lanyonNarrative",flag:"packetBroken",clue:"Lanyon's sealed narrative"}
]},
lanyonNarrative:{kicker:"LANYON'S NARRATIVE",title:"The Impossible Witness",body:g=>["Lanyon describes a registered letter from Jekyll: force the cabinet, remove a drawer of powders and a phial, wait at midnight for a messenger.","The messenger was Hyde.","Before Lanyon's eyes Hyde mixed the drug, drank, convulsed—and became Henry Jekyll.","The page trembles in your hand. Lanyon's death is suddenly comprehensible. So is almost everything else."],choices:g=>[
{text:"Go to Jekyll at once with Lanyon's testimony.",to:"finalConfront",flag:"knowsIdentity",clue:"Lanyon witnessed Hyde transform into Jekyll"}
]},
window:{kicker:"A SUNDAY WALK · THE COURTYARD",title:"Incident at the Window",body:g=>["Enfield leads you again past the old door. By mutual consent you enter the court behind Jekyll's house.","Jekyll sits at an upper window like a prisoner taking air. You call up to him. For a moment the three of you manage an ordinary conversation.","Then the smile is struck from Jekyll's face. An expression of terror and despair replaces it.","The window comes down. You and Enfield leave in silence. Neither man attempts an explanation."],choices:g=>[
{text:"Return alone and ask Poole whether the household has seen the same terror.",to:"pooleUnease",show:g=>has(g,"Poole is frightened for Jekyll")},
{text:"Jekyll has refused you before. Wait until you have cause to override him.",to:"pooleNight"}
]},
pooleUnease:{kicker:"JEKYLL'S HOUSE · SERVANTS' HALL",title:"Below Stairs",body:g=>["Poole does not pretend surprise when you return.","For days the laboratory door has remained locked. Orders arrive on slips of paper. The voice from within sounds wrong to him.","Most disturbing is the medicine. The unseen occupant has sent Poole from chemist to chemist seeking a particular salt, rejecting every batch as impure.","You ask whether Poole has seen his master. He looks at you for a long time before saying, “I have seen someone.”"],choices:g=>[
{text:"Ask what he means by someone.",to:"pooleFigure",clue:"The cabinet occupant is desperately seeking an old chemical salt"},
{text:"Tell Poole to send for you the instant he fears for Jekyll's life.",to:"pooleNight",flag:"pooleReady"}
]},
pooleFigure:{kicker:"SERVANTS' HALL",title:"A Figure in the Laboratory",body:g=>["Poole once surprised a figure searching among crates in the theatre. It cried out and fled upstairs.","Too small for Jekyll, he says. Moving differently.","“It was Mr Hyde, sir. I swear it.”","The servants believe their master has been murdered and his killer has occupied the cabinet."],choices:g=>[
{text:"Do not endorse the servants' conclusion. Tell Poole to send for you if the door remains shut.",to:"pooleNight",clue:"Poole saw a smaller figure inside Jekyll's laboratory",flag:"pooleReady"}
]},
pooleNight:{kicker:"THE LAST NIGHT",title:"Poole at the Fireside",body:g=>["One evening Poole appears at your house without being announced.","His manner settles the question before his words do. “Mr Utterson, sir, there is something wrong.”","At Jekyll's house every servant is gathered in the hall. One maid begins to cry when she sees you. From across the courtyard comes the measured tread of someone pacing the cabinet.","Poole puts a scrap of paper in your hand: another demand for the old salt, written in the hand you know."],choices:g=>[
{text:"Compare the note with the papers in your case before deciding what to do.",to:"deductionGate",clue:"The cabinet occupant writes in Jekyll's hand"},
{text:"Ask Poole to describe everything he has heard and seen tonight.",to:"lastNightEvidence",clue:"The cabinet occupant writes in Jekyll's hand"}
]},
lastNightEvidence:{kicker:"THE LAST NIGHT",title:"The Voice Behind the Door",body:g=>["Poole called through the door earlier. The answer begged him to leave the medicine and go.","He says it was not Jekyll's voice. Yet the written orders are unmistakably Jekyll's hand.","You remember Guest's comparison, if you made it. You remember Lanyon's sealed terror. You remember Hyde's key.","The facts no longer sit politely apart."],choices:g=>[{text:"Lay out the case papers and decide what they mean.",to:"deductionGate",clue:"The voice in the cabinet is not Jekyll's"}]},
deductionGate:{kicker:"THE LAST NIGHT · CASE PAPERS",title:"What Do the Facts Permit?",body:g=>["You spread the papers across Jekyll's dining table. Poole waits.","A case file is useful only when facts can be made to bear upon one another. Establish any deduction the evidence supports in the case-paper column.","What you can justify now determines what you are willing to do to the cabinet door."],choices:g=>[
{text:"Act on the conclusion that Hyde's access came from Jekyll himself.",to:"finalConfront",show:g=>has(g,"ded:access")},
{text:"Act on the hypothesis that Jekyll and Hyde are not independent men.",to:"finalConfront",show:g=>has(g,"ded:identity")||has(g,"knowsIdentity")},
{text:"Treat the laboratory as an immediate danger to Jekyll.",to:"finalConfront",show:g=>has(g,"ded:danger")},
{text:"You cannot justify breaking the door.",to:"finalCanon"}
]},
finalConfront:{kicker:"THE LABORATORY DOOR",title:"The Cabinet Door",body:g=>["You and Poole cross the courtyard carrying a poker and an axe. The theatre is cold enough to show your breath.","At the red-baize door you call Henry Jekyll by name. The answer is a plea for mercy.","Poole whispers, “That is not my master's voice.”","Whatever theory brought you here, the door now stands between evidence and fact."],choices:g=>[
{text:"Ask Henry Jekyll to come out, whatever shape he is wearing.",to:"endMercy"},
{text:"Tell Poole to fetch the police.",to:"endLaw"}
]},
finalRescue:{kicker:"THE LABORATORY · BEFORE MIDNIGHT",title:"The Friend Who Came When Called",body:g=>["Lanyon comes because you ask him to, complaining all the way.","Jekyll opens the door himself. He is shaking. On the table: salts, a phial, and a mixture the colour of bruised wine.","Because you forced the crisis before isolation became absolute, Jekyll confesses while he is still Jekyll. Lanyon sees the transformation and survives the knowledge long enough to help.","The formula is destroyed. Henry lives. Hyde does not return.","Jekyll loses reputation, practice and much of his fortune. He keeps his life. Years later you remain his solicitor, which is perhaps the least surprising part of the affair."],choices:g=>[{text:"Close the case.",to:"endRescue"}]},
finalLaw:{kicker:"DR JEKYLL'S HOUSE",title:"The Law Enters",body:g=>["Inspector Newcomen arrives with authority that friendship never had.","The laboratory cannot remain private. Hyde is found there; so are Jekyll's papers, chemicals and confession.","The transformation is witnessed under guard. Henry Jekyll survives to face a legal question England has no language for: whether one body can contain both murderer and victim.","You preserve the evidence. You do not preserve your friend's name."],choices:g=>[{text:"Close the case.",to:"endLaw"}]},
finalCanon:{kicker:"THE CABINET",title:"Henry Jekyll's Full Statement",body:g=>["By the time Poole finally sends for you, the servants are terrified and the voice behind the cabinet door is no longer Jekyll's.","You break it down. Hyde lies dead in Henry's clothes.","Only the documents remain. Lanyon's narrative. Jekyll's confession. The explanation arrives when it can no longer save anyone.","This is the tragedy Stevenson wrote. You reached it by choosing, repeatedly, to respect the closed door."],choices:g=>[{text:"Close the case.",to:"endCanon"}]},
endRescue:{kicker:"CASE CLOSED",title:"A Living Scandal",body:g=>["Henry Jekyll survives because friendship became intervention before secrecy became a coffin.","Some endings are happy only by Victorian standards."],choices:g=>[]},
endMercy:{kicker:"CASE CLOSED",title:"Two Names, One Friend",body:g=>["Jekyll confesses. Hyde is contained, imperfectly, under medical supervision shared by Lanyon and men he trusts.","You burn the old will yourself.","London never learns why Dr Jekyll withdrew from society. You do. You visit anyway."],choices:g=>[]},
endLaw:{kicker:"CASE CLOSED",title:"The Crown v. Henry Jekyll",body:g=>["The truth becomes evidence. Jekyll lives, disgraced and confined, while lawyers argue over whether Hyde's crimes belong to the hand, the mind, or the name.","You chose law over secrecy. It costs exactly what you feared."],choices:g=>[]},
endCanon:{kicker:"CASE CLOSED",title:"The Last Statement",body:g=>["Jekyll is dead. Hyde is dead. The case is perfectly explained.","You would prefer one unanswered question and one living friend."],choices:g=>[]}
}
function apply(g:G,c:Choice):G{let z={...g,scene:c.to};if(c.clue&&!z.clues.includes(c.clue))z.clues=[...z.clues,c.clue];if(c.flag&&!z.flags.includes(c.flag))z.flags=[...z.flags,c.flag];if(c.trust)z.trust={...z.trust,[c.trust[0]]:(z.trust[c.trust[0]]||0)+c.trust[1]};z.notes=[...z.notes,c.text];return z}
function makeDeduction(g:G,d:Deduction):G{if(d.needs.some(n=>!g.clues.includes(n)))return g;let f="ded:"+d.id;if(g.flags.includes(f))return g;return {...g,flags:[...g.flags,f],notes:[...g.notes,"Deduction: "+d.title]}}
const clueText:Record<string,string>={
"Edward Hyde":"The man Enfield saw trample a child. Named as Jekyll's beneficiary.",
"The cheque was signed by a respected man":"Hyde's settlement was paid with a genuine cheque drawn by a respectable gentleman.",
"Hyde inspires disgust without a describable deformity":"Enfield remembers Hyde vividly but cannot name a physical defect.",
"Jekyll's extraordinary will":"Hyde inherits on Jekyll's death or after three months' disappearance.",
"Lanyon has never heard of Hyde":"Jekyll's old medical colleague knows nothing of his supposed intimate and beneficiary.",
"Jekyll experimented with divided identity":"Lanyon says Jekyll pursued experiments concerning the division of human identity.",
"Hyde carries a key to Jekyll's laboratory":"Hyde enters Jekyll's old dissecting rooms with his own key.",
"Hyde's Soho address":"Hyde keeps rooms in Soho.",
"Hyde knows the terms of Jekyll's will":"Hyde reacted knowingly when confronted with the inheritance clauses.",
"Jekyll personally ordered the household to obey Hyde":"Poole confirms Hyde's authority came directly from Jekyll.",
"Poole is frightened for Jekyll":"Poole's concern exceeds ordinary dislike of Hyde.",
"Carew was killed with Jekyll's old cane":"The murder weapon was a cane Utterson once gave Henry Jekyll.",
"The broken cane was found in Hyde's rooms":"The second half of the Carew murder weapon was recovered in Soho.",
"Hyde's farewell letter":"Jekyll produced a letter purportedly written by Hyde after Carew's murder.",
"Jekyll and Hyde share the same handwriting":"Mr Guest found the two hands essentially identical apart from slope.",
"Lanyon died after a final encounter connected to Jekyll":"Lanyon refused further contact with Jekyll and died soon afterward, promising a posthumous explanation.",
"Lanyon's sealed narrative":"Lanyon left a narrative to be opened only after Jekyll's death or disappearance.",
"Lanyon witnessed Hyde transform into Jekyll":"Lanyon states that Hyde drank a chemical preparation and physically became Jekyll before his eyes.",
"The cabinet occupant is desperately seeking an old chemical salt":"Poole has searched chemists repeatedly for a salt matching an old supply; every new sample is rejected.",
"Poole saw a smaller figure inside Jekyll's laboratory":"Poole glimpsed a figure too small to be Jekyll and believes it was Hyde.",
"The cabinet occupant writes in Jekyll's hand":"The laboratory orders are written in Jekyll's familiar hand.",
"The voice in the cabinet is not Jekyll's":"Poole insists the voice behind the laboratory door is not his master's."
}
export default function Game(){
 const[g,setG]=useState<G>(start);const[paper,setPaper]=useState<string|null>(null);const[ready,setReady]=useState(false)
 useEffect(()=>{try{let x=localStorage.getItem("open-shelf-jh-v4");if(x)setG(JSON.parse(x))}catch{}setReady(true)},[])
 useEffect(()=>{if(ready)localStorage.setItem("open-shelf-jh-v4",JSON.stringify(g))},[g,ready])
 const s=scenes[g.scene];const choices=s.choices(g).filter(c=>!c.show||c.show(g));const closed=g.scene.startsWith("end")
 const reset=()=>{localStorage.removeItem("open-shelf-jh-v4");setG(start);setPaper(null)}
 return <main className="jh"><header className="jh-top"><Link href="/">← THE OPEN SHELF</Link><span>THE STRANGE CASE · G. J. UTTERSON</span></header>
 <section className="jh-title"><p>THE STRANGE CASE OF</p><h1>Dr Jekyll <i>&</i><br/><b>Mr Hyde</b></h1><div className="jh-role">{closed?"CASE CLOSED":"PRIVATE PAPERS"}<br/><strong>{g.clues.length} MATERIAL FACTS</strong><br/><small>Your curiosity is not a currency.</small></div></section>
 <section className="jh-case"><aside className="jh-docket"><div><small>SCENE</small><strong>{s.kicker}</strong></div><hr/><div className="clues"><small>CASE PAPERS · SELECT TO READ</small>{g.clues.length?g.clues.map(c=><button className="clue-link" key={c} onClick={()=>setPaper(c)}>{c}</button>):<p className="muted">The case is empty.</p>}</div><hr/><div><small>DEDUCTIONS</small>{deductions.map(d=>{let missing=d.needs.filter(n=>!g.clues.includes(n));let done=has(g,"ded:"+d.id);return <div className="deduction" key={d.id}><button disabled={missing.length>0||done} onClick={()=>setG(x=>makeDeduction(x,d))}>{done?"ESTABLISHED":missing.length?(missing.length+" FACT"+(missing.length>1?"S":"")+" MISSING"):"TEST DEDUCTION"} · {d.title}</button>{done&&<p>{d.result}</p>}</div>})}</div><hr/><div><small>CONFIDENCES</small><p className="relation">Jekyll {g.trust.jekyll>2?"trusts you":"guards himself"}</p><p className="relation">Poole {g.trust.poole>1?"will confide in you":"remains formal"}</p><p className="relation">Lanyon {g.trust.lanyon>1?"respects your discretion":"is wary"}</p></div></aside>
 <article className="jh-page"><p className="folio">{s.kicker}</p><h2>{s.title}</h2><div className="jh-prose">{s.body(g).map((p,i)=><p key={i}>{p}</p>)}</div>
 {paper&&<div className="evidence"><button onClick={()=>setPaper(null)}>×</button><small>CASE PAPER</small><h3>{paper}</h3><p>{clueText[paper]||"A fact Utterson considers material to the case."}</p></div>}
 {choices.length>0?<div className="jh-choices"><p>{closed?"":"HOW DO YOU PROCEED?"}</p>{choices.map((c,i)=><button key={c.text} onClick={()=>setG(x=>apply(x,c))}><span>{String(i+1).padStart(2,"0")}</span><b>{c.text}</b>{c.clue&&<em>May establish a material fact.</em>}</button>)}</div>:<div className="jh-ending"><button onClick={reset}>BEGIN AGAIN</button><Link href="/">RETURN TO THE OPEN SHELF</Link></div>}
 </article></section>
 <details className="jh-journal"><summary>UTTERSON'S PRIVATE NOTES · {g.notes.length}</summary>{g.notes.map((n,i)=><p key={i}><span>{String(i+1).padStart(2,"0")}</span>{n}</p>)}</details><footer className="jh-foot"><span>Investigation is free. Consequences come from what you say, conceal and prove.</span><button onClick={reset}>RESET CASE</button></footer></main>
}
