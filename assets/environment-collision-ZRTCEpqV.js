import{S as x,P as M,H as P,W as S,a as R,C as W,d as v,M as y,e as p,V as z}from"./ARButton-71T4euHb.js";let u,s,a,e,w,c,d=null;C();function C(){u=document.createElement("div"),document.body.appendChild(u),a=new x,s=new M(70,window.innerWidth/window.innerHeight,.01,20);const l=new P(16777215,12303359,3);l.position.set(.5,1,.25),a.add(l),e=new S({antialias:!0,alpha:!0}),e.setPixelRatio(window.devicePixelRatio),e.setSize(window.innerWidth,window.innerHeight),e.setAnimationLoop(L),e.xr.enabled=!0,u.appendChild(e.domElement),e.xr.addEventListener("sessionstart",async()=>{const i=e.xr.getSession();if(!i)return;const n=await i.requestReferenceSpace("viewer");n&&(i.requestHitTestSource({space:n}).then(o=>{d=o,console.log("HitTestSource initialized:",d)}),i.addEventListener("end",()=>{d=null}))}),document.body.appendChild(R.createButton(e,{requiredFeatures:["hit-test","depth-sensing"],depthSensing:{usagePreference:["cpu-optimized","gpu-optimized"],dataFormatPreference:["luminance-alpha"]}}));const t=new W(.1,.1,.2,32).translate(0,.1,0),r=new v({color:16777215*Math.random()});c=new y(t,r),a.add(c),w=e.xr.getController(0),a.add(w),window.addEventListener("resize",H)}function H(){s.aspect=window.innerWidth/window.innerHeight,s.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight)}function E(l,t,r,i=.1){if(!r)return;const n=new z;n.setFromMatrixPosition(t.matrixWorld),n.project(s);const o=(n.x+1)/2,h=1-(n.y+1)/2,f=Math.min(Math.max(o,0),1),g=Math.min(Math.max(h,0),1);try{const m=r.getDepthInMeters(f,g);return t.position.distanceTo(s.position)>m+i?(console.log("Collision Detected!"),t.material.color.set(16711680),!0):(t.material.color.set(65280),!1)}catch(m){console.error("Error getting depth for collision check:",m)}}function L(l,t){if(!t)return;const r=e.xr.getReferenceSpace();if(!r||!d)return;const i=t.getHitTestResults(d),n=t.getViewerPose(r);if(!n)return;const o=t.getDepthInformation(n.views[0]);if(o){if(i.length>0){const h=i[0].getPose(r);E(t,c,o)||(c.position.setFromMatrixPosition(new p().fromArray(h.transform.matrix)),c.quaternion.setFromRotationMatrix(new p().fromArray(h.transform.matrix)))}e.render(a,s)}}
