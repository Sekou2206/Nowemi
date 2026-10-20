import * as THREE from './three.module.js';
const detailGLSL=`
varying vec3 vSurfacePosition;
float surfaceHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float surfaceNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(surfaceHash(i),surfaceHash(i+vec3(1,0,0)),f.x),mix(surfaceHash(i+vec3(0,1,0)),surfaceHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(surfaceHash(i+vec3(0,0,1)),surfaceHash(i+vec3(1,0,1)),f.x),mix(surfaceHash(i+vec3(0,1,1)),surfaceHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float surfaceHeight(vec3 p){
#if SURFACE_KIND == 1
 float warp=surfaceNoise(p*vec3(2.,.5,1.8));return .55+.20*sin(p.x*130.+warp*8.)+.12*surfaceNoise(p*vec3(90.,12.,5.));
#elif SURFACE_KIND == 2
 float weave=sin(p.x*420.)*sin(p.y*420.)+sin(p.z*420.)*.3;return .5+.16*weave+.16*surfaceNoise(p*170.);
#elif SURFACE_KIND == 3
 return .5+.25*surfaceNoise(p*42.)+.15*surfaceNoise(p*170.);
#elif SURFACE_KIND == 4
 return .5+.23*surfaceNoise(p*vec3(450.,6.,6.));
#elif SURFACE_KIND == 5
 return .5+.19*surfaceNoise(p*250.);
#else
 return .5+.14*surfaceNoise(p*95.);
#endif
}
`;
export function surface(material,kind,depth=.008,variation=.17){
 material.userData.surface={kind,depth,variation};
 material.onBeforeCompile=shader=>{
  shader.defines.SURFACE_KIND=kind;
  shader.vertexShader='varying vec3 vSurfacePosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 surfaceP=vec4(position,1.);\n#ifdef USE_INSTANCING\nsurfaceP=instanceMatrix*surfaceP;\n#endif\nvSurfacePosition=(modelMatrix*surfaceP).xyz;');
  shader.fragmentShader=detailGLSL+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\nfloat surfaceH=surfaceHeight(vSurfacePosition);\nfloat surfaceFade=1.-smoothstep(.02,.09,length(fwidth(vSurfacePosition)));\ndiffuseColor.rgb*=1.+(surfaceH-.5)*${variation.toFixed(4)}*surfaceFade;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(surfaceH-.5)*.14*surfaceFade,.06,1.);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>\nvec3 surfaceDx=dFdx(-vViewPosition),surfaceDy=dFdy(-vViewPosition);\nvec3 surfaceR1=cross(surfaceDy,normal),surfaceR2=cross(normal,surfaceDx);\nfloat surfaceDet=dot(surfaceDx,surfaceR1);\nvec3 surfaceGradient=sign(surfaceDet)*(dFdx(surfaceH)*surfaceR1+dFdy(surfaceH)*surfaceR2);\nnormal=normalize(abs(surfaceDet)*normal-${depth.toFixed(5)}*surfaceFade*surfaceGradient);`);
 };
 material.customProgramCacheKey=()=>`nowemi-surface-${kind}-${depth}-${variation}`;
 return material;
}
export function textile(color){return surface(new THREE.MeshPhysicalMaterial({color,roughness:.94,sheen:.65,sheenColor:new THREE.Color(color).lerp(new THREE.Color(0xffffff),.3),sheenRoughness:.9}),2,.006,.22)}
export function glaze(color){return surface(new THREE.MeshPhysicalMaterial({color,roughness:.23,clearcoat:.8,clearcoatRoughness:.16,ior:1.48}),5,.0007,.045)}
