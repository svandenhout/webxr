class x{static createButton(i,n={}){const e=document.createElement("button");function u(){if(n.domOverlay===void 0){const o=document.createElement("div");o.style.display="none",document.body.appendChild(o);const r=document.createElementNS("http://www.w3.org/2000/svg","svg");r.setAttribute("width",38),r.setAttribute("height",38),r.style.position="absolute",r.style.right="20px",r.style.top="20px",r.addEventListener("click",function(){t.end()}),o.appendChild(r);const s=document.createElementNS("http://www.w3.org/2000/svg","path");s.setAttribute("d","M 12,12 L 28,28 M 28,12 12,28"),s.setAttribute("stroke","#fff"),s.setAttribute("stroke-width",2),r.appendChild(s),n.optionalFeatures===void 0&&(n.optionalFeatures=[]),n.optionalFeatures.push("dom-overlay"),n.domOverlay={root:o}}let t=null;async function l(o){o.addEventListener("end",d),i.xr.setReferenceSpaceType("local"),await i.xr.setSession(o),e.textContent="STOP AR",n.domOverlay.root.style.display="",t=o}function d(){t.removeEventListener("end",d),e.textContent="START AR",n.domOverlay.root.style.display="none",t=null}e.style.display="",e.style.cursor="pointer",e.style.left="calc(50% - 50px)",e.style.width="100px",e.textContent="START AR",e.onmouseenter=function(){e.style.opacity="1.0"},e.onmouseleave=function(){e.style.opacity="0.5"},e.onclick=function(){t===null?navigator.xr.requestSession("immersive-ar",n).then(l):(t.end(),navigator.xr.offerSession!==void 0&&navigator.xr.offerSession("immersive-ar",n).then(l).catch(o=>{console.warn(o)}))},navigator.xr.offerSession!==void 0&&navigator.xr.offerSession("immersive-ar",n).then(l).catch(o=>{console.warn(o)})}function a(){e.style.display="",e.style.cursor="auto",e.style.left="calc(50% - 75px)",e.style.width="150px",e.onmouseenter=null,e.onmouseleave=null,e.onclick=null}function p(){a(),e.textContent="AR NOT SUPPORTED"}function y(t){a(),console.warn("Exception when trying to call xr.isSessionSupported",t),e.textContent="AR NOT ALLOWED"}function c(t){t.style.position="absolute",t.style.bottom="20px",t.style.padding="12px 6px",t.style.border="1px solid #fff",t.style.borderRadius="4px",t.style.background="rgba(0,0,0,0.1)",t.style.color="#fff",t.style.font="normal 13px sans-serif",t.style.textAlign="center",t.style.opacity="0.5",t.style.outline="none",t.style.zIndex="999"}if("xr"in navigator)return e.id="ARButton",e.style.display="none",c(e),navigator.xr.isSessionSupported("immersive-ar").then(function(t){t?u():p()}).catch(y),e;{const t=document.createElement("a");return window.isSecureContext===!1?(t.href=document.location.href.replace(/^http:/,"https:"),t.innerHTML="WEBXR NEEDS HTTPS"):(t.href="https://immersiveweb.dev/",t.innerHTML="WEBXR NOT AVAILABLE"),t.style.left="calc(50% - 90px)",t.style.width="180px",t.style.textDecoration="none",c(t),t}}}export{x as A};
