"use client"
import Link from "next/link"
import {useEffect,useState} from "react"

type Temper="resolve"|"discretion"|"suspicion"
type G={day:number;slot:number;place:string;temper:Record<Temper,number>;clues:string[];flags:string[];notes:string[];ending?:string}
type Action={label:string;place:string;cost?:number;need?:string;temper?:Temper;delta?:number;clue?:string;flag?:string;note:string}
const places:Record<string,{name:string;deck:(g:G)=>string[];actions:(g:G)=>Action[]}>={
street:{name:"THE BY-STREET",deck:g=>g.flags.includes("enfield")?["The blistered door remains shut. By daylight it looks merely neglected; by night, deliberate.","You now know the name Edward Hyde. The door has become an address in a case no client has asked you to take."]:["Enfield stops beside a blistered door and tells you what happened here: a small man calmly trampled a child, then bought off scandal with a cheque signed by a respectable gentleman.","The stranger was Edward Hyde. Enfield cannot describe his deformity, only the disgust it produced."],actions:g=>g.flags.includes("enfield")?[
{label:"Watch the door for Hyde",place:"street",cost:1,flag:"metHyde",clue:"Hyde has a key to the laboratory door",temper:"resolve",delta:1,note:"I watched the door until Hyde came. He has a key."},
{label:"Inspect the surrounding property",place:"street",cost:1,clue:"The door connects to Jekyll's old dissecting rooms",temper:"suspicion",delta:1,note:"The neglected door belongs to the rear of Jekyll's property."}
]:[{label:"Hear Enfield out",place:"street",cost:0,flag:"enfield",clue:"Edward Hyde trampled a child and paid with another man's cheque",note:"Enfield named the man: Edward Hyde."}]},
home:{name:"UTTERSON'S HOUSE",deck:g=>["Your rooms offer quiet, law books, and the private safe containing Henry Jekyll's will.",g.clues.includes("Jekyll's extraordinary will")?"The clauses have not improved with rereading. Hyde inherits on death—and on disappearance.":"The safe waits. You have avoided opening it since Enfield spoke Hyde's name."],actions:g=>[
...(!g.clues.includes("Jekyll's extraordinary will")?[{label:"Examine Jekyll's will",place:"home",cost:0,clue:"Jekyll's extraordinary will",temper:"suspicion" as Temper,delta:1,note:"The will names Hyde heir after death or three months' disappearance."}]:[]),
...(g.clues.includes("Carew's murder")&&g.clues.includes("Jekyll's letter to Utterson")&&!g.clues.includes("Guest's handwriting comparison")?[{label:"Ask Mr Guest to compare the handwriting",place:"home",cost:1,clue:"Guest's handwriting comparison",temper:"suspicion" as Temper,delta:1,note:"Guest believes Hyde and Jekyll write with the same hand, differently sloped."}]:[])
]},
lanyon:{name:"CAVENDISH SQUARE",deck:g=>g.flags.includes("lanyonDead")?["The house is shuttered. Dr Lanyon is dead. His sealed packet sits among your papers, marked not to be opened until Henry Jekyll's death or disappearance."]:["Dr Hastie Lanyon receives you with old warmth and fresh irritation whenever Henry Jekyll is mentioned.","He calls Jekyll's recent work unscientific balderdash. The quarrel is deeper than professional vanity."],actions:g=>[
...(!g.clues.includes("Lanyon and Jekyll's estrangement")?[{label:"Ask about Jekyll's scientific work",place:"lanyon",cost:1,clue:"Lanyon and Jekyll's estrangement",temper:"discretion" as Temper,delta:-1,note:"Lanyon says Jekyll abandoned orthodox medicine for transcendental experiments."}]:[]),
...(g.clues.includes("Jekyll's extraordinary will")&&!g.clues.includes("Lanyon never heard of Hyde")?[{label:"Ask whether Lanyon knows Edward Hyde",place:"lanyon",cost:0,clue:"Lanyon never heard of Hyde",note:"Lanyon has never heard Hyde's name."}]:[])
]},
jekyll:{name:"DR JEKYLL'S HOUSE",deck:g=>g.flags.includes("carew")?["Poole admits you with a face that has learned not to ask questions. Jekyll remains mostly in the laboratory wing.","The respectable house and the old dissecting theatre share walls, servants, and a secret."]:["Jekyll's front rooms are warm, handsome and reassuring. The laboratory beyond the courtyard is another matter.","Poole is loyal, observant, and increasingly uneasy."],actions:g=>[
...(g.flags.includes("metHyde")&&!g.flags.includes("confronted")?[{label:"Tell Jekyll you have met Hyde",place:"jekyll",cost:1,flag:"confronted",clue:"Jekyll claims he can be rid of Hyde",temper:"resolve" as Temper,delta:1,note:"Jekyll went pale at Hyde's name. He insists he can be rid of him whenever he chooses."}]:[]),
...(g.clues.includes("Hyde has a key to the laboratory door")&&!g.flags.includes("poole")?[{label:"Win Poole's quiet confidence",place:"jekyll",cost:1,flag:"poole",clue:"Poole will send word if Jekyll is endangered",temper:"discretion" as Temper,delta:1,note:"Poole agreed to send word if his master appears endangered."}]:[]),
...(g.flags.includes("carew")&&!g.clues.includes("Jekyll's letter to Utterson")?[{label:"Demand to see Jekyll after Carew's murder",place:"jekyll",cost:1,clue:"Jekyll's letter to Utterson",temper:"resolve" as Temper,delta:1,note:"Jekyll gave me a letter supposedly written by Hyde, promising he has escaped."}]:[])
]},
soho:{name:"HYDE'S ROOMS, SOHO",deck:g=>g.flags.includes("carew")?["The rooms have been searched in haste. Fine possessions sit among violence and disorder. A fire has consumed papers in the grate."]:["Soho changes with the fog. Hyde's address is respectable enough inside and disreputable enough outside.","The landlady remembers everything and approves of almost nothing."],actions:g=>[
...(!g.clues.includes("Hyde's Soho address")?[{label:"Trace Hyde through clerks and directories",place:"soho",cost:1,clue:"Hyde's Soho address",temper:"resolve" as Temper,delta:1,note:"I traced Hyde to furnished rooms in Soho."}]:[]),
...(g.flags.includes("carew")&&!g.clues.includes("The broken cane")?[{label:"Search the rooms with Inspector Newcomen",place:"soho",cost:1,clue:"The broken cane",note:"The other half of the murder weapon was found in Hyde's rooms."}]:[])
]}
}
const endings:Record<string,{title:string;body:string[]}>={
canon:{title:"THE LAST STATEMENT",body:["Poole's terror finally breaks the etiquette that protected the cabinet door. Together you force it.","Hyde lies dead in Jekyll's clothes. The papers explain what friendship, law and reason could not: Jekyll and Hyde were one man, divided by chemistry and desire.","You read Henry's confession alone. You did not save him. You did, at last, understand him.","The case closes as Stevenson wrote it: not because you had no choices, but because your choices did not reach Jekyll soon enough."]},
rescue:{title:"A FRIEND BEFORE A SOLICITOR",body:["Poole's warning reaches you before the final isolation becomes absolute. You arrive carrying the will, Guest's comparison, and enough evidence that Jekyll can no longer protect Hyde with lies.","When the laboratory door opens, the man behind it is Henry. Barely.","You force confession before the transformations become irreversible. Lanyon is summoned while there is still time to be a physician rather than a witness. The formula is destroyed under three pairs of eyes.","Jekyll survives. His reputation does not. For once, Gabriel Utterson decides that a living disgraced friend is preferable to a respectable corpse."]},
law:{title:"THE CROWN v. HENRY JEKYLL",body:["You give Newcomen the handwriting evidence and refuse Jekyll the shelter of professional discretion.","The police arrive before Hyde can vanish again. What they find behind the laboratory door makes the eventual trial the most extraordinary proceeding in English legal history.","Jekyll lives to answer for Carew's death. Whether Hyde can be guilty where Jekyll claims innocence becomes a question for twelve very unhappy jurors.","You preserve the law and lose a friend. You are still not certain those are different sentences."]},
hyde:{title:"THE MAN AT LARGE",body:["You spend too long protecting Henry Jekyll from scandal and too little protecting him from himself.","By the time Poole sends for you, the cabinet is empty. A body is not found. Neither is a confession.","Edward Hyde disappears into London with money, papers and several days' advantage.","Years later, you still turn at certain footsteps. Some cases do not close. They merely stop writing back."]}
}
const start:G={day:1,slot:0,place:"street",temper:{resolve:2,discretion:3,suspicion:0},clues:[],flags:[],notes:["Sunday afternoon. Enfield stopped at a neglected door."]}
const periods=["MORNING","AFTERNOON","EVENING"]
function has(g:G,x:string){return g.clues.includes(x)||g.flags.includes(x)}
function advance(g:G,n=1){let slot=g.slot+n,day=g.day+Math.floor(slot/3);slot%=3;let z={...g,day,slot};if(day>=4&&!has(z,"carew"))z={...z,flags:[...z.flags,"carew"],clues:[...z.clues,"Carew's murder"],notes:[...z.notes,"Sir Danvers Carew has been murdered. Hyde is wanted."]};if(day>=7&&!has(z,"lanyonDead"))z={...z,flags:[...z.flags,"lanyonDead"],notes:[...z.notes,"Dr Lanyon has died after a sudden and terrible decline."]};return z}
function doAction(g:G,a:Action){let z={...g};if(a.clue&&!z.clues.includes(a.clue))z.clues=[...z.clues,a.clue];if(a.flag&&!z.flags.includes(a.flag))z.flags=[...z.flags,a.flag];if(a.temper&&a.delta)z.temper={...z.temper,[a.temper]:Math.max(0,z.temper[a.temper]+a.delta)};z.notes=[...z.notes,a.note];return advance(z,a.cost??1)}
function possibleEnding(g:G){if(g.day<8)return null;if(has(g,"Guest's handwriting comparison")&&has(g,"poole")&&g.temper.resolve>=3)return"rescue";if(has(g,"Guest's handwriting comparison")&&g.temper.suspicion>=3)return"law";if(g.temper.discretion>=4&&!has(g,"poole"))return"hyde";return"canon"}
const clueText:Record<string,string>={
"Edward Hyde trampled a child and paid with another man's cheque":"Enfield witnessed Hyde trample a child. The settlement cheque was genuine and bore a respected name.",
"Jekyll's extraordinary will":"Hyde inherits if Jekyll dies or disappears for three months. Jekyll insisted on the clause against legal advice.",
"Hyde has a key to the laboratory door":"Hyde can enter Jekyll's old dissecting rooms privately. The servants have orders to obey him.",
"The door connects to Jekyll's old dissecting rooms":"The infamous door is physically part of Jekyll's property. Hyde's access is therefore sanctioned from within.",
"Lanyon and Jekyll's estrangement":"Lanyon rejected Jekyll's recent experiments as unscientific and dangerous.",
"Lanyon never heard of Hyde":"One of Jekyll's oldest medical friends knows nothing of the supposed beneficiary.",
"Jekyll claims he can be rid of Hyde":"When confronted, Jekyll insisted Hyde could be dismissed whenever he chose, while refusing to explain their connection.",
"Poole will send word if Jekyll is endangered":"Poole has agreed to break household discretion if he believes Jekyll is in danger.",
"Hyde's Soho address":"Hyde keeps furnished rooms in Soho under his own name.",
"Carew's murder":"Sir Danvers Carew was beaten to death. A maid identified Edward Hyde as the attacker.",
"Jekyll's letter to Utterson":"After Carew's murder, Jekyll produced a letter supposedly from Hyde promising escape.",
"Guest's handwriting comparison":"Mr Guest found Hyde's hand and Jekyll's remarkably alike, differing chiefly in slope.",
"The broken cane":"Half of the murder weapon was found in Hyde's rooms; the other half lay by Carew's body."
}
export default function Game(){
 const[g,setG]=useState<G>(start);const[selected,setSelected]=useState<string|null>(null);const[ready,setReady]=useState(false)
 useEffect(()=>{try{let x=localStorage.getItem("open-shelf-jh-v2");if(x)setG(JSON.parse(x))}catch{}setReady(true)},[])
 useEffect(()=>{if(ready)localStorage.setItem("open-shelf-jh-v2",JSON.stringify(g))},[g,ready])
 const end=g.ending?endings[g.ending]:null;const auto=possibleEnding(g)
 const travel=(p:string)=>setG(x=>advance({...x,place:p},p===x.place?0:1))
 const finish=()=>{let e=possibleEnding(g);if(e)setG({...g,ending:e})}
 const reset=()=>{localStorage.removeItem("open-shelf-jh-v2");setG(start);setSelected(null)}
 if(end)return <main className="jh"><header className="jh-top"><Link href="/">← THE OPEN SHELF</Link><span>CASE CLOSED</span></header><article className="jh-page jh-final"><p className="folio">AN ENDING</p><h2>{end.title}</h2><div className="jh-prose">{end.body.map((p,i)=><p key={i}>{p}</p>)}</div><div className="jh-ending"><button onClick={reset}>REOPEN THE CASE</button><Link href="/">RETURN TO THE OPEN SHELF</Link></div></article></main>
 const p=places[g.place]
 return <main className="jh"><header className="jh-top"><Link href="/">← THE OPEN SHELF</Link><span>THE STRANGE CASE · AN INVESTIGATION</span></header>
 <section className="jh-title"><p>THE STRANGE CASE OF</p><h1>Dr Jekyll <i>&</i><br/><b>Mr Hyde</b></h1><div className="jh-role">DAY {g.day}<br/><strong>{periods[g.slot]}</strong><br/><small>Events will not wait for you.</small></div></section>
 <nav className="jh-map">{Object.entries(places).map(([id,v])=><button key={id} className={id===g.place?"active":""} onClick={()=>travel(id)}>{v.name}</button>)}</nav>
 <section className="jh-case"><aside className="jh-docket"><div><small>TIME</small><strong>DAY {g.day} · {periods[g.slot]}</strong></div><div><small>PLACE</small><strong>{p.name}</strong></div><hr/><div className="meters"><small>UTTERSON AS PLAYED</small>{(["resolve","discretion","suspicion"] as Temper[]).map(k=><label key={k}>{k[0].toUpperCase()+k.slice(1)} <span>{"●".repeat(Math.min(g.temper[k],5))}{"○".repeat(Math.max(0,5-g.temper[k]))}</span></label>)}</div><hr/><div className="clues"><small>CASE PAPERS · {g.clues.length}</small>{g.clues.map(c=><button className="clue-link" key={c} onClick={()=>setSelected(c)}>{c}</button>)}</div></aside>
 <article className="jh-page"><p className="folio">{p.name}</p><h2>{g.flags.includes("carew")?"After the Murder":"The Case of Edward Hyde"}</h2><div className="jh-prose">{p.deck(g).map((x,i)=><p key={i}>{x}</p>)}</div>
 {selected&&<div className="evidence"><button onClick={()=>setSelected(null)}>×</button><small>CASE PAPER</small><h3>{selected}</h3><p>{clueText[selected]||"A fact entered in Utterson's private case papers."}</p></div>}
 <div className="jh-choices"><p>WHAT WILL YOU DO? · TRAVEL AND INVESTIGATION SPEND TIME</p>{p.actions(g).length?p.actions(g).map(a=><button key={a.label} onClick={()=>setG(x=>doAction(x,a))}><span>→</span><b>{a.label}</b><em>{a.note}</em></button>):<p className="muted">Nothing more can be learned here just now. Choose another location.</p>}</div>
 {auto&&<div className="jh-ending"><button onClick={finish}>ANSWER POOLE'S URGENT MESSAGE</button><small>The case has reached its final night. What happens now depends on what you learned, whom you trusted, and the Utterson you became.</small></div>}
 </article></section>
 <details className="jh-journal"><summary>UTTERSON'S PRIVATE NOTES · {g.notes.length}</summary>{g.notes.map((n,i)=><p key={i}><span>{String(i+1).padStart(2,"0")}</span>{n}</p>)}</details><footer className="jh-foot"><span>Progress saves automatically. Time advances when you travel or investigate.</span><button onClick={reset}>RESET CASE</button></footer></main>
}
