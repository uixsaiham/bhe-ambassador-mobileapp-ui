function fitPhonePreview(){
 const stage=document.querySelector('.stage');if(!stage)return;
 const bounds=stage.getBoundingClientRect();
 const availableHeight=Math.max(180,window.innerHeight-bounds.top-18);
 const availableWidth=Math.max(160,stage.clientWidth-14);
 const scale=Math.min(1,availableHeight/892,availableWidth/418);
 document.documentElement.style.setProperty('--phone-preview-scale',String(scale));
}
window.addEventListener('resize',fitPhonePreview);
window.addEventListener('load',fitPhonePreview);
requestAnimationFrame(fitPhonePreview);
