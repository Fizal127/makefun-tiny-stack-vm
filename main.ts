// Tiny stack VM for make.fun tiny-stack-vm-01.
// Runs every /input/<id>/program.bin on the kit ISA
// (program/generator/subject/ISA.md) with /input/<id>/input.bin as its input
// bytes, and writes /output/<id>/stdout.bin (exactly the bytes the program
// printed) and /output/<id>/exit.txt (the exit code, 0-255).
// Machine: 32-bit two's-complement values on a 256-slot data stack (D), a
// 64-deep call stack (C), 256 words of memory (M), at most 1,000,000 steps
// and 65,536 output bytes; anything out of bounds is one of traps 2-11, and
// output written before a trap is kept.
// Dispatch: one fetch-decode-execute loop. K(b) is a static table of
// [immediate bytes, pops, pushes] per opcode, so stack-depth and truncation
// checks happen once before each instruction; the switch below then executes
// the opcode, with arithmetic wrapped to int32 (Math.imul, |0) to mirror the
// reference vm.mjs. Hand-written, Node stdlib only; no dependencies.
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
// [immediate bytes, pops, pushes] per opcode; 0 = unknown opcode.
const K=(b:number):number[]|0=>{
 if(b<8)return [[0,0,0],[1,0,1],[4,0,1],[0,1,0],[0,1,2],[0,2,2],[0,2,3],[0,3,3]][b];
 if(b>=0x10&&b<=0x16||b>=0x18&&b<=0x1a||b>=0x1c&&b<=0x1e||b>=0x20&&b<=0x22)return [0,2,1];
 if(b===0x17||b===0x1b)return [0,1,1];
 if(b===0x30||b===0x33)return [2,0,0];
 if(b===0x31||b===0x32)return [2,1,0];
 if(b===0x34)return [0,0,0];
 if(b===0x40)return [0,1,1];
 if(b===0x41)return [0,2,0];
 if(b===0x50||b===0x51||b===0x53)return [0,1,0];
 if(b===0x52)return [0,0,1];
 return 0;
};
function run(p:Uint8Array,q:Uint8Array){
 const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
 let s=0,c=0,pc=0,st=0,ip=0,ol=0;
 const done=(e:number)=>({o:o.slice(0,ol),c:e});
 for(;;){
  if(st===1e6)return done(10);
  if(pc<0||pc>=p.length)return done(9);
  const b=p[pc],k=K(b);
  if(!k)return done(5);
  const im=k[0],po=k[1],pu=k[2];
  if(pc+im>=p.length)return done(9);
  st++;
  if(s<po)return done(2);
  if(s-po+pu>256)return done(3);
  const nx=pc+1+im;pc=nx;
  switch(b){
   case 0:return done(0);
   case 1:D[s++]=(p[nx-1]<<24)>>24;break;
   case 2:D[s++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;break;
   case 3:s--;break;
   case 4:D[s]=D[s-1];s++;break;
   case 5:{const t=D[s-1];D[s-1]=D[s-2];D[s-2]=t;break;}
   case 6:D[s]=D[s-2];s++;break;
   case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break;}
   case 0x17:D[s-1]=-D[s-1]|0;break;
   case 0x1b:D[s-1]=~D[s-1];break;
   case 0x30:pc=nx+(((p[nx-2]|p[nx-1]<<8)<<16)>>16);break;
   case 0x31:case 0x32:{const v=D[--s],r=((p[nx-2]|p[nx-1]<<8)<<16)>>16;if((b===0x31)===(v===0))pc=nx+r;break;}
   case 0x33:if(c===64)return done(7);C[c++]=nx;pc=p[nx-2]|p[nx-1]<<8;break;
   case 0x34:if(!c)return done(8);pc=C[--c];break;
   case 0x40:{const a=D[s-1];if(a<0||a>255)return done(6);D[s-1]=M[a];break;}
   case 0x41:{const a=D[s-1],v=D[s-2];if(a<0||a>255)return done(6);s-=2;M[a]=v;break;}
   case 0x50:{const t=String(D[s-1]);if(ol+t.length>65536)return done(11);s--;for(let i=0;i<t.length;i++)o[ol++]=t.charCodeAt(i);break;}
   case 0x51:if(ol+1>65536)return done(11);o[ol++]=D[--s]&255;break;
   case 0x52:D[s++]=ip<q.length?q[ip++]:-1;break;
   case 0x53:return done(D[--s]&255);
   default:{
    const y=D[s-1],a=D[s-2];let r=0;
    if(b===0x10)r=(a+y)|0;
    else if(b===0x11)r=(a-y)|0;
    else if(b===0x12)r=Math.imul(a,y);
    else if(b===0x13){if(!y)return done(4);r=a===-2147483648&&y===-1?a:(a/y)|0;}
    else if(b===0x14){if(!y)return done(4);r=y===-1?0:(a%y)|0;}
    else if(b===0x15){if(!y)return done(4);r=Math.floor((a>>>0)/(y>>>0))|0;}
    else if(b===0x16){if(!y)return done(4);r=((a>>>0)%(y>>>0))|0;}
    else if(b===0x18)r=a&y;
    else if(b===0x19)r=a|y;
    else if(b===0x1a)r=a^y;
    else if(b===0x1c)r=a<<(y&31);
    else if(b===0x1d)r=a>>(y&31);
    else if(b===0x1e)r=(a>>>(y&31))|0;
    else if(b===0x20)r=a===y?1:0;
    else if(b===0x21)r=a<y?1:0;
    else r=(a>>>0)<(y>>>0)?1:0;
    s-=2;D[s++]=r;
   }
  }
 }
}
for(const id of readdirSync(I).sort()){
 const r=run(new Uint8Array(readFileSync(join(I,id,'program.bin'))),new Uint8Array(readFileSync(join(I,id,'input.bin'))));
 mkdirSync(join(O,id),{recursive:true});
 writeFileSync(join(O,id,'stdout.bin'),r.o);
 writeFileSync(join(O,id,'exit.txt'),r.c+'\n');
}
