import{S as g,P as f,W as x,h as M,M as P,g as S,A as v,V as W}from"./three.module-DI-f1AAC.js";import{A as z}from"./ARButton-CkA1wH0C.js";let p,a,r,e,m,c;b();function b(){p=document.createElement("div"),document.body.appendChild(p),r=new g,a=new f(70,window.innerWidth/window.innerHeight,.01,20),e=new x({antialias:!0,alpha:!0}),e.setPixelRatio(window.devicePixelRatio),e.setSize(window.innerWidth,window.innerHeight),e.setAnimationLoop(A),e.xr.enabled=!0,p.appendChild(e.domElement);const i=new M({color:16711680});c=new P(new S(.1,32,32),i),c.position.set(0,0,-1),r.add(c);const n=new v(16777215,1);r.add(n),document.body.appendChild(z.createButton(e,{requiredFeatures:["depth-sensing"],optionalFeatures:["hit-test"],depthSensing:{usagePreference:["cpu-optimized","gpu-optimized"],dataFormatPreference:["luminance-alpha"]}})),m=e.xr.getController(0),r.add(m),window.addEventListener("resize",R)}function y(i,n,d){if(!i)return;const t=new W;t.setFromMatrixPosition(n.matrixWorld),t.project(d);const s=(t.x+1)/2,o=1-(t.y+1)/2,h=Math.min(Math.max(s,0),1),w=Math.min(Math.max(o,0),1);try{const l=i.getDepthInMeters(h,w),u=n.position.distanceTo(d.position);n.visible=u<=l}catch(l){console.log("clampedX",h,"clampedY",w),console.error("Error getting depth for occlusion check:",l)}}function R(){a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight)}function A(i,n){if(!n||!e.xr.getSession())return;const t=e.xr.getReferenceSpace();if(!t)return;const s=n.getViewerPose(t);if(!s)return;const o=n.getDepthInformation(s.views[0]);if(o){if(!o){console.warn("Depth data not available yet.");return}y(o,c,a),e.render(r,a)}}
