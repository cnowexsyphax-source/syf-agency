# SYF AGENCY — site officiel

Vite + React + TypeScript + Tailwind · Three.js / React Three Fiber · GSAP ScrollTrigger · Lenis.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production → dist/
npm run preview
```

## Contenu à compléter

| Quoi | Où |
| --- | --- |
| Photo du fondateur | Déposer `public/images/founder.webp` (portrait 4:5), puis `founder.photo = '/images/founder.webp'` dans `src/data/site.ts` |
| LinkedIn | `links.linkedin` dans `src/data/site.ts` (l'icône s'active automatiquement) |
| Nouveau projet | Ajouter une entrée `status: 'live'` dans `projects` (`src/data/site.ts`) + images dans `public/images/` |
| Sous-services « Digital Strategy » | `services[5].items` dans `src/data/site.ts` |
| Mentions légales (statut, RC/NIF, adresse, hébergeur, durée de conservation) | Repérer les `[À compléter …]` dans `src/legal/LegalPage.tsx` |
| Domaine final | `SITE_URL=https://votre-domaine npm run build` (canonical, Open Graph, sitemap, robots) |

## Formulaire de contact

Sans configuration, le formulaire ouvre la messagerie du visiteur avec le message prérempli (mailto) — aucun faux message de confirmation.
Pour un envoi réel : créer un formulaire Formspree / Getform, puis `.env` → `VITE_FORM_ENDPOINT=https://formspree.io/f/xxxx`. Le message « envoyé » ne s'affiche que si le serveur répond 2xx.

## Cookies

Aucun traceur non essentiel n'est chargé. Pour ajouter un outil (Analytics, Meta Pixel), l'encapsuler dans `whenConsented('analytics' | 'marketing', () => { … })` (`src/lib/consent.ts`) et mettre à jour `cookies.html` (contenu dans `LegalPage.tsx`).

## Logo

`assets-src/syf-logo-original.jpg` est le fichier officiel. `npm run assets` régénère les variantes (blanc / bleu nuit, favicons, image OG, captures WebP/AVIF) sans modifier les formes.

## Performance 3D

- La scène Three.js est chargée à la demande (chunk séparé) et se met en pause hors écran.
- Ordinateurs : qualité haute. Mobiles / machines modestes : géométrie et résolution réduites.
- Pas de WebGL, mode économie de données ou « réduire les animations » : sphère statique en CSS, sans loader ni animations.

## Expérience « Click to explore » (THE GOURMET)

- Desktop (souris, ≥ 900 px, WebGL) : clic sur l'écran du MacBook → la caméra 3D entre dans l'écran ; l'iframe du vrai site est collée à l'écran projeté (homographie CSS) puis occupe tout le viewport. « ← Exit experience » ou Échap pour revenir.
- Mobile / tablette tactile / sans WebGL : feuille plein écran avec le site en direct (version mobile sur téléphone).
- L'intégration en iframe a été vérifiée le 11/11/2026 (pas de `X-Frame-Options` ni `frame-ancestors`). Si ce n'est plus le cas, passer `embeddable: false` dans `src/data/site.ts` : le site s'ouvrira alors dans un nouvel onglet avec la même animation.

## Introduction cinématique

`src/components/OpeningSequence.tsx` (timeline GSAP, DOM : logo officiel, textes, transition « iris ») + `src/components/three/IntroScene.tsx` (WebGL : anneaux chromés, faisceau volumétrique, particules).
- Jouée une fois par session (`sessionStorage`), rejouable via « ↺ Replay intro » dans le footer.
- « Skip intro », Échap ou Entrée pour passer. Jamais jouée avec « réduire les animations ».
- Mobile/tablette : version allégée (moins de particules, résolution réduite). Sans WebGL : anneau CSS + même séquence de logo.
- Sécurité : si la 3D échoue ou tarde, la séquence DOM continue et le site est libéré au plus tard après 9 s.
