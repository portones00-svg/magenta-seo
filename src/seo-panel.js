// seo-panel.js — Panel de Diagnóstico y Estrategia SEO

function renderSidebar(active) {
  const items = [
    { id: 'diagnostico', icon: '\ud83d\udcca', label: 'Diagnóstico', href: '/seo' },
    { id: 'estrategia', icon: '\ud83c\udfaf', label: 'Estrategia', href: '/seo#estrategia' },
    { id: 'calendario', icon: '\ud83d\udcc5', label: 'Calendario', href: '/' },
  ];
  const linksHtml = items.map(it => {
    const isActive = active === it.id;
    return `<a class="nav-item${isActive ? ' active' : ''}" href="${it.href}" data-view="${it.id}">${it.icon} ${it.label}</a>`;
  }).join('\n    ');
  const publicacionActive = active === 'publicacion' || active === 'calendario';
  return `<div class="sidebar">
    <div class="sidebar-top">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1844.001526 294.947999" style="height:22px;width:auto;display:block" role="img" aria-label="_AgenteSEO">
<g transform="translate(-2.000000,296.820045) scale(0.100000,-0.100000)" fill="#1a1a1a" stroke="none">
<path d="M13280 2960 c-132 -17 -302 -77 -401 -141 -138 -90 -233 -209 -281
-354 -31 -95 -32 -290 -1 -377 66 -188 216 -317 480 -411 39 -14 154 -46 256
-72 288 -71 379 -105 446 -168 89 -85 82 -210 -19 -301 -75 -67 -170 -96 -320
-96 -241 0 -381 86 -430 265 l-17 60 -230 3 c-176 2 -233 -1 -241 -10 -14 -18
1 -156 27 -238 108 -342 497 -535 1011 -500 123 8 139 10 230 32 140 33 265
98 361 186 130 120 190 261 191 447 1 133 -12 194 -63 301 -93 196 -275 306
-669 404 -341 85 -389 102 -458 164 -100 90 -91 204 23 304 69 60 162 87 300
86 144 -1 206 -24 286 -103 45 -46 58 -67 73 -119 l17 -62 232 2 232 3 3 40
c9 105 -67 295 -159 398 -122 137 -302 223 -534 257 -79 11 -262 11 -345 0z
m425 -34 c251 -54 432 -183 532 -379 28 -56 63 -185 63 -234 l0 -33 -215 0
c-164 0 -216 3 -219 13 -2 6 -9 32 -16 56 -17 65 -93 140 -183 182 -69 32 -77
33 -192 34 -140 0 -217 -21 -306 -83 -92 -64 -133 -178 -95 -265 41 -95 157
-154 451 -227 264 -66 352 -93 439 -137 184 -92 301 -229 341 -398 19 -78 19
-245 0 -315 -55 -206 -216 -371 -436 -444 -223 -73 -575 -77 -814 -7 -91 27
-218 90 -275 137 -136 113 -226 282 -237 447 l-6 77 222 0 c213 0 221 -1 221
-20 0 -42 45 -136 86 -180 84 -89 199 -130 371 -130 164 0 281 38 360 116 46
46 63 91 63 166 0 153 -126 233 -500 319 -204 46 -364 101 -460 156 -209 121
-304 277 -304 498 0 107 17 181 61 270 106 212 349 360 653 399 67 8 325 -4
395 -18z"/>
<path d="M17185 2961 c-257 -42 -479 -161 -630 -338 -128 -150 -208 -318 -250
-526 -21 -105 -25 -152 -25 -298 0 -230 18 -338 87 -514 124 -317 380 -548
698 -631 123 -32 359 -44 483 -25 449 71 758 360 871 816 77 312 44 675 -85
944 -84 177 -196 307 -350 408 -176 115 -337 162 -584 168 -91 2 -187 0 -215
-4z m426 -35 c468 -93 770 -460 821 -999 35 -376 -79 -746 -305 -984 -190
-200 -449 -303 -757 -303 -294 1 -526 85 -713 260 -99 93 -165 181 -226 305
-102 207 -126 317 -126 590 0 221 13 308 67 463 95 272 302 504 538 603 73 31
208 68 290 80 80 11 323 3 411 -15z"/>
<path d="M17285 2540 c-233 -32 -426 -216 -490 -465 -58 -226 -31 -555 60
-735 29 -56 111 -154 161 -190 113 -84 205 -113 354 -113 129 1 199 20 306 84
125 75 232 236 271 404 26 115 26 438 -1 545 -68 278 -266 456 -526 473 -41 3
-102 2 -135 -3z m240 -34 c105 -28 219 -103 278 -183 96 -131 135 -259 144
-473 11 -275 -39 -457 -171 -614 -50 -60 -151 -127 -234 -155 -76 -26 -259
-29 -335 -6 -188 57 -322 209 -389 440 -21 72 -23 100 -22 285 0 197 1 208 28
290 73 220 210 365 394 415 63 17 244 18 307 1z"/>
<path d="M2984 2932 l-101 -3 -42 -112 c-53 -139 -69 -183 -121 -327 -23 -63
-50 -137 -60 -165 -19 -49 -117 -321 -190 -525 -21 -58 -61 -168 -90 -245 -28
-77 -86 -232 -127 -345 -41 -113 -91 -248 -110 -300 -48 -129 -84 -243 -78
-248 8 -8 451 -15 488 -8 33 6 37 11 55 69 38 118 134 392 145 412 5 11 15 23
21 27 6 4 187 8 402 8 343 0 393 -2 405 -16 7 -8 39 -93 72 -187 32 -95 69
-201 81 -237 18 -50 28 -66 47 -71 37 -11 487 -10 493 0 9 13 -73 252 -306
901 -38 107 -92 257 -119 333 -125 350 -153 427 -179 502 -16 44 -51 143 -78
220 -28 77 -63 176 -78 220 -15 44 -34 86 -43 93 -16 13 -141 14 -487 4z m209
-574 c47 -127 257 -783 253 -793 -8 -21 -518 -22 -534 -2 -8 10 21 110 116
393 71 208 131 387 135 397 7 20 23 22 30 5z"/>
<path d="M14541 2930 c-18 -10 -16 -2261 2 -2272 7 -4 359 -8 783 -8 683 0
773 2 784 15 10 12 12 57 7 196 -4 99 -9 184 -12 189 -4 6 -205 10 -524 10
-389 0 -520 3 -529 12 -14 14 -17 503 -3 512 4 3 215 6 468 6 253 1 470 4 482
7 21 5 21 9 21 204 l0 199 -478 0 c-358 0 -481 3 -490 12 -17 17 -17 479 0
496 9 9 141 12 534 12 504 0 522 1 527 19 10 39 -4 385 -16 393 -15 10 -1540
8 -1556 -2z m1497 -19 l52 -1 0 -185 0 -185 -516 0 c-336 0 -522 -4 -535 -10
-18 -10 -19 -24 -19 -265 0 -251 0 -254 22 -269 20 -14 83 -16 490 -16 l468 0
0 -180 0 -180 -62 0 c-35 0 -240 0 -455 0 -324 0 -399 -2 -428 -14 l-35 -15 0
-260 c0 -257 0 -260 22 -275 20 -14 87 -16 535 -16 l513 0 0 -185 0 -185 -767
2 -768 3 -3 1117 -2 1118 182 2 c171 3 1189 2 1306 -1z"/>
<path d="M9933 2773 c-23 -4 -23 -6 -23 -191 0 -103 -5 -194 -10 -202 -7 -11
-37 -16 -122 -20 l-113 -5 0 -175 0 -175 115 -5 115 -5 7 -65 c4 -36 4 -229 1
-430 -7 -432 0 -516 53 -627 52 -109 124 -166 270 -215 61 -20 88 -23 224 -22
110 0 172 5 213 16 33 9 60 18 62 20 2 2 -10 81 -28 175 l-31 171 -90 -5 c-84
-5 -94 -3 -126 19 -71 48 -70 43 -70 519 0 352 2 429 14 438 9 7 63 12 147 13
74 0 142 5 152 10 15 8 17 27 17 178 l0 170 -154 0 c-113 0 -157 3 -163 13 -4
6 -10 100 -13 207 l-5 195 -210 1 c-115 1 -220 -1 -232 -3z"/>
<path d="M4895 2380 c-141 -20 -251 -77 -361 -185 -113 -111 -179 -234 -221
-407 -28 -114 -25 -443 5 -556 93 -357 362 -556 726 -539 81 3 127 11 171 27
107 41 156 79 253 194 39 46 44 24 41 -161 -4 -160 -5 -171 -32 -225 -55 -112
-139 -160 -291 -166 -188 -8 -311 44 -401 171 l-20 29 -202 -67 c-148 -48
-203 -71 -203 -82 0 -30 62 -123 119 -180 63 -63 195 -139 291 -168 155 -46
437 -61 606 -31 312 55 515 215 591 466 15 49 17 152 20 958 l4 902 -236 0
-235 0 0 -109 c0 -119 -10 -142 -42 -100 -95 122 -159 172 -265 208 -69 23
-229 34 -318 21z m412 -411 c105 -50 170 -148 198 -293 52 -269 -47 -527 -228
-595 -122 -45 -269 -21 -361 60 -178 157 -182 592 -8 762 114 110 259 134 399
66z"/>
<path d="M6890 2384 c-149 -16 -238 -43 -358 -110 -80 -44 -212 -174 -261
-258 -179 -303 -171 -794 18 -1063 103 -147 263 -256 446 -305 110 -29 379
-32 505 -5 265 57 456 217 521 435 16 54 12 57 -79 66 -151 14 -259 26 -294
32 -35 5 -38 4 -57 -33 -30 -60 -96 -120 -159 -144 -46 -18 -77 -23 -162 -22
-91 0 -112 3 -162 26 -75 33 -123 71 -157 121 -42 60 -73 154 -69 207 l3 44
584 3 583 2 -5 183 c-4 154 -9 195 -29 268 -98 338 -359 536 -728 552 -58 3
-121 3 -140 1z m264 -393 c78 -38 137 -101 166 -177 27 -74 27 -112 -2 -119
-13 -3 -171 -4 -353 -3 l-330 3 1 40 c2 88 94 214 191 260 60 29 92 34 180 31
68 -2 92 -8 147 -35z"/>
<path d="M8880 2384 c-199 -32 -337 -115 -415 -249 -15 -25 -32 -44 -39 -42
-7 2 -12 49 -14 136 l-3 131 -232 -2 -232 -3 -3 -846 -2 -847 22 -6 c13 -3
118 -6 234 -6 163 0 214 3 222 13 8 9 12 181 14 548 3 533 3 534 26 585 29 64
102 136 167 166 41 19 67 23 145 23 86 0 100 -3 149 -30 66 -37 112 -89 137
-158 18 -48 19 -89 21 -592 l2 -540 88 -6 c117 -9 357 -11 377 -3 14 6 16 65
16 564 0 559 -5 656 -37 770 -52 184 -180 313 -361 366 -74 21 -230 37 -282
28z"/>
<path d="M11485 2381 c-305 -40 -535 -216 -650 -499 -71 -176 -84 -458 -30
-666 39 -149 100 -260 200 -362 153 -156 363 -234 632 -234 341 0 599 132 714
364 22 45 41 98 42 117 l2 34 -60 6 c-33 4 -112 12 -175 18 -63 6 -129 14
-147 17 -29 6 -33 3 -53 -35 -30 -60 -93 -117 -158 -143 -47 -18 -76 -22 -162
-22 -96 1 -111 3 -172 31 -76 36 -143 97 -175 164 -30 61 -55 180 -41 196 8
10 135 13 590 13 l580 0 -5 178 c-6 204 -23 287 -87 417 -96 197 -267 331
-485 384 -91 23 -271 33 -360 22z m286 -383 c31 -14 74 -42 96 -61 52 -48 97
-137 97 -196 l1 -46 -350 0 -350 0 -3 26 c-9 77 90 221 184 268 68 34 99 40
189 37 61 -2 94 -8 136 -28z"/>
<path d="M33 703 c-10 -3 -13 -48 -13 -174 l0 -169 763 2 762 3 0 170 0 170
-750 2 c-412 1 -756 -1 -762 -4z m1497 -170 l0 -153 -745 0 -745 0 0 150 0
149 133 3 c72 2 408 3 744 3 l613 0 0 -152z"/>
</g>
<g transform="translate(-4.000000,294.665214) scale(0.100000,-0.100000)" fill="#e8791a" stroke="none">
<path d="M13310 2944 c-304 -39 -547 -187 -653 -399 -44 -89 -61 -163 -61
-270 0 -221 95 -377 304 -498 96 -55 256 -110 460 -156 374 -86 500 -166 500
-319 0 -75 -17 -120 -63 -166 -79 -78 -196 -116 -360 -116 -172 0 -287 41
-371 130 -41 44 -86 138 -86 180 0 19 -8 20 -221 20 l-222 0 6 -77 c3 -43 13
-100 22 -128 93 -276 305 -436 650 -490 122 -20 376 -19 489 1 321 56 533 226
601 484 19 70 19 237 0 315 -40 169 -157 306 -341 398 -87 44 -175 71 -439
137 -294 73 -410 132 -451 227 -38 87 3 201 95 265 89 62 166 83 306 83 115
-1 123 -2 192 -34 90 -42 166 -117 183 -182 7 -24 14 -50 16 -56 3 -10 55 -13
219 -13 l215 0 0 33 c0 49 -35 178 -63 234 -100 196 -281 325 -532 379 -70 14
-328 26 -395 18z"/>
<path d="M17200 2941 c-82 -12 -217 -49 -290 -80 -236 -99 -443 -331 -538
-603 -54 -155 -67 -242 -67 -463 0 -273 24 -383 126 -590 182 -368 509 -564
939 -565 308 0 567 103 757 303 176 186 274 421 304 729 30 301 -43 618 -194
842 -143 214 -366 360 -626 412 -88 18 -331 26 -411 15z m362 -426 c150 -51
261 -149 326 -287 65 -136 77 -203 77 -428 0 -229 -14 -309 -76 -437 -71 -144
-181 -243 -337 -301 -57 -21 -85 -25 -182 -25 -149 0 -241 29 -354 113 -50 36
-132 134 -161 190 -70 138 -104 363 -86 562 13 141 31 211 80 313 126 266 435
396 713 300z"/>
<path d="M14732 2912 l-182 -2 2 -1118 3 -1117 768 -3 767 -2 0 185 0 185
-513 0 c-448 0 -515 2 -535 16 -22 15 -22 18 -22 275 l0 260 35 15 c29 12 104
14 428 14 215 0 420 0 455 0 l62 0 0 180 0 180 -468 0 c-407 0 -470 2 -490 16
-22 15 -22 18 -22 269 0 241 1 255 19 265 13 6 199 10 535 10 l516 0 0 185 0
185 -52 1 c-117 3 -1135 4 -1306 1z"/>
<path d="M173 682 l-133 -3 0 -149 0 -150 745 0 745 0 0 153 0 152 -613 0
c-336 0 -672 -1 -744 -3z"/>
</g>
</svg>
      <h1 class="sr-only">_AgenteSEO</h1>
      <button class="sidebar-toggle" onclick="document.querySelector('.sidebar').classList.toggle('mobile-open')" aria-label="Abrir menú">\u2630</button>
    </div>
    <div class="sidebar-nav">
      ${linksHtml}
      <a class="nav-item${publicacionActive ? ' active' : ''}" href="/#cola" data-view="publicacion">\ud83d\udce4 Publicación</a>
      <div style="padding:14px 20px 0">
        <a href="/terminos-datos" target="_blank" style="font-size:11px;color:#999">Términos y condiciones de datos</a>
      </div>
      <div style="margin-top:auto;padding:20px">
        <a href="/logout" title="Cerrar sesión" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#f45c5c,#e02424);text-decoration:none;box-shadow:0 2px 6px rgba(224,36,36,0.35)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
          </svg>
        </a>
      </div>
    </div>
  </div>`;
}

function renderSeoPanel() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>_AgenteSEO — Diagnóstico</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Poppins",sans-serif;background:#f5f5f5;color:#1a1a1a}
    a{color:#216416}
    .layout{display:flex;min-height:100vh}
    .sidebar{width:220px;background:#fff;border-right:1px solid #e5e5e5;padding:20px 0;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;display:flex;flex-direction:column}
    .sidebar h1{font-size:16px;font-weight:600;color:#216416;padding:0 20px 20px}
    .nav-item{display:flex;align-items:center;gap:10px;padding:12px 20px;font-size:13px;color:#666;cursor:pointer;border-left:3px solid transparent}
    .nav-item:hover{background:#f5f5f5}
    .nav-item.active{background:#eef6ec;color:#216416;font-weight:500;border-left-color:#216416}
    .nav-item.disabled{opacity:0.4;cursor:not-allowed}
    .main{flex:1;padding:24px 32px;max-width:1200px}
    .sub{font-size:13px;color:#666;margin-bottom:20px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
    .metric{background:#fff;border-radius:10px;border:1px solid #e5e5e5;padding:16px;text-align:center}
    .metric-val{font-size:28px;font-weight:600;color:#216416}
    .metric-lab{font-size:12px;color:#999;margin-top:2px}
    .card{background:#fff;border-radius:12px;border:1px solid #e5e5e5;padding:20px;margin-bottom:16px}
    .card-title{font-size:15px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
    .btn{padding:10px 20px;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:Poppins,sans-serif}
    .btn-primary{background:#216416;color:#fff}
    .btn-primary:hover{background:#1a5212}
    .btn-secondary{background:#f5f5f5;color:#444;border:1px solid #ddd}
    .btn-secondary:hover{background:#e8e8e8}
    .btn-sm{padding:6px 12px;font-size:12px}
    .btn:disabled{opacity:0.5;cursor:not-allowed}
    select,input{padding:9px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;font-family:Poppins,sans-serif;outline:none}
    select:focus,input:focus{border-color:#216416}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:8px;color:#999;font-weight:400;font-size:12px;border-bottom:1px solid #eee;cursor:pointer;user-select:none;white-space:nowrap}
    th:hover{color:#216416}
    th.sorted{color:#216416;font-weight:500}
    td{padding:8px;border-bottom:1px solid #eee;vertical-align:top}
    .badge{display:inline-block;font-size:11px;padding:2px 8px;border-radius:99px;font-weight:500}
    .badge-ok{background:#e1f5ee;color:#0f6e56}
    .badge-warn{background:#faeeda;color:#854f0b}
    .badge-bad{background:#faece7;color:#993c1d}
    .delta-up{color:#0f6e56;font-weight:500}
    .delta-down{color:#993c1d;font-weight:500}
    .delta-flat{color:#999}
    .filters-row{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
    .filters-row input, .filters-row select{margin-bottom:0}
    .table-wrap{max-height:600px;overflow-y:auto}
    .table-wrap table{position:relative}
    .table-wrap thead{position:sticky;top:0;background:#fff;z-index:1}
    .loading{text-align:center;padding:40px;color:#999;font-size:13px}
    .empty{text-align:center;padding:40px;color:#999;font-size:13px}
    .step{display:none}
    .step.active{display:block}
    .step-dots{display:flex;gap:6px;margin-bottom:20px}
    .step-dot{width:8px;height:8px;border-radius:50%;background:#ddd}
    .step-dot.active{background:#216416}
    .step-dot.done{background:#8fbf86}
    .kw-pick{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #eee;border-radius:8px;margin-bottom:8px;cursor:pointer}
    .kw-pick:hover{border-color:#216416}
    .kw-pick.selected{background:#eef6ec;border-color:#216416}
    .kw-pick input{margin:0}
    .kw-pick .kw-info{flex:1}
    .kw-pick .kw-name{font-size:13px;font-weight:500}
    .kw-pick .kw-meta{font-size:11px;color:#999}
    .plan-summary{background:#eef6ec;border-radius:10px;padding:16px;margin-bottom:16px}
    .plan-summary h3{font-size:14px;color:#216416;margin-bottom:8px}
    .chip{display:inline-block;background:#fff;border:1px solid #cde3c6;color:#216416;font-size:12px;padding:4px 10px;border-radius:99px;margin:2px}
    .status-bar{padding:10px 14px;border-radius:8px;font-size:13px;margin-top:10px;display:none}
    .status-ok{background:#e1f5ee;color:#0f6e56}
    .status-error{background:#faece7;color:#993c1d}
    .modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100;align-items:center;justify-content:center}
    .modal.open{display:flex}
    .modal-box{background:#fff;border-radius:12px;padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto}
    .modal-title{font-size:16px;font-weight:600;margin-bottom:16px}

    .sidebar-toggle{display:none}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media (max-width:768px){
      .layout{flex-direction:column}
      .sidebar{width:100%;height:auto;position:relative;top:auto;flex-direction:column;padding:0;overflow:visible}
      .sidebar-top{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;width:100%}
      .sidebar-top h1{padding:0;font-size:15px}
      .sidebar-toggle{display:block;background:none;border:none;font-size:22px;line-height:1;cursor:pointer;color:#216416;padding:4px 8px}
      .sidebar-nav{display:none;flex-direction:column;width:100%;border-top:1px solid #eee}
      .sidebar.mobile-open .sidebar-nav{display:flex}
      .nav-item{padding:12px 16px;border-left:none;border-bottom:1px solid #f0f0f0;white-space:nowrap}
      .nav-item.active{border-left-color:transparent}
      .main{padding:16px;max-width:100%}
      .grid3{grid-template-columns:1fr}
      .grid2{grid-template-columns:1fr}
      .filters-row{flex-direction:column;align-items:stretch}
      .filters-row input,.filters-row select{width:100%;margin-left:0!important}
      input[style*="width"],select[style*="width"]{width:100%!important}
      .card{padding:14px;overflow-x:auto}
      table{min-width:560px}
      .cal-nav{flex-wrap:wrap;gap:8px}
      .cal-title{font-size:14px}
      .modal-box{padding:16px;width:94%}
    }
  </style>
</head>
<body>
<div class="layout">
  ${renderSidebar('diagnostico')}

  <div class="main">

    <!-- ═══════════════ VISTA: DIAGNÓSTICO ═══════════════ -->
    <div id="view-diagnostico" class="view">
      <div class="card-title" style="margin-bottom:4px">Diagnóstico SEO</div>
      <div class="sub">Todas las keywords que compites, comparadas en el tiempo</div>

      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" id="tabKeywords" onclick="mostrarTabDiag('keywords')">Keywords</button>
        <button class="btn btn-secondary btn-sm" id="tabPaginas" onclick="mostrarTabDiag('paginas')">Páginas</button>
      </div>

      <div class="filters-row">
        <span style="font-size:12px;color:#666">Comparar:</span>
        <select id="rangoComparar">
          <option value="30">Últimos 30 días</option>
          <option value="60">Últimos 60 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="custom">Fechas personalizadas</option>
        </select>
        <span id="customFechas" style="display:none;gap:8px;align-items:center">
          <input type="date" id="fechaDesdeA" style="width:135px">
          <span style="font-size:12px;color:#999">vs</span>
          <input type="date" id="fechaDesdeB" style="width:135px">
        </span>
        <button class="btn btn-primary btn-sm" id="btnCargarDiag">Actualizar</button>
        <input type="text" id="buscarKw" placeholder="Buscar keyword..." style="margin-left:auto;width:220px">
      </div>

      <div id="diagResumen" class="grid3"></div>
      <p style="font-size:11px;color:#999;font-style:italic;margin:-12px 0 20px">Los números pueden variar levemente respecto a Search Console: Google sigue completando datos de los últimos 1-2 días con retraso, así que las cifras más recientes suben con el tiempo.</p>

      <div class="card" id="seccionKeywords">
        <div class="card-title">
          <span>Todas las keywords (<span id="totalKwCount">0</span>)</span>
          <span style="font-size:12px;color:#999;font-weight:400">Click en columna para ordenar</span>
        </div>
        <div class="table-wrap">
          <table id="tablaKw">
            <thead>
              <tr>
                <th data-sort="keyword">Keyword</th>
                <th data-sort="posicion">Posición</th>
                <th data-sort="clics">Clics</th>
                <th data-sort="impresiones">Impresiones</th>
                <th data-sort="ctr">CTR</th>
                <th data-sort="delta">Cambio</th>
              </tr>
            </thead>
            <tbody id="tablaKwBody">
              <tr><td colspan="6" class="loading">Cargando keywords…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" id="seccionPaginas" style="display:none">
        <div class="card-title">
          <span>Todas las páginas (<span id="totalPagCount">0</span>)</span>
          <input type="text" id="buscarPag" placeholder="Buscar página..." style="width:220px;margin-bottom:0">
        </div>
        <div class="table-wrap">
          <table id="tablaPag">
            <thead>
              <tr>
                <th data-sortpag="pagina">Página</th>
                <th data-sortpag="posicion">Posición</th>
                <th data-sortpag="clics">Clics</th>
                <th data-sortpag="impresiones">Impresiones</th>
                <th data-sortpag="ctr">CTR</th>
                <th data-sortpag="potencial">Potencial \ud83d\udd25</th>
                <th data-sortpag="intencion">Intención</th>
              </tr>
            </thead>
            <tbody id="tablaPagBody">
              <tr><td colspan="7" class="loading">Cargando páginas…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════ VISTA: ESTRATEGIA ══════════════ -->
    <div id="view-estrategia" class="view" style="display:none">
      <div class="card-title" style="margin-bottom:4px">Estrategia del mes</div>
      <div class="sub">Plan de contenido generado automáticamente — sin selección manual</div>

      <div id="planGuardadoBox"></div>

      <div class="card">
        <div class="card-title">⚡ Arreglos rápidos de título/meta</div>
        <div class="sub">Páginas que ya rankean bien pero pierden clics por un título poco atractivo — se arreglan hoy, sin esperar contenido nuevo.</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Página</th>
                <th>Posición</th>
                <th>CTR actual</th>
                <th>Potencial si se arregla</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="arreglosRapidosBody">
              <tr><td colspan="5" class="loading">Cargando…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Plan automático (<span id="planAutoCount">0</span> artículos)</span>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <input type="text" id="prioridadesInput" placeholder="¿Algo que priorizar este mes? Ej: Vitacura, Lo Barnechea, La Dehesa" style="flex:1;margin-bottom:0">
          <button class="btn btn-primary btn-sm" id="btnAplicarPrioridades">Aplicar y regenerar</button>
        </div>
        <div class="sub">Cruza tus keywords sugeridas con las páginas comerciales de más potencial — cada artículo ya trae asignado a qué página enlazar internamente.</div>

        <div id="metaEstrategia" style="margin-bottom:20px"></div>
        <div id="planExplicacion" style="margin-bottom:20px"></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tema del artículo</th>
                <th>Marca</th>
                <th>Enlazar internamente a</th>
              </tr>
            </thead>
            <tbody id="planAutoBody">
              <tr><td colspan="4" class="loading">Generando plan…</td></tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:16px;display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="btnGuardarPlanAuto">Guardar plan del mes</button>
        </div>
        <div id="estrategiaStatus" class="status-bar"></div>
      </div>

      <div class="card">
        <div class="card-title">📊 Historial de estrategias guardadas</div>
        <div class="sub">Cada vez que guardas un plan queda una foto de línea base — vuelve en 30/60/90 días a auditar si se cumplió la meta.</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Guardado el</th>
                <th>Artículos</th>
                <th>Meta 30 días</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="historialEstrategiaBody">
              <tr><td colspan="4" class="loading">Cargando…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</div>

<div class="modal" id="modalPagKw">
  <div class="modal-box">
    <div class="modal-title" id="modalPagKwTitle">Keywords de esta página</div>
    <div id="modalPagKwBody" style="max-height:400px;overflow-y:auto"></div>
    <button class="btn btn-secondary" onclick="cerrarModalPagKw()" style="width:100%;margin-top:12px">Cerrar</button>
  </div>
</div>

<div class="modal" id="modalAuditoria">
  <div class="modal-box" style="max-width:650px">
    <div class="modal-title">Auditoría: proyectado vs. real</div>
    <div id="modalAuditoriaBody"></div>
    <button class="btn btn-secondary" onclick="cerrarModalAuditoria()" style="width:100%;margin-top:12px">Cerrar</button>
  </div>
</div>

<div class="modal" id="modalConfirmar" style="z-index:200">
  <div class="modal-box" style="max-width:420px;text-align:center">
    <div style="font-size:32px;margin-bottom:12px">⚠️</div>
    <div class="modal-title" style="text-align:center" id="modalConfirmarTitulo">Confirmar acción</div>
    <p id="modalConfirmarMensaje" style="font-size:13px;color:#666;line-height:1.6;margin-bottom:20px"></p>
    <div style="display:flex;gap:10px">
      <button class="btn btn-secondary" id="btnConfirmarCancelar" style="flex:1">Cancelar</button>
      <button class="btn btn-primary" id="btnConfirmarAceptar" style="flex:1">Confirmar</button>
    </div>
  </div>
</div>

<div class="modal" id="modalSugerencia">
  <div class="modal-box" style="max-width:600px">
    <div class="modal-title">Propuesta de título/meta (sin aplicar todavía)</div>
    <div id="modalSugerenciaBody"></div>
    <button class="btn btn-secondary" onclick="cerrarModalSugerencia()" style="width:100%;margin-top:12px">Cerrar</button>
  </div>
</div>

<script>
// ─── Navegación sidebar ───────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener('click', (e) => {
    const target = item.dataset.view;
    if (!document.getElementById('view-' + target)) return;
    e.preventDefault();
    document.querySelectorAll('.nav-item[data-view]').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + target).style.display = 'block';
    if (target === 'diagnostico' && !window.__diagCargado) cargarDiagnostico();
    if (target === 'estrategia' && !window.__estrategiaCargada) cargarEstrategia();
  });
});

if (window.location.hash === '#estrategia') {
  const estrategiaTab = document.querySelector('.nav-item[data-view="estrategia"]');
  if (estrategiaTab) estrategiaTab.click();
}

// ─── Helper: detecta sesion de Google vencida y redirige a login ────────
async function fetchGSC(url, opts) {
  const res = await fetch(url, opts).then(r => r.json());
  if (!res.ok && res.error && /token|invalid_grant|unauthorized|unauthenticated/i.test(res.error)) {
    window.location.href = '/auth/google';
    return new Promise(() => {});
  }
  return res;
}

function confirmarAccion(mensaje, titulo) {
  return new Promise((resolve) => {
    document.getElementById('modalConfirmarTitulo').textContent = titulo || 'Confirmar acción';
    document.getElementById('modalConfirmarMensaje').textContent = mensaje;
    document.getElementById('modalConfirmar').classList.add('open');

    const btnCancelar = document.getElementById('btnConfirmarCancelar');
    const btnAceptar = document.getElementById('btnConfirmarAceptar');

    function limpiar(resultado) {
      document.getElementById('modalConfirmar').classList.remove('open');
      btnCancelar.removeEventListener('click', onCancelar);
      btnAceptar.removeEventListener('click', onAceptar);
      resolve(resultado);
    }
    function onCancelar() { limpiar(false); }
    function onAceptar() { limpiar(true); }

    btnCancelar.addEventListener('click', onCancelar);
    btnAceptar.addEventListener('click', onAceptar);
  });
}

// ─── DIAGNÓSTICO ───────────────────────────────────────────────────────
let kwData = [];
let sortField = 'impresiones';
let sortDir = -1;

document.getElementById('rangoComparar').addEventListener('change', (e) => {
  document.getElementById('customFechas').style.display = e.target.value === 'custom' ? 'flex' : 'none';
});
document.getElementById('btnCargarDiag').addEventListener('click', cargarDiagnostico);
document.getElementById('buscarKw').addEventListener('input', renderTablaKw);

async function cargarDiagnostico() {
  window.__diagCargado = true;
  document.getElementById('tablaKwBody').innerHTML = '<tr><td colspan="6" class="loading">Cargando keywords…</td></tr>';

  try {
    const rango = document.getElementById('rangoComparar').value;
    const diasParam = (rango !== 'custom') ? rango : '28';

    const [resumenRes, kwRes] = await Promise.all([
      fetchGSC('/seo/data?dias=' + diasParam),
      fetchGSC('/seo/keywords?dias=' + diasParam)
    ]);

    if (resumenRes.ok) {
      const d = resumenRes.data;
      document.getElementById('diagResumen').innerHTML = \`
        <div class="metric"><div class="metric-val">\${d.resumen.totalClics}</div><div class="metric-lab">Clics (\${d.resumen.dias}d)</div></div>
        <div class="metric"><div class="metric-val">\${d.resumen.totalImpresiones}</div><div class="metric-lab">Impresiones</div></div>
        <div class="metric"><div class="metric-val">\${d.resumen.posPromedio}</div><div class="metric-lab">Posición promedio</div></div>
      \`;
    }

    let deltaMap = {};
    if (rango !== 'custom') {
      const comp = await fetchGSC('/seo/comparativa');
      if (comp.ok) {
        const campo = 'delta' + rango;
        comp.data.forEach(r => { deltaMap[r.keyword] = r[campo]; });
      }
    } else {
      const desdeA = document.getElementById('fechaDesdeA').value;
      const desdeB = document.getElementById('fechaDesdeB').value;
      if (desdeA && desdeB) {
        const hoy = new Date().toISOString().split('T')[0];
        const comp = await fetchGSC(\`/seo/comparativa-custom?desdeA=\${desdeA}&hastaA=\${hoy}&desdeB=\${desdeB}&hastaB=\${hoy}\`);
        if (comp.ok) comp.data.forEach(r => { deltaMap[r.keyword] = r.delta; });
      }
    }

    if (kwRes.ok) {
      kwData = kwRes.data.map(r => ({ ...r, delta: deltaMap[r.keyword] ?? null }));
      renderTablaKw();
    } else {
      document.getElementById('tablaKwBody').innerHTML = '<tr><td colspan="6" class="empty">' + (kwRes.error || 'Error cargando datos') + '</td></tr>';
    }
  } catch(e) {
    document.getElementById('tablaKwBody').innerHTML = '<tr><td colspan="6" class="empty">Error: ' + e.message + '</td></tr>';
  }
}

document.querySelectorAll('#tablaKw th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    if (sortField === field) { sortDir *= -1; } else { sortField = field; sortDir = -1; }
    document.querySelectorAll('#tablaKw th').forEach(t => t.classList.remove('sorted'));
    th.classList.add('sorted');
    renderTablaKw();
  });
});

function renderTablaKw() {
  const busqueda = document.getElementById('buscarKw').value.toLowerCase();
  let filtrado = kwData.filter(r => r.keyword.toLowerCase().includes(busqueda));

  filtrado.sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (va === null || va === undefined) va = sortField === 'posicion' ? 999 : -Infinity;
    if (vb === null || vb === undefined) vb = sortField === 'posicion' ? 999 : -Infinity;
    if (typeof va === 'string') return va.localeCompare(vb) * sortDir;
    return (va - vb) * sortDir;
  });

  document.getElementById('totalKwCount').textContent = filtrado.length;

  if (filtrado.length === 0) {
    document.getElementById('tablaKwBody').innerHTML = '<tr><td colspan="6" class="empty">Sin resultados</td></tr>';
    return;
  }

  document.getElementById('tablaKwBody').innerHTML = filtrado.map(r => {
    let deltaHtml = '<span class="delta-flat">—</span>';
    if (r.delta !== null && r.delta !== undefined) {
      if (r.delta > 0.3) deltaHtml = \`<span class="delta-up">▲ \${r.delta}</span>\`;
      else if (r.delta < -0.3) deltaHtml = \`<span class="delta-down">▼ \${Math.abs(r.delta)}</span>\`;
      else deltaHtml = '<span class="delta-flat">≈ sin cambio</span>';
    }
    let posBadge = 'badge-bad';
    if (r.posicion <= 3) posBadge = 'badge-ok';
    else if (r.posicion <= 10) posBadge = 'badge-warn';
    return \`<tr>
      <td>\${r.keyword}</td>
      <td><span class="badge \${posBadge}">\${r.posicion}</span></td>
      <td>\${r.clics}</td>
      <td>\${r.impresiones}</td>
      <td>\${r.ctr}%</td>
      <td>\${deltaHtml}</td>
    </tr>\`;
  }).join('');
}

function mostrarTabDiag(tab) {
  const btnKw = document.getElementById('tabKeywords');
  const btnPag = document.getElementById('tabPaginas');
  const secKw = document.getElementById('seccionKeywords');
  const secPag = document.getElementById('seccionPaginas');
  if (tab === 'keywords') {
    btnKw.className = 'btn btn-primary btn-sm';
    btnPag.className = 'btn btn-secondary btn-sm';
    secKw.style.display = 'block';
    secPag.style.display = 'none';
  } else {
    btnKw.className = 'btn btn-secondary btn-sm';
    btnPag.className = 'btn btn-primary btn-sm';
    secKw.style.display = 'none';
    secPag.style.display = 'block';
    if (!window.__pagCargado) cargarPaginas();
  }
}

let pagData = [];
let sortFieldPag = 'potencial';
let sortDirPag = -1;

function clasificarIntencion(pagina) {
  const p = pagina.toLowerCase();
  const informativas = ['falla', 'codigo-de-error', 'como-resetear', 'como-elegir', 'guia-rapida', 'manual', 'significado', 'capacitacion', 'que-hacer-si'];
  const comerciales = ['a-domicilio', 'reparacion', 'instalacion', 'servicio-tecnico', 'mantencion', 'urgente', 'cotiza', 'precio', 'venta'];
  if (informativas.some(k => p.includes(k))) return 'informativa';
  if (comerciales.some(k => p.includes(k))) return 'comercial';
  return 'comercial';
}

async function cargarPaginas() {
  window.__pagCargado = true;
  document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="7" class="loading">Cargando páginas…</td></tr>';
  try {
    const dias = document.getElementById('rangoComparar').value;
    const diasParam = (dias !== 'custom') ? dias : '28';
    const res = await fetchGSC('/seo/paginas?dias=' + diasParam);
    if (res.ok) {
      pagData = res.data.map(r => {
        const ctrActual = r.ctr / 100;
        const potencial = Math.max(0, Math.round(r.impresiones * (0.28 - ctrActual)));
        const intencion = clasificarIntencion(r.pagina);
        return { ...r, potencial, intencion };
      });
      renderTablaPag();
    } else {
      document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="7" class="empty">' + (res.error || 'Error cargando datos') + '</td></tr>';
    }
  } catch(e) {
    document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="7" class="empty">Error: ' + e.message + '</td></tr>';
  }
}

document.querySelectorAll('#tablaPag th[data-sortpag]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sortpag;
    if (sortFieldPag === field) { sortDirPag *= -1; } else { sortFieldPag = field; sortDirPag = -1; }
    document.querySelectorAll('#tablaPag th').forEach(t => t.classList.remove('sorted'));
    th.classList.add('sorted');
    renderTablaPag();
  });
});

document.getElementById('buscarPag').addEventListener('input', renderTablaPag);

function renderTablaPag() {
  const busqueda = document.getElementById('buscarPag').value.toLowerCase();
  let filtrado = pagData.filter(r => r.pagina.toLowerCase().includes(busqueda));
  filtrado.sort((a, b) => {
    let va = a[sortFieldPag], vb = b[sortFieldPag];
    if (typeof va === 'string') return va.localeCompare(vb) * sortDirPag;
    return (va - vb) * sortDirPag;
  });
  document.getElementById('totalPagCount').textContent = filtrado.length;
  if (filtrado.length === 0) {
    document.getElementById('tablaPagBody').innerHTML = '<tr><td colspan="7" class="empty">Sin resultados</td></tr>';
    return;
  }
  document.getElementById('tablaPagBody').innerHTML = filtrado.map((r, i) => {
    let posBadge = 'badge-bad';
    if (r.posicion <= 3) posBadge = 'badge-ok';
    else if (r.posicion <= 10) posBadge = 'badge-warn';
    const potHtml = r.potencial > 0 ? \`<span class="delta-up">+\${r.potencial} clics/mes</span>\` : '<span class="delta-flat">—</span>';
    const intHtml = r.intencion === 'comercial'
      ? '<span class="badge badge-ok">\ud83d\udcb0 Comercial</span>'
      : '<span class="badge badge-warn">\ud83d\udcda Informativa</span>';
    return \`<tr style="cursor:pointer" data-idx="\${i}">
      <td>\${r.pagina}</td>
      <td><span class="badge \${posBadge}">\${r.posicion}</span></td>
      <td>\${r.clics}</td>
      <td>\${r.impresiones}</td>
      <td>\${r.ctr}%</td>
      <td>\${potHtml}</td>
      <td>\${intHtml}</td>
    </tr>\`;
  }).join('');
  document.querySelectorAll('#tablaPagBody tr[data-idx]').forEach(tr => {
    tr.addEventListener('click', () => {
      const row = filtrado[parseInt(tr.dataset.idx)];
      abrirModalPagKw(row.urlCompleta, row.pagina);
    });
  });
}

async function abrirModalPagKw(urlCompleta, pagina) {
  document.getElementById('modalPagKwTitle').textContent = 'Keywords de: ' + pagina;
  document.getElementById('modalPagKwBody').innerHTML = '<p class="loading">Cargando…</p>';
  document.getElementById('modalPagKw').classList.add('open');
  try {
    const dias = document.getElementById('rangoComparar').value;
    const diasParam = (dias !== 'custom') ? dias : '28';
    const res = await fetchGSC('/seo/pagina-keywords?url=' + encodeURIComponent(urlCompleta) + '&dias=' + diasParam);
    if (res.ok && res.data.length > 0) {
      document.getElementById('modalPagKwBody').innerHTML = '<table><thead><tr><th>Keyword</th><th>Posición</th><th>Impresiones</th></tr></thead><tbody>' +
        res.data.map(k => \`<tr><td>\${k.keyword}</td><td>\${k.posicion}</td><td>\${k.impresiones}</td></tr>\`).join('') +
        '</table>';
    } else {
      document.getElementById('modalPagKwBody').innerHTML = '<p class="empty">Sin datos de keywords para esta página.</p>';
    }
  } catch(e) {
    document.getElementById('modalPagKwBody').innerHTML = '<p class="empty">Error: ' + e.message + '</p>';
  }
}

function cerrarModalPagKw() {
  document.getElementById('modalPagKw').classList.remove('open');
}

let sugerenciaActual = null;

async function abrirModalSugerencia(pagina, posicion, ctr) {
  sugerenciaActual = null;
  document.getElementById('modalSugerenciaBody').innerHTML = '<p class="loading">Leyendo la página en vivo y generando propuesta…</p>';
  document.getElementById('modalSugerencia').classList.add('open');
  try {
    const res = await fetchGSC('/seo/sugerir-titulo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagina, posicion, ctr })
    });
    if (!res.ok) throw new Error(res.error || 'Error generando la propuesta');
    const d = res.data;
    sugerenciaActual = { pagina, tituloNuevo: d.sugerencia.tituloSugerido, metaNueva: d.sugerencia.metaSugerida };
    document.getElementById('modalSugerenciaBody').innerHTML = \`
      <p style="font-size:12px;color:#999;margin-bottom:12px">\${pagina}</p>
      <div style="background:#faece7;border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-size:11px;color:#993c1d;font-weight:500;margin-bottom:6px">ACTUAL</div>
        <div style="font-size:13px;margin-bottom:4px"><strong>Título:</strong> \${d.actual.titulo}</div>
        <div style="font-size:13px"><strong>Meta:</strong> \${d.actual.meta}</div>
      </div>
      <div style="background:#e1f5ee;border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-size:11px;color:#0f6e56;font-weight:500;margin-bottom:6px">PROPUESTA</div>
        <div style="font-size:13px;margin-bottom:4px"><strong>Título:</strong> \${d.sugerencia.tituloSugerido}</div>
        <div style="font-size:13px"><strong>Meta:</strong> \${d.sugerencia.metaSugerida}</div>
      </div>
      <p style="font-size:12px;color:#666;font-style:italic">\${d.sugerencia.razon}</p>
      <p style="font-size:11px;color:#999;margin-top:12px">Revisa con cuidado antes de aplicar — este cambio se sube directo a tu sitio en vivo.</p>
      <button class="btn btn-primary" id="btnAplicarSugerencia" style="width:100%;margin-top:8px" onclick="aplicarSugerenciaActual()">✅ Aplicar este cambio a la página</button>
      <div id="aplicarSugerenciaStatus" class="status-bar"></div>
    \`;
  } catch(e) {
    document.getElementById('modalSugerenciaBody').innerHTML = '<p class="empty">Error: ' + e.message + '</p>';
  }
}

let cambioAplicadoExitoso = false;

async function aplicarSugerenciaActual() {
  if (!sugerenciaActual) return;
  const confirmado = await confirmarAccion('¿Seguro que quieres aplicar este título y meta description a ' + sugerenciaActual.pagina + '? Se va a subir directo a tu sitio en vivo ahora mismo.', 'Aplicar cambio al sitio');
  if (!confirmado) return;

  const btn = document.getElementById('btnAplicarSugerencia');
  const statusEl = document.getElementById('aplicarSugerenciaStatus');
  btn.disabled = true;
  btn.textContent = '⏳ Aplicando...';

  try {
    const res = await fetch('/seo/aplicar-titulo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sugerenciaActual)
    }).then(r => r.json());
    if (res.ok) {
      statusEl.className = 'status-bar status-ok';
      statusEl.style.display = 'block';
      statusEl.textContent = '✅ Aplicado. La página ya tiene el título y meta nuevos.';
      btn.style.display = 'none';
      cambioAplicadoExitoso = true;
    } else {
      throw new Error(res.error || 'Error desconocido');
    }
  } catch(e) {
    statusEl.className = 'status-bar status-error';
    statusEl.style.display = 'block';
    statusEl.textContent = '❌ Error: ' + e.message;
    btn.disabled = false;
    btn.textContent = '✅ Aplicar este cambio a la página';
  }
}

function cerrarModalSugerencia() {
  document.getElementById('modalSugerencia').classList.remove('open');
  if (cambioAplicadoExitoso) {
    cambioAplicadoExitoso = false;
    generarPlanAuto();
  }
}

// ─── ESTRATEGIA (automatica, sin seleccion manual) ──────────────────────
let planAutoData = [];
let arreglosData = [];

async function refrescarPlanGuardadoBox() {
  const existente = await fetchGSC('/seo/estrategia').catch(() => null);
  if (existente && existente.ok && existente.data) {
    const p = existente.data;
    document.getElementById('planGuardadoBox').innerHTML = \`
      <div class="plan-summary">
        <h3>\ud83d\udccc Ya tienes un plan guardado (actualizado \${new Date(p.actualizadoEn).toLocaleDateString('es-CL')})</h3>
        <div style="font-size:12px;color:#666">\${(p.items || []).length} artículos guardados</div>
      </div>\`;
  } else {
    document.getElementById('planGuardadoBox').innerHTML = '';
  }
}

async function cargarEstrategia() {
  window.__estrategiaCargada = true;
  const existente = await fetchGSC('/seo/estrategia').catch(() => null);
  const planGuardado = (existente && existente.ok && existente.data && (existente.data.items || []).length > 0) ? existente.data : null;
  if (planGuardado) {
    await mostrarPlanGuardado(planGuardado);
  } else {
    await refrescarPlanGuardadoBox();
    await generarPlanAuto();
  }
  await cargarHistorialEstrategias();
}

async function mostrarPlanGuardado(plan) {
  document.getElementById('planGuardadoBox').innerHTML = \`
    <div class="plan-summary">
      <h3>\ud83d\udccc Mostrando el último plan guardado (actualizado \${new Date(plan.actualizadoEn).toLocaleDateString('es-CL')})</h3>
      <div style="font-size:12px;color:#666">\${(plan.items || []).length} artículos guardados — pulsa "Aplicar prioridades" para generar uno nuevo</div>
    </div>\`;
  planAutoData = plan.items || [];
  const arreglos = plan.arreglos || [];
  document.getElementById('planAutoCount').textContent = planAutoData.length;
  document.getElementById('planAutoBody').innerHTML = planAutoData.map(item => \`<tr>
    <td>\${item.fecha}</td>
    <td>\${item.tema}</td>
    <td>\${item.marca || '—'}</td>
    <td>\${item.enlazarA ? item.enlazarA : 'Sin sugerencia'}\${item.enlazarPotencial ? ' <span class="delta-up">(+' + item.enlazarPotencial + ' clics/mes)</span>' : ''}</td>
  </tr>\`).join('') || '<tr><td colspan="4" class="empty">No hay temas guardados</td></tr>';
  if (planAutoData.length > 0) renderExplicacionPlan(planAutoData);

  arreglosData = arreglos;
  try {
    const resumenRes = await fetchGSC('/seo/data?dias=28');
    const totalClicsActual = (resumenRes.ok && resumenRes.data && resumenRes.data.resumen) ? resumenRes.data.resumen.totalClics : 0;
    const proyeccionRes = await fetchGSC('/seo/estrategia/proyeccion-real');
    const tasaDiariaReal = (proyeccionRes.ok && proyeccionRes.tasaDiariaReal) ? proyeccionRes.tasaDiariaReal : null;
    renderMetaEstrategia(totalClicsActual, tasaDiariaReal);
  } catch(e2) {
    document.getElementById('metaEstrategia').innerHTML = '';
  }
  document.getElementById('arreglosRapidosBody').innerHTML = arreglos.length > 0
    ? arreglos.map((a, i) => \`<tr>
        <td>\${a.pagina}</td>
        <td><span class="badge badge-ok">\${a.posicion}</span></td>
        <td>\${a.ctr}%</td>
        <td><span class="delta-up">+\${a.potencial} clics/mes</span></td>
        <td><button class="btn btn-secondary btn-sm" data-idx-arreglo="\${i}">Ver propuesta</button></td>
      </tr>\`).join('')
    : '<tr><td colspan="5" class="empty">No se detectaron arreglos urgentes esta semana</td></tr>';
  document.querySelectorAll('[data-idx-arreglo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = arreglosData[parseInt(btn.dataset.idxArreglo)];
      abrirModalSugerencia(a.pagina, a.posicion, a.ctr);
    });
  });
}

async function cargarHistorialEstrategias() {
  const tbody = document.getElementById('historialEstrategiaBody');
  tbody.innerHTML = '<tr><td colspan="4" class="loading">Cargando…</td></tr>';
  try {
    const res = await fetchGSC('/seo/estrategia/historial');
    if (!res.ok) throw new Error(res.error || 'Error cargando historial');
    const historial = res.data;
    tbody.innerHTML = historial.length > 0
      ? historial.map(h => \`<tr>
          <td>\${new Date(h.fechaGuardado).toLocaleDateString('es-CL')}</td>
          <td>\${h.articulosCount}</td>
          <td>+\${h.proyeccion30} clics/mes</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="abrirModalAuditoria('\${h.id}')">Ver auditoría</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarEstrategiaHistorial('\${h.id}')">Eliminar</button>
          </td>
        </tr>\`).join('')
      : '<tr><td colspan="4" class="empty">Aún no has guardado ninguna estrategia</td></tr>';
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Error: ' + e.message + '</td></tr>';
  }
}

async function eliminarEstrategiaHistorial(id) {
  const confirmado = await confirmarAccion('¿Seguro que quieres eliminar esta estrategia guardada? Esta acción no se puede deshacer y perderás la línea base para auditar ese período.', 'Eliminar estrategia');
  if (!confirmado) return;
  try {
    const res = await fetch('/seo/estrategia/historial/' + id, { method: 'DELETE' }).then(r => r.json());
    if (res.ok) {
      await cargarHistorialEstrategias();
      await refrescarPlanGuardadoBox();
    } else {
      alert('Error eliminando: ' + (res.error || 'desconocido'));
    }
  } catch(e) {
    alert('Error: ' + e.message);
  }
}

async function abrirModalAuditoria(id) {
  document.getElementById('modalAuditoriaBody').innerHTML = '<p class="loading">Calculando resultados reales…</p>';
  document.getElementById('modalAuditoria').classList.add('open');
  try {
    const res = await fetchGSC('/seo/estrategia/auditoria/' + id);
    if (!res.ok) throw new Error(res.error || 'Error calculando auditoria');
    const d = res.data;
    const cumplimientoColor = d.cumplimiento >= 100 ? '#0f6e56' : (d.cumplimiento >= 50 ? '#854f0b' : '#993c1d');
    const filasComparativa = d.comparativa.map(c => \`<tr>
      <td>\${c.pagina}</td>
      <td>\${c.posicionBase ?? '—'} → \${c.posicionActual ?? '—'}</td>
      <td>\${c.clicsBase} → \${c.clicsActual}</td>
    </tr>\`).join('');
    document.getElementById('modalAuditoriaBody').innerHTML = \`
      <p style="font-size:12px;color:#999;margin-bottom:12px">Guardado el \${new Date(d.fechaGuardado).toLocaleDateString('es-CL')} — \${d.diasTranscurridos} días transcurridos</p>
      <div class="grid3" style="margin-bottom:16px">
        <div class="metric"><div class="metric-val">\${d.totalClicsBase}</div><div class="metric-lab">Clics/mes al guardar</div></div>
        <div class="metric"><div class="metric-val">\${d.totalClicsActual}</div><div class="metric-lab">Clics/mes ahora</div></div>
        <div class="metric"><div class="metric-val" style="color:\${cumplimientoColor}">\${d.cumplimiento ?? '—'}%</div><div class="metric-lab">Cumplimiento meta \${d.hito}d</div></div>
      </div>
      \${d.resumen ? \`<p style="font-size:13px;color:#444;margin-bottom:16px;background:#f6f6f4;padding:10px 12px;border-radius:6px">
        📈 <strong>\${d.resumen.paginasMejoraronClics}</strong> de \${d.resumen.paginasConDatos} páginas mejoraron en clics &nbsp;·&nbsp;
        📊 <strong>\${d.resumen.paginasMejoraronPosicion}</strong> de \${d.resumen.paginasConDatos} páginas mejoraron en posición
      </p>\` : ''}
      <table>
        <thead><tr><th>Página</th><th>Posición (antes → ahora)</th><th>Clics (antes → ahora)</th></tr></thead>
        <tbody>\${filasComparativa || '<tr><td colspan="3" class="empty">Sin páginas para comparar</td></tr>'}</tbody>
      </table>
    \`;
  } catch(e) {
    document.getElementById('modalAuditoriaBody').innerHTML = '<p class="empty">Error: ' + e.message + '</p>';
  }
}

function cerrarModalAuditoria() {
  document.getElementById('modalAuditoria').classList.remove('open');
}

function renderExplicacionPlan(data) {
  const nuevas = data.length;
  const paginasMap = {};
  data.forEach(item => {
    if (item.enlazarA) {
      if (!paginasMap[item.enlazarA]) paginasMap[item.enlazarA] = { potencial: item.enlazarPotencial || 0, veces: 0 };
      paginasMap[item.enlazarA].veces++;
    }
  });
  const paginasUnicas = Object.keys(paginasMap);
  const potencialTotal = paginasUnicas.reduce((s, p) => s + paginasMap[p].potencial, 0);
  const topPaginas = paginasUnicas
    .sort((a,b) => paginasMap[b].potencial - paginasMap[a].potencial)
    .slice(0, 5);
  const topTexto = topPaginas.map(p => p + ' (' + paginasMap[p].veces + ' enlace' + (paginasMap[p].veces > 1 ? 's' : '') + ')').join(', ') || 'ninguna por ahora';

  const prioritariosData = data.filter(item => item.prioritario);
  const prioridadesHtml = prioritariosData.length > 0
    ? \`<p style="font-size:13px;line-height:1.7;margin-top:10px;padding-top:10px;border-top:1px solid #cde3c6"><strong>Sobre lo que pediste:</strong> \${prioritariosData.map(item => item.tema + ' → ' + (item.enlazarA || 'sin página asignada aún')).join('; ')}. Quedaron primeras en el calendario de este mes.</p>\`
    : '';

  // La frase de apertura describe el contenido real del plan, no un texto fijo
  const marcasUsadas = [...new Set(data.map(item => item.marca).filter(Boolean))]
    .map(m => m.charAt(0).toUpperCase() + m.slice(1));
  const marcasTexto = marcasUsadas.length > 0 ? 'artículos de marca (' + marcasUsadas.join(', ') + ') y ' : '';

  document.getElementById('planExplicacion').innerHTML = \`
    <div class="plan-summary">
      <p style="font-size:13px;line-height:1.7;margin-bottom:10px"><strong>Qué va a hacer:</strong> este plan crea \${nuevas} páginas nuevas de contenido a lo largo del mes — \${marcasTexto}artículos de temas y ciudades donde hoy no tienes cobertura. Cada una queda indexada con una keyword objetivo distinta.</p>
      <p style="font-size:13px;line-height:1.7;margin-bottom:10px"><strong>Resultado esperado:</strong> no es solo tráfico nuevo — cada artículo enlaza internamente a la página comercial existente que más necesita el empuje. En total, este plan refuerza \${paginasUnicas.length} páginas ya publicadas, con un potencial combinado de +\${potencialTotal} clics/mes si logran llegar a posición 1.</p>
      <p style="font-size:13px;line-height:1.7"><strong>Cómo lo hace:</strong> reparte los enlaces para no sobrecargar una sola página. Las que más refuerzo reciben este mes son: \${topTexto}.</p>
      \${prioridadesHtml}
    </div>\`;
}

function renderMetaEstrategia(totalClicsActual, tasaDiariaReal) {
  // Si el ciclo activo ya mostro crecimiento real medible, la meta se ancla a esa tasa real
  // (misma logica que se aplica al guardar el plan) - si no, cae al modelo conservador fijo.
  const p30 = tasaDiariaReal ? Math.round(tasaDiariaReal * 30) : Math.round(totalClicsActual * 0.08);
  const p60 = tasaDiariaReal ? Math.round(tasaDiariaReal * 60) : Math.round(totalClicsActual * 0.20);
  const p90 = tasaDiariaReal ? Math.round(tasaDiariaReal * 90) : Math.round(totalClicsActual * 0.35);

  document.getElementById('metaEstrategia').innerHTML = \`
    <div class="grid3">
      <div class="metric"><div class="metric-val">\${totalClicsActual}</div><div class="metric-lab">Clics/mes HOY (línea base)</div></div>
      <div class="metric"><div class="metric-val">+\${p30}</div><div class="metric-lab">Meta conservadora 30 días</div></div>
      <div class="metric"><div class="metric-val">+\${p90}</div><div class="metric-lab">Meta conservadora 90 días</div></div>
    </div>
    <p style="font-size:11px;color:#999;font-style:italic;margin-top:-8px;margin-bottom:16px">Estimación conservadora basada en tu tráfico real actual (\${totalClicsActual} clics/mes), no en potenciales ideales sumados. A 60 días la meta es +\${p60} clics/mes. Guarda el plan para auditar el resultado real contra esta meta en 30/60/90 días.</p>
  \`;
}

async function generarPlanAuto() {
  const texto = document.getElementById('prioridadesInput').value;
  document.getElementById('planAutoBody').innerHTML = '<tr><td colspan="4" class="loading">Generando plan…</td></tr>';
  document.getElementById('planExplicacion').innerHTML = '';
  try {
    const res = await fetchGSC('/seo/plan-automatico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    });
    if (!res.ok) throw new Error(res.error || 'Error generando el plan');
    planAutoData = res.data.articulos || [];
    const arreglos = res.data.arreglosRapidos || [];
    document.getElementById('planAutoCount').textContent = planAutoData.length;
    document.getElementById('planAutoBody').innerHTML = planAutoData.map(item => \`<tr>
      <td>\${item.fecha}</td>
      <td>\${item.tema}</td>
      <td>\${item.marca || '—'}</td>
      <td>\${item.enlazarA ? item.enlazarA : 'Sin sugerencia'}\${item.enlazarPotencial ? ' <span class="delta-up">(+' + item.enlazarPotencial + ' clics/mes)</span>' : ''}</td>
    </tr>\`).join('') || '<tr><td colspan="4" class="empty">No hay temas sugeridos configurados</td></tr>';
    if (planAutoData.length > 0) renderExplicacionPlan(planAutoData);

    arreglosData = arreglos;
    try {
      const resumenRes = await fetchGSC('/seo/data?dias=28');
      const totalClicsActual = (resumenRes.ok && resumenRes.data && resumenRes.data.resumen) ? resumenRes.data.resumen.totalClics : 0;
      const proyeccionRes = await fetchGSC('/seo/estrategia/proyeccion-real');
      const tasaDiariaReal = (proyeccionRes.ok && proyeccionRes.tasaDiariaReal) ? proyeccionRes.tasaDiariaReal : null;
      renderMetaEstrategia(totalClicsActual, tasaDiariaReal);
    } catch(e2) {
      document.getElementById('metaEstrategia').innerHTML = '';
    }
    document.getElementById('arreglosRapidosBody').innerHTML = arreglos.length > 0
      ? arreglos.map((a, i) => \`<tr>
          <td>\${a.pagina}</td>
          <td><span class="badge badge-ok">\${a.posicion}</span></td>
          <td>\${a.ctr}%</td>
          <td><span class="delta-up">+\${a.potencial} clics/mes</span></td>
          <td><button class="btn btn-secondary btn-sm" data-idx-arreglo="\${i}">Ver propuesta</button></td>
        </tr>\`).join('')
      : '<tr><td colspan="5" class="empty">No se detectaron arreglos urgentes esta semana</td></tr>';
    document.querySelectorAll('[data-idx-arreglo]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = arreglosData[parseInt(btn.dataset.idxArreglo)];
        abrirModalSugerencia(a.pagina, a.posicion, a.ctr);
      });
    });
  } catch(e) {
    document.getElementById('planAutoBody').innerHTML = '<tr><td colspan="4" class="empty">Error: ' + e.message + '</td></tr>';
    document.getElementById('arreglosRapidosBody').innerHTML = '<tr><td colspan="4" class="empty">Error</td></tr>';
  }
}

document.getElementById('btnAplicarPrioridades').addEventListener('click', () => generarPlanAuto());

document.getElementById('btnGuardarPlanAuto').addEventListener('click', async () => {
  const statusEl = document.getElementById('estrategiaStatus');
  try {
    const res = await fetch('/seo/estrategia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: planAutoData, arreglos: arreglosData, generadoAutomaticamente: true })
    }).then(r => r.json());
    if (res.ok) {
      statusEl.className = 'status-bar status-ok';
      statusEl.style.display = 'block';
      statusEl.textContent = '✅ Plan guardado con foto de línea base. Vuelve en 30 días para auditar el avance.';
      await cargarHistorialEstrategias();
    } else {
      throw new Error(res.error || 'Error desconocido');
    }
  } catch(e) {
    statusEl.className = 'status-bar status-error';
    statusEl.style.display = 'block';
    statusEl.textContent = '❌ Error: ' + e.message;
  }
});

// Carga inicial
cargarDiagnostico();
</script>
</body>
</html>`;
}

function renderConnectCard() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>_AgenteSEO — Conectar</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Poppins",sans-serif;background:#f5f5f5;color:#1a1a1a;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .card{background:#fff;border-radius:16px;border:1px solid #e5e5e5;padding:40px;max-width:440px;width:100%;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.04)}
    .icon{font-size:40px;margin-bottom:16px}
    h1{font-size:20px;font-weight:600;color:#1a1a1a;margin-bottom:8px}
    p{font-size:14px;color:#666;line-height:1.6;margin-bottom:28px}
    .btn{display:inline-block;background:#216416;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:500;font-family:Poppins,sans-serif}
    .btn:hover{background:#1a5212}
    .back{display:block;margin-top:20px;font-size:12px;color:#999;text-decoration:none}
    .back:hover{color:#216416}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">\ud83d\udd17</div>
    <h1>Conecta Google Search Console</h1>
    <p>Para ver el diagnóstico SEO necesitamos acceso de solo lectura a tu Search Console.</p>
    <a href="/auth/google" class="btn">Conectar con Google →</a>
    <a href="/" class="back">← Volver al panel principal</a>
  </div>
</body>
</html>`;
}

module.exports = { renderSeoPanel, renderConnectCard, renderSidebar };
