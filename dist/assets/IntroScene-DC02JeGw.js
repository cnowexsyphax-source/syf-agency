import{j as e,r as n}from"./index-C5aGFN4i.js";import{C as P,E as b,L as d,u as z,a as v,A as M,b as y,D as S,B as A,c as g,d as B,M as R}from"./Lightformer-BEXOIyOs.js";const{lerp:c,damp:w}=R,T=`
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixel;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aPhase * 6.2831) * 0.35;
    p.x += cos(uTime * 0.18 + aPhase * 4.0) * 0.25;
    p.z = mod(p.z + uTime * 0.6 + 22.0, 28.0) - 22.0; // slow drift toward the camera
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (14.0 / -mv.z);
    vAlpha = smoothstep(-22.0, -14.0, p.z) * (1.0 - smoothstep(2.0, 5.5, p.z));
  }
`,I=`
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.35, 0.5 - d));
    gl_FragColor = vec4(col, a * a * vAlpha * uOpacity);
  }
`;function G({v:r,count:o}){const t=n.useRef(null),i=n.useMemo(()=>{const a=new A,l=new Float32Array(o*3),f=new Float32Array(o),m=new Float32Array(o);for(let s=0;s<o;s++)l[s*3]=(Math.random()-.5)*26,l[s*3+1]=(Math.random()-.5)*16,l[s*3+2]=Math.random()*-28+6,f[s]=Math.random()<.06?3.5+Math.random()*3:.8+Math.random()*1.6,m[s]=Math.random();return a.setAttribute("position",new g(l,3)),a.setAttribute("aSize",new g(f,1)),a.setAttribute("aPhase",new g(m,1)),a},[o]),u=n.useMemo(()=>({uTime:{value:0},uOpacity:{value:0},uPixel:{value:Math.min(window.devicePixelRatio,2)},uColorA:{value:new y("#287BFF")},uColorB:{value:new y("#F5F7FF")}}),[]);return v(({clock:a})=>{t.current.uniforms.uTime.value=a.elapsedTime,t.current.uniforms.uOpacity.value=r.current.atmosphere}),e.jsx("points",{geometry:i,frustumCulled:!1,children:e.jsx("shaderMaterial",{ref:t,vertexShader:T,fragmentShader:I,uniforms:u,transparent:!0,depthWrite:!1,blending:M})})}const V=`
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`,E=`
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    float facing = pow(abs(dot(normalize(vN), normalize(vView))), 1.6);
    float along = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));
    gl_FragColor = vec4(uColor, facing * along * uIntensity);
  }
`;function U({v:r}){const o=n.useRef(null),t=n.useMemo(()=>({uIntensity:{value:0},uColor:{value:new y("#287BFF")}}),[]);return v(({clock:i})=>{const{atmosphere:u,exit:a}=r.current;o.current.uniforms.uIntensity.value=(.12+Math.sin(i.elapsedTime*.8)*.02)*u*(1-a)}),e.jsxs("mesh",{position:[0,3.2,-3],rotation:[0,0,0],children:[e.jsx("coneGeometry",{args:[4.2,12,64,1,!0]}),e.jsx("shaderMaterial",{ref:o,vertexShader:V,fragmentShader:E,uniforms:t,transparent:!0,depthWrite:!1,side:S,blending:M})]})}function _(){return n.useMemo(()=>{const r=document.createElement("canvas");r.width=r.height=256;const o=r.getContext("2d"),t=o.createRadialGradient(128,128,0,128,128,128);return t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.25,"rgba(255,255,255,0.45)"),t.addColorStop(1,"rgba(255,255,255,0)"),o.fillStyle=t,o.fillRect(0,0,256,256),new B(r)},[])}function N({v:r,quality:o}){const t=n.useRef(null),i=n.useRef(null),u=n.useRef(null),a=n.useRef(null),l=n.useRef(null),f=_(),m=o==="high"?220:120,s=z(x=>x.size),F=Math.min(1,Math.max(.55,s.width/s.height*1.35));return v(({clock:x})=>{const{emerge:j,recede:h,atmosphere:C}=r.current,p=x.elapsedTime;t.current.scale.setScalar(c(.001,1,j)*(1+h*.12)*F),t.current.position.z=c(-3,0,j)-h*1.9,i.current.rotation.set(c(1.05+Math.sin(p*.35)*.12,.08,h),c(p*.3,0,h),0),u.current.rotation.set(c(-.5+Math.cos(p*.4)*.2,0,h),c(1.2-p*.45,.12,h),c(p*.2,0,h)),a.current.rotation.set(c(1.25,0,h),0,-p*.12),l.current.opacity=.26*C}),e.jsxs("group",{ref:t,children:[e.jsxs("mesh",{position:[0,0,-2.5],scale:7,children:[e.jsx("planeGeometry",{}),e.jsx("meshBasicMaterial",{ref:l,map:f,color:"#0750B5",transparent:!0,opacity:0,depthWrite:!1,blending:M,toneMapped:!1})]}),e.jsxs("mesh",{ref:i,children:[e.jsx("torusGeometry",{args:[1.75,.12,48,m]}),e.jsx("meshPhysicalMaterial",{color:"#C5D0E0",metalness:1,roughness:.14,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.2})]}),e.jsxs("mesh",{ref:u,children:[e.jsx("torusGeometry",{args:[1.38,.05,32,m]}),e.jsx("meshPhysicalMaterial",{color:"#F5F7FF",metalness:1,roughness:.1,clearcoat:1,envMapIntensity:1.3})]}),e.jsxs("mesh",{ref:a,children:[e.jsx("torusGeometry",{args:[2.3,.008,12,220]}),e.jsx("meshStandardMaterial",{color:"#F5F7FF",metalness:1,roughness:.2})]})]})}function L({v:r,pointer:o}){const t=n.useRef({x:0,y:0});return v(({camera:i,clock:u},a)=>{const{emerge:l,exit:f}=r.current;t.current.x=w(t.current.x,o.current.x,2.5,a),t.current.y=w(t.current.y,o.current.y,2.5,a);const m=u.elapsedTime,s=c(11,7.2,l)-f*7.6;i.position.set(Math.sin(m*.2)*.35+t.current.x*.45,Math.cos(m*.17)*.18-t.current.y*.3,s),i.lookAt(0,0,-2)}),null}function O(){return e.jsxs(b,{resolution:256,frames:1,children:[e.jsx("color",{attach:"background",args:["#070A12"]}),e.jsx(d,{form:"rect",intensity:4,color:"#ffffff",position:[0,5,2],"rotation-x":Math.PI/2,scale:[10,3,1]}),e.jsx(d,{form:"rect",intensity:6,color:"#ffffff",position:[-4,0,3],"rotation-y":Math.PI/3,scale:[.6,9,1]}),e.jsx(d,{form:"rect",intensity:2.6,color:"#287BFF",position:[5,-1,1],"rotation-y":-Math.PI/2,scale:[8,6,1]}),e.jsx(d,{form:"rect",intensity:2.5,color:"#0750B5",position:[0,-5,0],"rotation-x":-Math.PI/2,scale:[12,6,1]}),e.jsx(d,{form:"ring",intensity:2,color:"#F5F7FF",position:[2,2,6],scale:2})]})}function W({v:r,pointer:o,quality:t}){return e.jsxs(P,{className:"!absolute inset-0",dpr:Math.min(window.devicePixelRatio,t==="high"?1.75:1.25),camera:{position:[0,0,11],fov:35,near:.1,far:60},gl:{antialias:t==="high",alpha:!0,powerPreference:"high-performance"},children:[e.jsx("ambientLight",{intensity:.15}),e.jsx("pointLight",{position:[0,2.5,2],intensity:6,color:"#287BFF",distance:12}),e.jsxs(n.Suspense,{fallback:null,children:[e.jsx(O,{}),e.jsx(N,{v:r,quality:t})]}),e.jsx(U,{v:r}),e.jsx(G,{v:r,count:t==="high"?1400:520}),e.jsx(L,{v:r,pointer:o})]})}export{W as default};
