/**
 * عقار جدة - صفحة المشروع: تعرض كاردات الوحدات (شقق / روف / ملاحق) التابعة للمشروع
 * الضغط على أي كارد يفتح صفحة تفاصيل الوحدة (property/?id=...)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawId = (urlParams.get('id') || 'proj-hamra-269').trim().toLowerCase();

  let projectsData = [];
  try {
    const res = await fetch(`../assets/data/projects.json?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) projectsData = await res.json();
  } catch (e) {
    console.warn('Failed to load projects.json', e);
  }

  const homeProjects = Array.isArray(projectsData) ? projectsData : (projectsData.homeProjects || []);
  const projectUnits = Array.isArray(projectsData) ? projectsData : (projectsData.projectUnits || []);

  const currentProject = homeProjects.find(p => {
    const pId = String(p.id || '').toLowerCase();
    const pAd = String(p.adNumber || '').toLowerCase();
    return pId === rawId || pAd === rawId || pId.includes(rawId) || rawId.includes(pId);
  }) || homeProjects[0];

  if (!currentProject) return;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.textContent = text;
  };

  // ---------- رأس المشروع ----------
  document.title = `${currentProject.title} | عقار جدة`;
  setText('proj-title', currentProject.title);
  setText('proj-breadcrumb-district', currentProject.district);
  setText('proj-location-text', `جدة — ${currentProject.district}${currentProject.street ? `، ${currentProject.street}` : ''}`);
  setText('proj-ad-number-badge', currentProject.adNumber || currentProject.id);

  const descEl = document.getElementById('proj-desc');
  if (descEl) {
    descEl.textContent = currentProject.tagline || (typeof currentProject.description === 'string' ? currentProject.description : (currentProject.description && currentProject.description.p1) || '');
  }

  const statusEl = document.getElementById('proj-status-badge');
  if (statusEl) {
    statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>${currentProject.status || 'متاح للحجز'}</span>`;
  }

  const licenseEl = document.getElementById('proj-license-badge');
  if (licenseEl && currentProject.licenseNumber) {
    licenseEl.innerHTML = `<i class="fas fa-certificate text-neutral-400 text-[10px]"></i><span class="font-sans">ترخيص فال: ${currentProject.licenseNumber}</span>`;
  }

  // ---------- وحدات المشروع ----------
  let units = projectUnits.filter(u => u.projectId === currentProject.id);

  if (units.length === 0) {
    const grid = document.getElementById('proj-units-grid');
    setText('proj-units-count', 'قيد التحديث');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full py-16 px-6 bg-white rounded-3xl border border-dashed border-neutral-200 text-center space-y-4">
          <div class="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <i class="fas fa-layer-group"></i>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-neutral-900">جاري تجهيز وتحديث نماذج هذا المشروع</h4>
          <p class="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            يمكنك التواصل معنا مباشرة للاستفسار عن المخططات والأسعار وحجز موعد لمعاينة المشروع على الطبيعة.
          </p>
          <div class="pt-2">
            <a href="https://wa.me/966566399523" target="_blank" class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow transition">
              <i class="fab fa-whatsapp"></i>
              <span>استفسر عبر الواتساب</span>
            </a>
          </div>
        </div>
      `;
    }
    const mainContentEl = document.getElementById('project-main-content');
    if (mainContentEl) mainContentEl.classList.add('loaded');
    return;
  }

  const fixImg = (src) => (src ? `../${String(src).replace(/^(\.\.\/)+/, '')}` : '../assets/images/about-luxury-villa.webp');

  const grid = document.getElementById('proj-units-grid');
  setText('proj-units-count', `${units.length} وحدة`);
  if (!grid) return;

  grid.innerHTML = units.map(u => {
    const img = fixImg(u.mainImage);
    const badge = u.badge || 'وحدة سكنية';
    const priceText = u.priceFormatted || `${Number(u.price).toLocaleString('en-US')} ريال`;
    const title = u.title;
    const href = `../property/?id=${u.id}`;

    return `
      <a href="${href}" class="property-card group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col text-right">
        <div class="relative w-full aspect-[1/1] overflow-hidden bg-neutral-900">
          <img src="${img}" alt="${title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
          <div class="absolute top-3.5 right-3.5 flex items-center gap-2">
            <span class="bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">${badge}</span>
            <span class="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">${u.purpose || 'للبيع'}</span>
          </div>
          <div class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-xl flex items-center gap-1.5">
            <i class="fas fa-map-marker-alt text-amber-400 text-[10px]"></i>
            <span>${currentProject.district}</span>
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <span class="text-xs text-neutral-400 block mb-1.5">كود: #${u.id}</span>
            <h4 class="text-base font-bold text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-1">${title}</h4>
          </div>
          <div class="grid grid-cols-4 gap-2 py-3 px-2 bg-neutral-50 rounded-2xl text-center border border-neutral-100 text-xs">
            <div><span class="text-[10px] text-neutral-400 block mb-0.5">المساحة الإجمالية</span><span class="font-bold text-neutral-900 font-sans">${u.area || '—'}</span></div>
            <div><span class="text-[10px] text-neutral-400 block mb-0.5">غرف النوم</span><span class="font-bold text-neutral-900">${u.rooms || '—'}</span></div>
            <div><span class="text-[10px] text-neutral-400 block mb-0.5">البلكونات</span><span class="font-bold text-amber-600">${u.balconies || '—'}</span></div>
            <div><span class="text-[10px] text-neutral-400 block mb-0.5">دورات المياه</span><span class="font-bold text-neutral-900">${u.baths || '—'}</span></div>
          </div>
          <div class="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <div>
              <span class="text-[12px] text-neutral-400 block">السعر</span>
              <span class="text-base sm:text-lg font-black text-neutral-900 font-sans">${priceText.replace(' ريال', '')} <span class="text-xs font-bold text-amber-600 font-cairo">ريال</span></span>
            </div>
            <span class="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 group-hover:bg-amber-600 group-hover:text-white text-neutral-900 rounded-xl text-xs font-bold transition-all duration-300">
              <span>التفاصيل</span>
              <i class="fas fa-arrow-left text-[10px]"></i>
            </span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  const mainContentEl = document.getElementById('project-main-content');
  if (mainContentEl) mainContentEl.classList.add('loaded');
});
