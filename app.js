import * as THREE from './three.module.js';
import {surface,textile,glaze} from './materials.js';
const works=[{"title": "Le regard", "ratio": .7924281984334204, "x": 0, "z": -6.83, "rotation": 0, "description": "Un portrait noir et blanc au regard intense, entouré de mains.", "image": "oeuvre-01.png", "h": 2.8, "w": 2.2187989556135768},
{"title": "Sur l'herbe", "ratio": .8, "x": -3.5, "z": -6.83, "rotation": 0, "description": "Une jeune fille allongée dans l'herbe, un sac rouge et un téléphone posés à côté, dans une page de carnet.", "image": "https://z-cdn-media.chatglm.cn/files/00b9f027-8d1a-43e6-aab1-569ca6718370.jpeg?auth_key=1892084418-610f6122b73343b48ec4a4ca302a74db-0-dc652823f29cacb7a4b4fb1245a86d45", "h": 2.8, "w": 2.24},
{"title": "Les grandes oreilles", "ratio": .8, "x": 3.5, "z": -6.83, "rotation": 0, "description": "Un personnage aux grandes oreilles et à l'air nonchalant, esquissé dans des bruns rouges et signé « AH ».", "image": "https://z-cdn-media.chatglm.cn/files/3219293a-0784-4502-ab24-2bcf3b47379b.jpeg?auth_key=1892084418-51845ba0137f40c9a07131462c63c436-0-839c78bddc76bbd39bef1467d25d64b2", "h": 2.8, "w": 2.24},
{"title": "À la palette", "ratio": .8955613577023499, "x": -5.83, "z": -3.2, "rotation": 1.5707963267948966, "description": "Une artiste à la casquette rouge, pinceau et palette en main.", "image": "oeuvre-02.png", "h": 2.8, "w": 2.5075718015665798},
{"title": "Pas de danse", "ratio": .8955613577023499, "x": 5.83, "z": -3.2, "rotation": -1.5707963267948966, "description": "Deux personnages souriants réunis dans un mouvement de danse.", "image": "oeuvre-03.png", "h": 2.8, "w": 2.5075718015665798},
{"title": "Au soleil", "ratio": 1, "x": -5.83, "z": -.6, "rotation": 1.5707963267948966, "description": "Deux amis souriants sous un soleil à rayons, dans un dessin au format rond.", "image": "https://z-cdn-media.chatglm.cn/files/ecbe25de-e36f-43b1-a9ff-c1de4218faae.jpeg?auth_key=1892084418-de9541a8fd294ff5bf090618d27a94e4-0-966aa58b9dbc833153adfa986a82f577", "h": 2.2, "w": 2.2},
{"title": "Le rire", "ratio": .8, "x": 5.83, "z": -.6, "rotation": -1.5707963267948966, "description": "Un visage hilare sous une casquette marquée d'un S, lunettes sur le nez, brossé dans des bruns profonds.", "image": "https://z-cdn-media.chatglm.cn/files/721fe5c3-b38f-4672-8679-99ef85040549.jpeg?auth_key=1892084418-8686ea8f2bba403b8634ad13d6d33734-0-62e7710fd2add5dad650121e2f3e76e9", "h": 2.6, "w": 2.08},
{"title": "Portrait sur fond vert", "ratio": .8955613577023499, "x": -5.83, "z": 2, "rotation": 1.5707963267948966, "description": "Un personnage aux yeux verts, vêtu de rouge sur un fond vert.", "image": "oeuvre-04.png", "h": 2.8, "w": 2.5075718015665798},
{"title": "Énergie", "ratio": .821505376344086, "x": 5.83, "z": 2, "rotation": -1.5707963267948966, "description": "Une composition expressive aux accents de bande dessinée.", "image": "oeuvre-05.png", "h": 2.8, "w": 2.3002150537634405},
{"title": "Face caméra", "ratio": .85, "x": 5.83, "z": 4.75, "rotation": -1.5707963267948966, "description": "Une jeune fille aux couettes, entourée d'un chapeau, d'un appareil photo et d'un sac jaune, sur un fond rose et bleu où clignote « REC ».", "image": "https://z-cdn-media.chatglm.cn/files/a7593537-63e8-416c-9854-2d594ac05afb.png?auth_key=1892084418-115f0909b70143b8aa1ddb3a329a1217-0-f8d18bc2e929691cd54d7ece91d7ab26", "h": 2.8, "w": 2.38},
{"title": "Le basketteur", "ratio": .6573033707865169, "x": -5.83, "z": 7.5, "rotation": 1.5707963267948966, "description": "Un personnage souriant en tenue claire, un ballon de basket sous le bras.", "image": "oeuvre-06.png", "h": 2.8, "w": 1.840449438202247},
{"title": "Pensif", "ratio": .6573033707865169, "x": 5.83, "z": 7.5, "rotation": -1.5707963267948966, "description": "Un personnage en noir, la main posée contre le visage.", "image": "oeuvre-07.png", "h": 2.8, "w": 1.840449438202247}];
const $=s=>document.querySelector(s), count=works.length, total=String(count).padStart(2,'0');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected=0,visiting=false,guided=false,tourElapsed=0,scene,camera,renderer,raycaster,floorMesh,hoverRing,artMeshes=[],transition=null,keys=new Set(),yaw=0,pitch=0,targetYaw=0,targetPitch=0;
const current=new THREE.Vector3(1.3,1.72,9),target=current.clone(), pointer=new THREE.Vector2();
function number(i){return String(i+1).padStart(2,'0')}function stopTour(){guided=false;tourElapsed=0;$('#autotour').textContent='▷ Visite guidée';$('#autotour').setAttribute('aria-pressed','false');$('#tourprogress').style.width='0'}
function setVisiting(){visiting=true;document.body.classList.add('visiting')}
function updateLabels(){let w=works[selected];$('#position').textContent='LA GALERIE / '+number(selected);$('#counter').textContent=number(selected)+' / '+total;$('.scene-label span').textContent=number(selected)+' — '+total;$('.scene-label p').textContent=w.title;document.querySelectorAll('#mapButtons button').forEach((b,i)=>b.classList.toggle('current',i===selected));}
// The right-hand alcove now lives at the rear of the lounge; the second collectible moved to the coffee-table corner, so no footprint blocks the new paintings.
const obstacles=[[-2.05,2.05,2.35,4.3],[-5.9,-3.5,4.1,6.3],[3.45,5.9,12.4,14.5],[-5.1,-4,-6,-4.8]];
function walkable(x,z){return !obstacles.some(([l,r,t,b])=>x>l&&x<r&&z>t&&z<b)}
function clearSegment(a,b){
 const dx=b.x-a.x,dz=b.z-a.z;
 for(const [l,r,t,bt] of obstacles){let lo=0,hi=1;for(const [origin,delta,min,max] of [[a.x,dx,l,r],[a.z,dz,t,bt]]){if(Math.abs(delta)<1e-9){if(origin<=min||origin>=max){lo=2;break}}else{let u=(min-origin)/delta,v=(max-origin)/delta;if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v)}}if(lo<hi&&hi>0&&lo<1)return false}
 return true;
}
function safePath(a,b){
 if(clearSegment(a,b))return [a,b];
 const nodes=[a,b];for(const [l,r,t,bt] of obstacles)for(const x of [l-.08,r+.08])for(const z of [t-.08,bt+.08])if(x>-5.05&&x<5.05&&z>-5.8&&z<10.5&&walkable(x,z))nodes.push(new THREE.Vector3(x,1.72,z));
 const dist=nodes.map(()=>Infinity),prev=[],used=new Set();dist[0]=0;
 for(let step=0;step<nodes.length;step++){let u=-1;for(let i=0;i<nodes.length;i++)if(!used.has(i)&&(u<0||dist[i]<dist[u]))u=i;if(u<0||!Number.isFinite(dist[u]))break;if(u===1)break;used.add(u);for(let v=0;v<nodes.length;v++){if(used.has(v)||!clearSegment(nodes[u],nodes[v]))continue;const d=dist[u]+nodes[u].distanceTo(nodes[v]);if(d<dist[v]){dist[v]=d;prev[v]=u}}}
 if(!Number.isFinite(dist[1]))return [a,a];const path=[];for(let i=1;i!==undefined;i=prev[i])path.unshift(nodes[i]);return path;
}
function onPath(points,t){const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i])),total=lengths.reduce((a,b)=>a+b,0);let d=t*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1)return points[i].clone().lerp(points[i+1],lengths[i]?d/lengths[i]:1);d-=lengths[i]}return points.at(-1)}
function angleNear(value,base){return base+Math.atan2(Math.sin(value-base),Math.cos(value-base))}
function go(i,automatic=false){if(!automatic)stopTour();selected=(i+count)%count;setVisiting();const w=works[selected],n=new THREE.Vector3(Math.sin(w.rotation),0,Math.cos(w.rotation));const distance=selected>=3?(innerWidth<700?Math.min(3.5,w.w*1.2):3.15):(innerWidth<700?Math.max(3.7,w.w*1.2):4.1);const dest=new THREE.Vector3(w.x,1.72,w.z).addScaledVector(n,distance);target.copy(dest);targetYaw=angleNear(Math.atan2(-n.x,n.z),yaw);targetPitch=Math.atan2(2.6-1.72,distance);transition={from:current.clone(),to:dest.clone(),yawFrom:yaw,yawTo:targetYaw,pitchFrom:pitch,pitchTo:targetPitch,t:0};tourElapsed=0;updateLabels();$('#artHint').style.display='block';}
function openDetail(i){stopTour();selected=(i+count)%count;let w=works[selected];$('#detailImage').src=w.image;$('#detailImage').alt='Nowemi — '+w.title;$('#detailTitle').textContent=w.title;$('#detailNumber').textContent='ŒUVRE '+number(selected)+' / TITRE DESCRIPTIF';$('#description').textContent=w.description;$('.detail-image').classList.remove('zoomed');$('#zoom').textContent='Agrandir ＋';if($('#works').open)$('#works').close();if(!$('#detail').open)$('#detail').showModal()}
works.forEach((w,i)=>{const b=document.createElement('button');b.className='work-card';b.innerHTML=`<img src="${w.image}" alt="Nowemi — ${w.title}"><h3>${w.title}</h3><span>${number(i)} / Rejoindre le tableau →</span>`;b.onclick=()=>{$('#works').close();go(i)};$('#workGrid').append(b);const m=document.createElement('button');m.textContent=number(i);m.setAttribute('aria-label','Rejoindre '+w.title);m.style.left=(50+w.x*6.2)+'%';m.style.top=(27+(w.z+3.2)*5.7)+'%';m.onclick=()=>go(i);$('#mapButtons').append(m)});
 $('#collection').onclick=()=>{stopTour();$('#works').showModal()};$('#fallbackCollection').onclick=()=>$('#works').showModal();document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>{if(d.id==='detail')go(selected)});d.addEventListener('click',e=>{if(e.target===d){let r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
 $('#detailPrev').onclick=()=>openDetail(selected-1);$('#detailNext').onclick=()=>openDetail(selected+1);function zoom(){let a=$('.detail-image').classList.toggle('zoomed');$('#zoom').textContent=a?'Réduire −':'Agrandir ＋'}$('#zoom').onclick=zoom;$('#detailImage').onclick=zoom;
 $('#help').onclick=()=>{$('#guide').hidden=!$('#guide').hidden;stopTour()};$('#closeGuide').onclick=()=>{$('#guide').hidden=true};
 $('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};
 $('#enter').onclick=()=>go(0);$('#next').onclick=()=>go(visiting?selected+1:0);$('#previous').onclick=()=>go(visiting?selected-1:count-1);$('#artHint').onclick=()=>openDetail(selected);
 $('#autotour').onclick=()=>{if(guided)stopTour();else{go(visiting?selected:0,true);guided=true;$('#autotour').textContent='Ⅱ Mettre en pause';$('#autotour').setAttribute('aria-pressed','true')}};
 $('#hideui').onclick=()=>{document.body.classList.add('contemplating');$('#restoreui').hidden=false};$('#restoreui').onclick=()=>{document.body.classList.remove('contemplating');$('#restoreui').hidden=true};
 $('#overview').onclick=()=>{stopTour();visiting=false;document.body.classList.remove('visiting');target.set(1.3,1.72,9);targetYaw=angleNear(-.08,yaw);targetPitch=.015;transition={from:current.clone(),to:target.clone(),yawFrom:yaw,yawTo:targetYaw,pitchFrom:pitch,pitchTo:targetPitch,t:0};$('#position').textContent='LE VESTIBULE';$('#counter').textContent='Visite libre';$('.scene-label p').textContent='Des histoires en couleurs.'};
function free(){if(transition){target.copy(current);targetYaw=yaw;targetPitch=pitch;transition=null}stopTour();setVisiting();$('#position').textContent='PROMENADE LIBRE';$('#counter').textContent='Visite libre'}
function move(forward,side,dt){free();let nx=target.x+(Math.sin(targetYaw)*forward+Math.cos(targetYaw)*side)*dt,nz=target.z+(-Math.cos(targetYaw)*forward+Math.sin(targetYaw)*side)*dt;nx=THREE.MathUtils.clamp(nx,-5.05,5.05);nz=THREE.MathUtils.clamp(nz,-5.8,10.5);if(walkable(nx,nz)){target.x=nx;target.z=nz}}
const movementKeys=['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','z','q'];window.addEventListener('keydown',e=>{if($('dialog[open]')||e.target.closest('button,a,input'))return;let k=e.key.toLowerCase();if(movementKeys.includes(k)){e.preventDefault();keys.add(k)}if(e.key==='Escape')$('#restoreui').click()});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden)stopTour()});
let pad=null;document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();pad=b.dataset.move;b.setPointerCapture(e.pointerId)};b.onpointerup=b.onpointercancel=()=>pad=null});
try{
scene=new THREE.Scene();scene.background=new THREE.Color('#36212f');scene.fog=new THREE.Fog('#36212f',24,55);camera=new THREE.PerspectiveCamera(innerWidth<700?65:54,innerWidth/innerHeight,.08,70);camera.position.copy(current);renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.15:1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;$('#scene').append(renderer.domElement);raycaster=new THREE.Raycaster();
const wall=new THREE.MeshStandardMaterial({color:0xd5a1a0,roughness:.9}),floor=new THREE.MeshStandardMaterial({color:0x8c5739,roughness:.65,metalness:0}),trim=new THREE.MeshStandardMaterial({color:0x734240,roughness:.8}),dark=new THREE.MeshStandardMaterial({color:0x232b32,roughness:.6});
function box(w,h,d,x,y,z,mat=wall){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;scene.add(m);return m}
floorMesh=box(12,.2,25,0,-.11,5.3,floor);box(12,6,.2,0,3,-7);box(.2,6,25,-6,3,5.3);box(.2,6,25,6,3,5.3);box(12,.2,25,0,6,5.3);
for(let h of [.13,4.82]){box(12,.09,.1,0,h,-6.87,trim);box(.1,.09,24,-5.87,h,5,trim);box(.1,.09,24,5.87,h,5,trim)}
for(let z of [-6.65,.1,6.65,12])for(let x of [-5.83,5.83]){box(.14,4.7,.28,x,2.35,z,trim);box(.21,.16,.42,x,4.55,z,trim);box(.21,.2,.42,x,.12,z,trim)}
for(let z=-5;z<15;z+=4){box(12,.2,.23,0,5.75,z,trim);box(4.4,.04,2.9,0,5.88,z+1.7,new THREE.MeshBasicMaterial({color:0xffffff}));for(let x of [-4.4,4.4]){box(.055,.06,3.5,x,5.62,z+1.7,dark);for(let dz of [.6,2.8])box(.17,.15,.22,x,5.5,z+dz,dark)}}
scene.add(new THREE.HemisphereLight(0xffdbd1,0x292044,1.25));const sun=new THREE.DirectionalLight(0xffcfa8,1.8);sun.position.set(-3,5,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.normalBias=.025;sun.shadow.bias=-.00015;sun.shadow.radius=3;scene.add(sun);
surface(wall,0,.007,.12);surface(floor,1,.004,.35);surface(trim,1,.003,.23);surface(dark,4,.0007,.06);
const loader=new THREE.TextureLoader();
works.forEach((w,i)=>{const group=new THREE.Group();group.position.set(w.x,2.6,w.z);group.rotation.y=w.rotation;scene.add(group);const frame=new THREE.Mesh(new THREE.BoxGeometry(w.w+.10,w.h+.10,.12),dark);frame.castShadow=true;frame.receiveShadow=true;group.add(frame);const tex=loader.load(w.image,()=>{},undefined,()=>{const card=document.querySelectorAll('.work-card span')[i];card.textContent='Image indisponible'});tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();const painting=new THREE.Mesh(new THREE.PlaneGeometry(w.w,w.h),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));painting.position.z=.067;painting.userData.work=i;group.add(painting);artMeshes.push(painting);const plaque=new THREE.Mesh(new THREE.BoxGeometry(.35,.18,.014),wall);plaque.position.set(w.w/2+.31,-w.h/2+.1,0);group.add(plaque);const spot=new THREE.SpotLight(0xfff4dd,23,10,.68,.8,1.7);spot.position.set(w.x+Math.sin(w.rotation)*1.3,5.35,w.z+Math.cos(w.rotation)*1.3);spot.target=group;scene.add(spot)});
// A colourful lounge occupies the original bench footprint so the existing walk routes stay clear.
const fabricCache=new Map();const fabric=c=>{if(!fabricCache.has(c))fabricCache.set(c,textile(c));return fabricCache.get(c)};
const orange=fabric(0xf56832),rose=fabric(0xe84379),teal=fabric(0x14969a),cream=fabric(0xf2c999);
function puff(x,y,z,sx,sy,sz,mat){const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
for(let i=0;i<6;i++){const x=-1.4+i*.56;puff(x,.42,3.28,.36,.3,.56,orange);puff(x,.86,3.64,.36,.51,.25,orange)}
puff(-1.68,.64,3.25,.2,.35,.56,orange);puff(1.68,.64,3.25,.2,.35,.56,orange);
puff(-.9,1.04,3.40,.31,.30,.14,rose).rotation.z=.28;puff(.9,1.02,3.4,.31,.30,.14,teal).rotation.z=-.25;
// Woven graphic rug, flush with the floor and free to walk over.
const rugPalette=[0xe94471,0x6137a0,0xef7834,0x17a0a3,0xeebc35];
for(let ix=0;ix<10;ix++)for(let iz=0;iz<7;iz++){const mat=fabric(rugPalette[(ix+iz*2)%5]);box(.65,.016,.65,-2.925+ix*.65,.012,1.05+iz*.65,mat)}
// A lounge by the entrance, outside the visitor route.
for(let i=0;i<5;i++){puff(-3.9+i*.6,.46,13.1,.40,.35,.65,rose);puff(-3.9+i*.6,.96,13.58,.40,.55,.27,rose)}
puff(2.7,.38,13.1,1.15,.37,.85,teal);
const tableMat=glaze(0xe45124);
function cylinder(radius,height,x,y,z,mat){let m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,48),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
cylinder(.8,.12,0,.72,13,tableMat);cylinder(.36,.65,0,.34,13,tableMat);
// Warm slatted feature walls and pastel panels behind the paintings.
const wood=new THREE.MeshStandardMaterial({color:0x774832,roughness:.85});
surface(wood,1,.006,.32);
for(let x=-5.7;x<5.8;x+=.22)box(.075,5.7,.07,x,2.85,-6.86,wood);
// Panels are slimmed so neighbouring works on the same wall never overlap.
const panelColors=[0x284f53,0xae5576,0x684e89,0xa84c30,0x315854,0x78495e,0xa45e3b,0x8a6a4a,0x4a6b6b,0x8a4a5c,0x55608c,0x6b7a4a];
works.forEach((w,i)=>{let panel=new THREE.Mesh(new THREE.BoxGeometry(w.w+.2,w.h+.2,.06),fabric(panelColors[i]));panel.position.set(w.x,2.6,w.z);panel.rotation.y=w.rotation;panel.translateZ(-.08);scene.add(panel)});
// Continuous neon accents, with local light washing the ceiling.
const pinkGlow=new THREE.MeshBasicMaterial({color:0xff548f}),cyanGlow=new THREE.MeshBasicMaterial({color:0x52e8e2});
box(.035,.035,23,-5.7,4.85,5,pinkGlow);box(.035,.035,23,5.7,4.85,5,cyanGlow);box(11.4,.035,.035,0,4.85,-6.75,pinkGlow);
for(let z of [-4,3,10]){let light=new THREE.PointLight(0xff5387,13,8,2);light.position.set(-4.8,4.5,z);scene.add(light);let cool=new THREE.PointLight(0x45dce9,10,8,2);cool.position.set(4.8,4.5,z);scene.add(cool)}
// A rear glazed wall opens onto a dusk sky.
const skyGeo=new THREE.PlaneGeometry(11.5,5.6);
const skyMat=new THREE.ShaderMaterial({uniforms:{},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv; void main(){vec3 a=vec3(.98,.38,.36);vec3 b=vec3(.13,.23,.50);gl_FragColor=vec4(mix(a,b,smoothstep(.1,.95,vUv.y)),1.);}',side:THREE.DoubleSide});
const sky=new THREE.Mesh(skyGeo,skyMat);sky.position.set(0,3,17.65);scene.add(sky);
for(let x=-5.8;x<6;x+=1.93)box(.07,5.8,.08,x,3,17.5,dark);box(11.8,.06,.08,0,2.2,17.5,dark);
// Sculptural globe lamps echo the reference interiors.
for(const [x,z,col] of [[-4.7,11.7,0xff783c],[4.7,11.7,0xff59ad]]){cylinder(.28,.05,x,.04,z,dark);cylinder(.035,2.4,x,1.2,z,dark);puff(x,2.45,z,.44,.44,.44,new THREE.MeshBasicMaterial({color:col}));let l=new THREE.PointLight(col,12,6,2);l.position.set(x,2.5,z);scene.add(l)}
for(const [x,z] of [[-2,10],[2,10]]){box(.025,1.4,.025,x,5.25,z,dark);puff(x,4.45,z,.45,.55,.45,new THREE.MeshBasicMaterial({color:0xffb36c}))}
// Industrial loft structure: exposed steel and a suspended ventilation duct.
const steel=new THREE.MeshStandardMaterial({color:0x252831,roughness:.48,metalness:.55});
for(const z of [-4.8,1,6.8,12.6]){box(11.7,.12,.36,0,5.55,z,steel);box(11.7,.12,.36,0,5.94,z,steel);box(11.7,.34,.075,0,5.75,z,steel)}
surface(steel,4,.0008,.10);
const ductMat=new THREE.MeshStandardMaterial({color:0x827b80,roughness:.4,metalness:.7});
surface(ductMat,4,.0006,.12);
const duct=cylinder(.21,22,-3.4,5.35,5,ductMat);duct.rotation.x=Math.PI/2;
for(let z=-5;z<16;z+=2){let ring=new THREE.Mesh(new THREE.TorusGeometry(.215,.018,8,24),steel);ring.position.set(-3.4,5.35,z);scene.add(ring);box(.025,.35,.025,-3.4,5.74,z,steel)}
// High factory windows remain above all artworks.
for(const side of [-1,1])for(const z of [-3.2,2,7.5]){
 const pane=new THREE.Mesh(new THREE.PlaneGeometry(3.3,.66),skyMat);pane.position.set(side*5.865,5.30,z);pane.rotation.y=-side*Math.PI/2;scene.add(pane);
 for(const dz of [-1.68,0,1.68])box(.10,.76,.045,side*5.82,5.3,z+dz,steel);
 for(const y of [4.94,5.66])box(.10,.045,3.4,side*5.82,y,z,steel);
}
// Brickwork frames the rear lounge, with instancing to keep rendering light.
const brickMat=new THREE.MeshStandardMaterial({color:0x9e594b,roughness:1});
surface(brickMat,3,.017,.34);
const bricks=new THREE.InstancedMesh(new THREE.BoxGeometry(.075,.20,.43),brickMat,240);let brickIndex=0;const brickPose=new THREE.Object3D();
for(const side of [-1,1])for(let row=0;row<15;row++)for(let col=0;col<8;col++){
 brickPose.position.set(side*5.85,.16+row*.23,11.4+col*.49+(row%2)*.245);brickPose.updateMatrix();bricks.setMatrixAt(brickIndex,brickPose.matrix);bricks.setColorAt(brickIndex,new THREE.Color().setScalar(.82+((brickIndex*37)%19)/90));brickIndex++;
}bricks.receiveShadow=true;scene.add(bricks);
// Open bookcases, ceramics and records make the gallery feel inhabited.
const bookColors=[0xdb6240,0xe9ba54,0x468b83,0xbb5176,0xe8d3ac,0x59416f];
for(const side of [-1,1]){
 const x=side*5.53,z=10.45;
 for(const dz of [-.65,.65])box(.10,2.8,.07,x,1.42,z+dz,steel);
 for(let shelf=0;shelf<4;shelf++){
  const y=.25+shelf*.72;box(.58,.065,1.45,x,y,z,wood);
  for(let b=0;b<5;b++){const ht=.31+(b%3)*.075;box(.31,ht,.10,x-side*.08,y+.04+ht/2,z-.47+b*.125,fabric(bookColors[(b+shelf)%6]));}
  const vaseMat=glaze(bookColors[(shelf+2)%6]);
  puff(x-side*.08,y+.20,z+.42,.13,.18,.13,vaseMat);cylinder(.063,.15,x-side*.08,y+.36,z+.42,vaseMat);
 }
}
// Broad-leaf plants sit outside the clear walking envelope.
const leafMat=new THREE.MeshStandardMaterial({color:0x3c7953,roughness:.9,side:THREE.DoubleSide});
const stemMat=fabric(0x31543b);
for(const [x,z] of [[-5.53,.1],[5.53,.1],[-4.65,15],[4.65,15]]){
 cylinder(.26,.48,x,.25,z,cream);cylinder(.045,1.4,x,1.15,z,stemMat);
 for(let k=0;k<7;k++){const angle=k*2.4;const leaf=puff(x+Math.cos(angle)*.17,1.0+k*.14,z+Math.sin(angle)*.17,.085,.27,.028,leafMat);leaf.rotation.set(.3,angle,Math.sin(angle)*.65)}
}
// Coffee-table objects and a listening corner in the rear lounge.
for(let i=0;i<3;i++)box(.48,.045,.34,-.16,.81+i*.05,13.1,fabric(bookColors[i]));
cylinder(.09,.15,.32,.85,12.82,cream);
box(1.7,.12,.56,3.7,.82,15.5,wood);
for(const x of [3.05,4.35])box(.055,.76,.055,x,.39,15.5,steel);
box(.70,.08,.40,3.55,.92,15.5,dark);const vinyl=cylinder(.155,.01,3.47,.969,15.5,steel);
cylinder(.035,.014,3.47,.978,15.5,rose);box(.035,.025,.23,3.77,.99,15.52,cream);
for(const x of [2.65,4.75]){box(.36,.58,.32,x,1.1,15.48,dark);for(const y of [.99,1.25]){let cone=cylinder(y<1.1?.11:.055,.015,x,y,15.31,steel);cone.rotation.x=Math.PI/2}}
// Layered pendant lights and wall sconces, away from the art surfaces.
for(const [x,z] of [[0,-.3],[1.8,5.2],[-1.5,11.5]]){
 box(.018,1.25,.018,x,5.23,z,steel);
 const shade=new THREE.Mesh(new THREE.ConeGeometry(.42,.28,40,1,true),tableMat);shade.position.set(x,4.51,z);shade.castShadow=true;scene.add(shade);
 puff(x,4.38,z,.23,.075,.23,new THREE.MeshBasicMaterial({color:0xffd2a2}));
}
// Sconces moved to wall stretches left free by the denser hang.
for(const side of [-1,1])for(const z of(side<0?[-5.3,5]:[-5.3,8.9])){
 box(.16,.38,.16,side*5.72,2.8,z,steel);box(.17,.05,.17,side*5.70,3.02,z,new THREE.MeshBasicMaterial({color:0xffba78}));
}

// Furnished alcoves along the visitor route: the left one stays put...
const cobalt=fabric(0x24498e),yellow=fabric(0xf6bb25),ivory=fabric(0xf2e1c6);
for(let i=0;i<4;i++){const z=4.65+i*.35;puff(-4.95,.43,z,.60,.31,.25,cobalt);puff(-5.38,.91,z,.22,.52,.25,cobalt)}
for(const z of [4.45,5.95])puff(-4.94,.68,z,.62,.27,.17,cobalt);
puff(-5.07,1.05,4.93,.18,.28,.24,yellow).rotation.x=.2;
cylinder(.35,.065,-3.94,.61,5.2,wood);cylinder(.11,.56,-3.94,.3,5.2,steel);
box(.25,.045,.30,-3.94,.68,5.2,rose);cylinder(.065,.13,-3.96,.77,5.2,cream);
// ...while the right-hand alcove now backs onto the rear brickwork, freeing its wall for new paintings.
for(let i=0;i<6;i++){const z=12.85+i*.2;puff(4.85,.46,z,.51,.30,.145,i%2?ivory:rose);puff(5.21,.90,z,.18,.50,.145,i%2?ivory:rose)}
puff(4.7,.95,13.5,.17,.29,.30,yellow);
cylinder(.32,.08,3.96,.58,13.45,tableMat);cylinder(.15,.52,3.96,.28,13.45,tableMat);
puff(3.96,.85,13.45,.17,.19,.17,new THREE.MeshBasicMaterial({color:0xffc14b}));
// Checkered rugs tie each seating group together without blocking movement.
for(let i=0;i<6;i++)for(let j=0;j<6;j++){
 box(.36,.012,.36,-5.38+i*.36,.017,4.3+j*.36,(i+j)%2?ivory:steel);
 box(.34,.012,.34,3.55+i*.34,.017,12.6+j*.34,(i+j)%2?rose:ivory);
}
// Low gallery consoles fill the space beneath the side-wall artworks.
works.forEach((w,i)=>{if(Math.abs(w.rotation)<.1)return;const side=Math.sign(w.x);box(.42,.055,1.8,side*5.55,.66,w.z,wood);for(const dz of[-.74,.74])box(.055,.61,.055,side*5.55,.33,w.z+dz,steel);for(let k=0;k<3;k++)box(.27,.035,.35,side*5.54,.71+k*.037,w.z-.5,fabric(bookColors[(i+k)%6]));puff(side*5.53,.84,w.z+.50,.12,.16,.12,teal)});
// Sculptural pop figures on plinths, inspired by collectible designer toys.
function collectible(x,z,scale,color){const g=new THREE.Group();scene.add(g);const start=scene.children.length;const mat=glaze(color);
 box(.78,.46,.78,x,.23,z,rose);
 const base=.47;function part(dx,y,dz,sx,sy,sz,m=mat){return puff(x+dx*scale,base+y*scale,z+dz*scale,sx*scale,sy*scale,sz*scale,m)}
 part(0,.80,0,.26,.39,.21);part(0,1.40,0,.39,.34,.29);
 for(const side of [-1,1]){part(side*.34,1.57,0,.14,.15,.13);part(side*.15,.31,.02,.12,.29,.13);part(side*.15,.10,-.10,.15,.10,.23,ivory);part(side*.30,.85,0,.10,.28,.11);part(side*.22,1.13,-.22,.13,.15,.10,ivory)}
 for(const side of [-1,1])for(const rot of [-.7,.7]){let cross=box(.13*scale,.025*scale,.018*scale,x+side*.16*scale,base+1.43*scale,z-.285*scale,steel);cross.rotation.z=rot}
}
collectible(-4.55,-5.4,1.05,0xed5487);collectible(-1.6,12.5,.85,0x33b6b2);
// A large blue shelving wall creates a second visual anchor behind the lounge.
const shelfBlue=fabric(0x2a5885),shelfRed=fabric(0xca533f);
for(const x of [-4.9,-3.6,-2.3])box(.075,3.1,.38,x,1.57,16.5,shelfRed);
for(let row=0;row<5;row++){const y=.15+row*.65;box(3.15,.075,.55,-3.6,y,16.5,shelfBlue);for(let k=0;k<9;k++){const h=.22+(k%3)*.07;box(.10,h,.25,-4.95+k*.33,y+.05+h/2,16.48,fabric(bookColors[(k+row)%6]));}puff(-3.2,y+.25,16.45,.16,.20,.14,cream)}
// Cushions and throws turn the central sofa into a lived-in lounge.
for(let i=0;i<7;i++)box(.095,.025,.78,-.35+i*.10,.72,3.30,i%2?ivory:cobalt);
puff(.25,1.05,3.38,.31,.27,.12,yellow);
for(let k=0;k<6;k++){const a=k*Math.PI/3;puff(.25+Math.cos(a)*.19,1.05+Math.sin(a)*.19,3.22,.12,.12,.05,rose)}puff(.25,1.05,3.15,.12,.12,.05,yellow);
// Ribbed paper lantern above the central seating.
const paper=new THREE.MeshBasicMaterial({color:0xffd497});puff(0,4.35,3.3,.44,.69,.44,paper);box(.018,1,.018,0,5.4,3.3,steel);
for(let k=1;k<14;k++){const t=k/14*Math.PI;let hoop=new THREE.Mesh(new THREE.TorusGeometry(Math.sin(t)*.447,.008,4,32),cream);hoop.rotation.x=Math.PI/2;hoop.position.set(0,4.35+Math.cos(t)*.69,3.3);scene.add(hoop)}

// Fine parquet joins follow the length of the room.
const joint=fabric(0x64412d);for(let x=-5.8;x<6;x+=.42)box(.009,.002,25,x,-.007,5.3,joint);
// Batch repeated static decor into instanced draws. Keep paintings and the raycast floor separate.
scene.updateMatrixWorld(true);
const batches=new Map();const unitBox=new THREE.BoxGeometry(1,1,1);
scene.traverse(mesh=>{
 if(!mesh.isMesh||mesh.isInstancedMesh||mesh===floorMesh||artMeshes.includes(mesh)||Array.isArray(mesh.material))return;
 const m=mesh.material;if(m.map||m.isShaderMaterial)return;
 const key=JSON.stringify([mesh.geometry.type,mesh.geometry.type==='BoxGeometry'?'unit':mesh.geometry.parameters,m.type,m.color?.getHex(),m.roughness,m.metalness,m.clearcoat,m.clearcoatRoughness,m.sheen,m.sheenColor?.getHex(),m.side,m.transparent,m.opacity,m.userData.surface]);
 if(!batches.has(key))batches.set(key,[]);batches.get(key).push(mesh);
});
let batchedObjects=0;
for(const meshes of batches.values()){
 if(meshes.length<2)continue;const first=meshes[0],isBox=first.geometry.type==='BoxGeometry';
 const inst=new THREE.InstancedMesh(isBox?unitBox:first.geometry,first.material,meshes.length);
 inst.castShadow=meshes.some(m=>m.castShadow);inst.receiveShadow=meshes.some(m=>m.receiveShadow);
 meshes.forEach((mesh,i)=>{const matrix=mesh.matrixWorld.clone();if(isBox){const p=mesh.geometry.parameters;matrix.scale(new THREE.Vector3(p.width,p.height,p.depth))}inst.setMatrixAt(i,matrix);mesh.removeFromParent()});
 inst.computeBoundingSphere();scene.add(inst);batchedObjects+=meshes.length;
}
// The room and lights are static: calculate the shadow map only once.
renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
const reflectionTarget=new THREE.WebGLCubeRenderTarget(64,{type:THREE.HalfFloatType});
const reflectionCamera=new THREE.CubeCamera(.1,45,reflectionTarget);reflectionCamera.position.set(0,2.4,7);
const shadowsBefore=renderer.shadowMap.enabled;renderer.shadowMap.enabled=false;reflectionCamera.update(renderer,scene);renderer.shadowMap.enabled=shadowsBefore;renderer.shadowMap.needsUpdate=true;
const reflectionFilter=new THREE.PMREMGenerator(renderer);const roomReflection=reflectionFilter.fromCubemap(reflectionTarget.texture);reflectionTarget.dispose();reflectionFilter.dispose();
scene.environment=roomReflection.texture;scene.environmentIntensity=.55;
hoverRing=new THREE.Mesh(new THREE.RingGeometry(.22,.25,48),new THREE.MeshBasicMaterial({color:0x727c66,transparent:true,opacity:.65,side:THREE.DoubleSide}));hoverRing.rotation.x=-Math.PI/2;hoverRing.visible=false;scene.add(hoverRing);
function hits(e){pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects([...artMeshes,floorMesh])}
let down=null;renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,yaw:targetYaw,pitch:targetPitch,drag:false};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(down){let dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>7&&!down.drag){free();down.yaw=targetYaw;down.pitch=targetPitch;down.drag=true}if(down.drag){targetYaw=down.yaw-dx*.004;targetPitch=THREE.MathUtils.clamp(down.pitch+dy*.003,-.8,.8);hoverRing.visible=false}}else{const hit=hits(e)[0];renderer.domElement.style.cursor=hit?.object.userData.work!==undefined?'pointer':hit?'crosshair':'grab';hoverRing.visible=!!hit&&hit.object===floorMesh;if(hoverRing.visible){hoverRing.position.copy(hit.point);hoverRing.position.y=.003}}});
renderer.domElement.addEventListener('pointerup',e=>{if(down&&!down.drag){let hit=hits(e)[0];if(hit?.object.userData.work!==undefined){let i=hit.object.userData.work;if(visiting&&selected===i&&!transition&&current.distanceTo(new THREE.Vector3(works[i].x,1.72,works[i].z))<4.8)openDetail(i);else go(i)}else if(hit?.object===floorMesh){free();let x=THREE.MathUtils.clamp(hit.point.x,-5,5),z=THREE.MathUtils.clamp(hit.point.z,-5.8,10.5);if(walkable(x,z)){target.set(x,1.72,z);transition={from:current.clone(),to:target.clone(),yawFrom:yaw,yawTo:targetYaw,pitchFrom:pitch,pitchTo:targetPitch,t:0}}}}down=null});renderer.domElement.addEventListener('pointercancel',()=>down=null);renderer.domElement.addEventListener('pointerleave',()=>hoverRing.visible=false);
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();move(-Math.sign(e.deltaY),0,.45)},{passive:false});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?65:54;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
let qualityFrames=0,qualityTime=0,lastMapUpdate=0;let last=performance.now();function animate(now){if(document.hidden){last=now;requestAnimationFrame(animate);return}const frameMs=now-last;if(frameMs<200){qualityTime+=frameMs;qualityFrames++}if(qualityFrames>=90){const avg=qualityTime/qualityFrames;const ratio=renderer.getPixelRatio();if(avg>26&&ratio>.85)renderer.setPixelRatio(Math.max(.85,ratio-.2));qualityTime=0;qualityFrames=0;}let dt=Math.min((now-last)/1000,.05);last=now;if(!$('dialog[open]')){let f=(keys.has('w')||keys.has('z')||keys.has('arrowup')||pad==='forward'?1:0)-(keys.has('s')||keys.has('arrowdown')||pad==='back'?1:0),s=(keys.has('d')||keys.has('arrowright')||pad==='right'?1:0)-(keys.has('a')||keys.has('q')||keys.has('arrowleft')||pad==='left'?1:0);if(f||s){let norm=Math.hypot(f,s);move(f/norm,s/norm,dt*2.4)}if(guided&&!transition){tourElapsed+=dt;$('#tourprogress').style.width=`${Math.min(tourElapsed/10,1)*90}%`;if(tourElapsed>=10)go(selected+1,true)}}
if(transition){transition.t=Math.min(1,transition.t+dt/(reduced?.01:2.15));let t=transition.t,t2=t*t*(3-2*t);if(!transition.path)transition.path=safePath(transition.from,transition.to);current.copy(onPath(transition.path,t2));yaw=THREE.MathUtils.lerp(transition.yawFrom,transition.yawTo,t2);pitch=THREE.MathUtils.lerp(transition.pitchFrom,transition.pitchTo,t2);if(t===1)transition=null}else{let t=reduced?1:1-Math.exp(-9*dt);current.lerp(target,t);yaw+=(targetYaw-yaw)*t;pitch+=(targetPitch-pitch)*t}camera.position.copy(current);camera.rotation.order='YXZ';camera.rotation.set(pitch,-yaw,0);if(now-lastMapUpdate>100){$('#mapPosition').setAttribute('cx',String(60+current.x*7.5));$('#mapPosition').setAttribute('cy',String(18+(current.z+7)*6.7));lastMapUpdate=now;}renderer.render(scene,camera);requestAnimationFrame(animate)}requestAnimationFrame(animate);
}catch(e){console.error(e);$('#fallback').hidden=false;$('#intro').style.display='none';$('#artHint').style.display='none';$('#enter').disabled=true;document.querySelectorAll('.work-card').forEach((b,i)=>b.onclick=()=>openDetail(i))}
