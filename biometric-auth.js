/* Device-unlock demonstration only. Production must register and verify passkeys
   on an authenticated server with server-issued, single-use challenges. */
const deviceAuth = {
  busy: false,
  sessionKey: 'bhe-preview-session',
  session() {
    try {
      const value=JSON.parse(localStorage.getItem(this.sessionKey)||sessionStorage.getItem(this.sessionKey)||'null');
      return value && Number.isFinite(value.expires) && value.expires>Date.now() ? value : null;
    } catch { return null; }
  },
  remember(persistent=true) {
    try {
      localStorage.removeItem(this.sessionKey);sessionStorage.removeItem(this.sessionKey);
      const value=JSON.stringify({expires:Date.now()+30*24*60*60*1000});
      (persistent?localStorage:sessionStorage).setItem(this.sessionKey,value);
      return true;
    } catch { notify('Your browser could not save sign-in. You may need to sign in again.');return false; }
  },
  forgetSession() {
    try {localStorage.removeItem(this.sessionKey);sessionStorage.removeItem(this.sessionKey);}catch {}
  },
  startPage() { return this.session() ? (this.read()?'Device unlock':'Home') : 'Welcome Intro'; },
  read() { try { return JSON.parse(localStorage.getItem('bhe-device-preview')); } catch { return null; } },
  save(value) { if(value) localStorage.setItem('bhe-device-preview',JSON.stringify(value)); else localStorage.removeItem('bhe-device-preview'); },
  icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M8 21v-8a5 5 0 0 1 5-5h8m22 0h8a5 5 0 0 1 5 5v8M8 43v8a5 5 0 0 0 5 5h8m22 0h8a5 5 0 0 0 5-5v-8M23 24v6m18-6v6m-9-4v12h-4m-8 5c6 7 18 7 24 0"/></svg>`,
  encode(buffer) { return btoa(String.fromCharCode(...new Uint8Array(buffer))); },
  decode(value) { return Uint8Array.from(atob(value),c=>c.charCodeAt(0)); },
  message(text) { const el=document.getElementById('device-status');if(el)el.textContent=text; },
  async run(setup) {
    if(this.busy)return;
    this.busy=true;
    const button=document.getElementById('device-action');if(button)button.disabled=true;
    this.message('Follow the verification prompt on your device…');
    try {
      if(!window.isSecureContext || !window.PublicKeyCredential || !await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())throw new Error('Device verification is unavailable here. Use your password instead.');
      const challenge=crypto.getRandomValues(new Uint8Array(32));
      if(setup){
        const credential=await navigator.credentials.create({publicKey:{challenge,rp:{name:'BHE Ambassador Preview'},user:{id:crypto.getRandomValues(new Uint8Array(32)),name:'alex.m@university.com',displayName:'Alex Mercer (preview)'},pubKeyCredParams:[{type:'public-key',alg:-7}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'},timeout:60000,attestation:'none'}});
        if(!credential)throw new Error('Setup did not finish. Please try again.');
        const key=credential.response.getPublicKey?.();
        if(!key)throw new Error('This browser cannot complete setup. Use your password instead.');
        this.save({id:this.encode(credential.rawId),key:this.encode(key)});
        go('Device ready');
      }else{
        const saved=this.read();if(!saved)throw new Error('Sign in with your password to set up device unlock first.');
        const credential=await navigator.credentials.get({publicKey:{challenge,allowCredentials:[{type:'public-key',id:this.decode(saved.id),transports:['internal']}],userVerification:'required',timeout:60000}});
        if(!credential || this.encode(credential.rawId)!==saved.id)throw new Error('Verification failed. Use your password instead.');
        const response=credential.response, client=JSON.parse(new TextDecoder().decode(response.clientDataJSON));
        const expected=this.encode(challenge).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
        const auth=new Uint8Array(response.authenticatorData);
        const rpHash=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(location.hostname)));
        if(client.type!=='webauthn.get'||client.challenge!==expected||client.origin!==location.origin||client.crossOrigin===true||auth.length<37||(auth[32]&5)!==5||!rpHash.every((v,i)=>auth[i]===v))throw new Error('Device response could not be verified.');
        const clientHash=new Uint8Array(await crypto.subtle.digest('SHA-256',response.clientDataJSON));
        const data=new Uint8Array(auth.length+clientHash.length);data.set(auth);data.set(clientHash,auth.length);
        // WebAuthn ECDSA signatures are DER; Web Crypto uses fixed-width r || s.
        const der=new Uint8Array(response.signature);let pos=2;
        if(der[0]!==48||der[1]>=128||der[pos++]!==2)throw new Error('Invalid device signature.');
        const r=der.slice(pos+1,pos+1+der[pos]);pos+=1+der[pos];
        if(der[pos++]!==2)throw new Error('Invalid device signature.');
        const s=der.slice(pos+1,pos+1+der[pos]);const signature=new Uint8Array(64);
        for(const [part,offset] of [[r,0],[s,32]]){const n=part[0]===0?part.slice(1):part;if(n.length>32)throw new Error('Invalid device signature.');signature.set(n,offset+32-n.length);}
        const key=await crypto.subtle.importKey('spki',this.decode(saved.key),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
        if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,signature,data))throw new Error('Device response could not be verified.');
        if(current!=='Device unlock')return;this.remember();go('Home');notify('Device verified — preview unlocked');
      }
    }catch(error){this.message(error.name==='NotAllowedError'?'Verification was cancelled or timed out. Try again or use your password.':error.name==='InvalidStateError'?'A passkey already exists. Use your password to continue.':error.message||'Unable to verify. Use your password instead.');}
    finally{this.busy=false;const action=document.getElementById('device-action');if(action)action.disabled=false;}
  },
  finishSignOut() {
    const forget=document.getElementById('forget-device')?.checked;
    try { if(forget)this.save(null);this.forgetSession(); }
    catch { notify('Unable to clear saved login. Please clear this site’s data in browser settings.');return; }
    history.replaceState(null,'',location.pathname+location.search+'#welcome');
    filter='All';go('Signed out');
  },
  instructions() { return `<ol class="device-steps"><li><b>Prepare your device</b><span>Enable Face ID or fingerprint in your device settings and set a screen lock.</span></li><li><b>Enable device unlock</b><span>Tap below, then approve your device’s passkey prompt.</span></li><li><b>Come back anytime</b><span>Keep saved login enabled. Next time, verify with your device instead of typing your password.</span></li></ol>`; },
  resultPage(ready) { return `<section class="ref-page device-page device-result"><img class="ref-auth-logo" src="assets/bhe-logo.png" alt="BHE UNI"><div class="device-art">${ready?this.icon:ri('lock')}</div><h2>${ready?'You’re all set':'You’re signed out'}</h2><p class="device-intro">${ready?'Device unlock is ready. Use Face ID, fingerprint or your device PIN when you return.':'Saved sign-in has been cleared from this browser.'}</p><p class="device-help" style="margin-top:20px">${ready?'You can manage device unlock anytime in Profile.':this.read()?'Device unlock is still available. Verify with your device to sign in again, or use your password.':'To return, sign in with your email and password. Any passkey saved by your device can be deleted in its password settings.'}</p><button type="button" class="ref-button" style="margin-top:28px" onclick="go('${ready?'Home':this.read()?'Device unlock':'Sign in'}')">${ready?'Continue to Home':this.read()?'Sign in with your device':'Back to sign in'}</button>${!ready&&this.read()?'<button class="device-text-button" onclick="go(\'Sign in\')">Use email &amp; password</button>':''}</section>`; },
  signOutPage() { return `<section class="ref-page device-page"><div class="device-art">${ri('lock')}</div><h2>Sign out of this app?</h2><p class="device-intro">Your saved sign-in will be cleared. You’ll need to verify again next time.</p><label class="ref-consent device-forget"><input id="forget-device" type="checkbox"><span><b>Forget this device too</b><br>Remove device unlock from this browser. Choose this on a shared device.</span></label><p class="device-help">This does not delete your account. To delete the passkey itself, use your device’s password or passkey settings.</p><button class="ref-button" style="margin-top:28px" onclick="deviceAuth.finishSignOut()">Sign out</button><button class="device-text-button" onclick="go('Profile')">Stay signed in</button></section>`; },
  completeLogin() { this.remember(document.getElementById('remember-login')?.checked ?? true);go(this.read()?'Home':'Device setup'); },
  settings() { return `<section class="ref-card device-settings"><h3>Quick &amp; secure access</h3><p>Use Face ID, fingerprint or your device PIN next time.</p><button type="button" class="ref-button muted" onclick="go('${this.read()?'Device unlock':'Device setup'}')">${this.read()?'Device unlock enabled':'Set up device unlock'}</button></section>`; },
  autoUnlock() {
    requestAnimationFrame(()=> { if(current==='Device unlock' && !this.busy)this.run(false); });
  },
  unlockPage() { return `<section class="ref-page device-page device-auto"><img class="ref-auth-logo" src="assets/bhe-logo.png" alt="BHE UNI"><div class="device-art">${this.icon}</div><h2>Unlocking your account</h2><p class="device-intro">Confirm with Face ID, fingerprint or your device PIN.</p><p id="device-status" role="status" aria-live="polite">Waiting for your device…</p><button id="device-action" type="button" class="ref-button" onclick="deviceAuth.run(false)">Try again</button><button type="button" class="device-text-button" onclick="go('Sign in')">Use email &amp; password</button></section>`; },
  page(setup) { if(!setup)return this.unlockPage();return `<section class="ref-page device-page device-setup"><img class="ref-auth-logo" src="assets/bhe-logo.png" alt="BHE UNI"><span class="device-eyebrow">YOUR ACCOUNT, ONE TOUCH AWAY</span><div class="device-art">${this.icon}<span>${ri('lock')}</span></div><h2>${setup?'A faster way to sign in':'Welcome back, Alex'}</h2><p class="device-intro">${setup?'Skip typing your password every time. Set up device unlock for your next visit.':'Unlock your ambassador account with your device.'}</p><div class="device-methods"><span>✓ Face ID</span><span>✓ Fingerprint</span></div><p class="device-help">Your device chooses Face ID, fingerprint or its screen lock. Your biometric data stays on your device.</p>${setup?'<details class="device-guide"><summary>How to set up device unlock</summary>'+this.instructions()+'</details>':''}<p id="device-status" role="status" aria-live="polite"></p><button type="button" id="device-action" class="ref-button" onclick="deviceAuth.run(${setup})">${setup?'Enable device unlock':'Unlock with your device'}</button><button type="button" class="device-text-button" onclick="go('${setup?'Home':'Sign in'}')">${setup?'Maybe later':'Use email & password'}</button><p class="device-preview">Preview only · Device verification does not create a server session.</p></section>`; }
};
