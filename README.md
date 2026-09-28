# LASA — 100 Rounds

لعبة تصويب من منظور الشخص الأول باستخدام Three.js. تضم ١٠٠ جولة، ويتغير تخطيط الخريطة وموضوعها والسلاح في كل جولة. يظهر زعيم كل عشر جولات. تدعم الكمبيوتر وأجهزة اللمس.

## اللعب

- الكمبيوتر: WASD للحركة، الماوس للتصويب والإطلاق، Shift للجري، Space للقفز، R للتلقيم، وEsc للإيقاف.
- أندرويد: عصا حركة، سحب الشاشة للتصويب، وأزرار إطلاق وقفز وتلقيم.
- تُحفظ الجولة الحالية محليًا في المتصفح. بعد الخسارة يمكن إعادة الجولة نفسها.

لتشغيلها محليًا، قدّم المجلد بمخدم ملفات ثابت مثل `python -m http.server 8000` وافتح `http://localhost:8000`. تُنشر من جذر فرع `main` عبر GitHub Pages.

## النماذج والتراخيص

- الزومبي: [Zombie by Quaternius](https://poly.pizza/m/VlXjG0N8Eg)، ترخيص CC0.
- نماذج اليدين والأسلحة المتحركة: [FPS Rig](https://poly.pizza/m/uxko5LkGia) و[FPS Rig AKM](https://poly.pizza/m/U6l6wjxFhC) من J-Toastie، ترخيص [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). عُدّل الحجم والألوان وتأطير الكاميرا وسرعة الأنيميشن للعبة.
- Three.js 0.160.0 مضمنة محليًا، وترخيصها في `THREE-LICENSE.txt`.

الصوت مركّب محليًا باستخدام Web Audio API، ولا تحتاج اللعبة إلى خدمات خارجية أثناء اللعب.


## تحديث الأعداء والأسلحة

أُضيفت نماذج المستخدم: MidPoly.fbx، dark_knight_01.glb، zombie_scream.glb، zombie_walk_test.glb، crying_head.glb، وkatana.glb. حُوّلت إلى glTF مناسب للمتصفح، وأُزيلت أرضية العرض من الرأس العنكبوتي. أُضيف هيكل وحركات أساسية للفارس المظلم، وحركة برمجية للحارس المدرع. تراخيص ملفات المستخدم تبقى منفصلة عن تراخيص نماذج Quaternius وJ-Toastie المذكورة أعلاه.

أصبحت دورة الأسلحة تضم ثمانية أنواع/نسخ، بما فيها GHOST بكاتم، STRIKER بمنظار، وTITAN بمخزن كبير. تستخدم هذه النسخ نماذج الأسلحة المتحركة الأساسية مع إضافات مرئية وإحصاءات مختلفة.


## تحديث البيئات والأعداء
- عشر بيئات: حي الإخلاء، الميناء، أطلال الغابة، الصحراء، المصنع، المقبرة، الثلج، القلعة، موقف السيارات ومحطة العزل. تتكرر الأنماط مع توزيع مولّد مختلف لكل جولة، وليست 100 خريطة مصنوعة يدويًا.
- خامات إجرائية للجدران والأرض، سماء متدرجة، مبانٍ وتفاصيل وغطاء وإضاءة أكثر هدوءًا. الرسومات محسّنة لكنها ليست فوتوغرافية.
- الأعداء يفتحون تدريجيًا في الجولات 1 و3 و5 و8 و12، مع زيادة العدد حتى 18 وإضافة زعيم كل عشر جولات.
- صحة وسرعة وقوة وتوقيت ضربات مختلفة لكل نوع، وتتبّع لمسار اللاعب حول العوائق، والتفاف ناعم وردود إصابة وسقوط.
- حركات النماذج الأصلية ممزوجة بحركة إجرائية؛ لا توجد حزمة motion capture جديدة.


## Single-level realistic playtest
Open `playtest.html` for the standalone courtyard preview. It uses photo-based PBR surfaces, scanned cover props and HDR environment lighting from Poly Haven (CC0); see `assets/realistic/CREDITS.md`. One assault rifle, eight zombies, a victory screen and replay are included. This preview does not read or modify campaign progress. The original 100-round game remains at `index.html`. The playtest now uses Cransh’s detailed FPS AK-74m model and authored arms/animations (CC BY 4.0), with camera alignment and optimized textures. See assets/ak74/README.md and license.txt. It uses a photographic late-afternoon sky and screen-space ambient occlusion. The campaign retains its original viewmodels.

Validation: browser checked all eight clear spawn points, shooting/reloading, incoming damage, victory and replay; no JavaScript or missing-asset errors. Desktop and landscape phone layouts were captured. Actual Android hardware performance has not been measured.

The latest courtyard rebuild uses Poly Haven modular factory facade meshes (arched windows, recessed loading doors and architectural trim), scanned air conditioners and shrubs, and AgX tone mapping. The AK-74 is framed lower-right to show its receiver and supporting hand.


Graphics settings in the playtest start/pause screen: selective screen-space ray-marched reflections (SSR) on wet patches, and 120 / 240 / 400 m draw distance. Reflections only include visible screen data; this is not hardware ray tracing or a path tracer. SSR defaults off on touch devices. Distant industrial buildings provide a visible skyline beyond the combat arena.

The preview defaults to 400 m draw distance and includes a visible sun disk/halo aligned to its directional light. Reduce distance or disable SSR in the start/pause screen for lower-powered devices.
