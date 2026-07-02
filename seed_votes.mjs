// seed_votes.mjs — Run with: node seed_votes.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXZbE7-Clzm6XemUtw9JrdjuDFu7smZ-w",
  authDomain: "election-2026-27.firebaseapp.com",
  projectId: "election-2026-27",
  storageBucket: "election-2026-27.firebasestorage.app",
  messagingSenderId: "147088108369",
  appId: "1:147088108369:web:e6932cf0d7f273f4628170",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BOY_VOTES  = { 'Aditya Gohil':257,'Naitik Dholakiya':252,'Preet Bodar':22,'Shubham Hirani':241 };
const GIRL_VOTES = { 'Preksha Rana':282,'Siddhi Patel':281,'Rashi Kapadia':209 };
const TOTAL = 772;
const DATE_STR = '2026-07-02';
const START_MIN = 8*60+55;
const END_MIN   = 11*60+45;
const RANGE_MIN = END_MIN - START_MIN;

function toTimeStr(m){ const h=Math.floor(m/60),mn=m%60,a=h<12?'AM':'PM',h12=h%12||12; return `${String(h12).padStart(2,'0')}:${String(mn).padStart(2,'0')} ${a}`; }

function shuffle(arr){ for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr; }

function buildVotes(){
  const boys=[],girls=[];
  for(const[n,c] of Object.entries(BOY_VOTES)) for(let i=0;i<c;i++) boys.push(n);
  for(const[n,c] of Object.entries(GIRL_VOTES)) for(let i=0;i<c;i++) girls.push(n);
  shuffle(boys);shuffle(girls);
  return Array.from({length:TOTAL},(_,i)=>{
    const mo=Math.round((i/(TOTAL-1))*RANGE_MIN);
    const vm=START_MIN+mo;
    const h=Math.floor(vm/60),mn=vm%60;
    const ts=new Date(`${DATE_STR}T${String(h).padStart(2,'0')}:${String(mn).padStart(2,'0')}:00+05:30`);
    return {voteId:`GJRE-${String(i+1).padStart(4,'0')}`,headBoy:boys[i],headGirl:girls[i],date:DATE_STR,time:toTimeStr(vm),timestamp:ts};
  });
}

async function main(){
  console.log('=== GAJERA ELECTION VOTE SEEDER ===');
  const ref=collection(db,'votes');
  const snap=await getDocs(ref);
  if(!snap.empty){
    await Promise.all(snap.docs.map(d=>deleteDoc(doc(db,'votes',d.id))));
    console.log(`Cleared ${snap.docs.length} existing votes.`);
  }
  const votes=buildVotes();
  let done=0;
  for(let i=0;i<votes.length;i+=50){
    await Promise.all(votes.slice(i,i+50).map(v=>addDoc(ref,v)));
    done=Math.min(i+50,votes.length);
    process.stdout.write(`\rUploading... ${done}/${TOTAL}`);
  }
  console.log('\n=== DONE! ===');
  console.log('Boys:  Aditya=257, Naitik=252, Shubham=241, Preet=22');
  console.log('Girls: Preksha=282, Siddhi=281, Rashi=209');
  process.exit(0);
}
main().catch(e=>{console.error(e);process.exit(1);});
