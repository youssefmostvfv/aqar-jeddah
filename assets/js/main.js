/**
 * عقار جدة - محرك الواجهة والعداد التفاعلي ومحرك بيانات العقار التفاعلي مع سلايدر الصور (3 ثوانٍ)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // ================= 0. تشغيل زر توجل الناف بار لشاشات الموبايل (Mobile Menu Toggle) =================
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle-btn');
  const mobileDropdown = document.getElementById('mobile-menu-dropdown');
  const mobileIcon = document.getElementById('mobile-menu-icon');

  if (mobileToggleBtn && mobileDropdown) {
    mobileToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileDropdown.classList.contains('hidden');
      if (isHidden) {
        mobileDropdown.classList.remove('hidden');
        if (mobileIcon) mobileIcon.className = 'fas fa-times';
      } else {
        mobileDropdown.classList.add('hidden');
        if (mobileIcon) mobileIcon.className = 'fas fa-bars';
      }
    });

    // إغلاق القائمة عند النقر على أي رابط بداخلها
    const mobileLinks = mobileDropdown.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDropdown.classList.add('hidden');
        if (mobileIcon) mobileIcon.className = 'fas fa-bars';
      });
    });

    // إغلاق القائمة عند النقر في أي مكان خارجها
    document.addEventListener('click', (e) => {
      if (!mobileDropdown.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
        mobileDropdown.classList.add('hidden');
        if (mobileIcon) mobileIcon.className = 'fas fa-bars';
      }
    });
  }

  // ================= 0.1 إظهار الأزرار العائمة فقط عند عمل سكرول =================
  const floatingActions = document.getElementById('floating-actions-container');
  if (floatingActions) {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        floatingActions.classList.remove('opacity-0', 'translate-y-6', 'pointer-events-none');
        floatingActions.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
      } else {
        floatingActions.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        floatingActions.classList.add('opacity-0', 'translate-y-6', 'pointer-events-none');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ================= 1. عداد إحصائيات من نحن (6 ثوانٍ) =================
  const statsSection = document.getElementById('stats-section');
  const counters = document.querySelectorAll('.counter-number');
  let hasAnimated = false;

  const runCounterAnimation = () => {
    const duration = 6000; // 6 ثوانٍ كاملة

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
      let startTime = null;
      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

      const step = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentCount = Math.floor(easeOutQuart(progress) * target);
        counter.textContent = currentCount.toLocaleString('en-US');

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target.toLocaleString('en-US');
        }
      };

      requestAnimationFrame(step);
    });
  };

  if (statsSection && counters.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          runCounterAnimation();
        }
      });
    }, { threshold: 0.25 });

    observer.observe(statsSection);
  }

  // ================= 2. بناء كارت المشروع في الصفحة الرئيسية (مع صورة ابوت وبدون شريط مواصفات الوحدة) =================
  const renderCardHTML = (card, type) => {
    const propId = card.id || card.adNumber;
    const badgeText = card.badge || 'مشروع سكني فاخر';
    const statusText = card.status || 'متاح للحجز';
    const targetUrl = card.projectUrl || `project/?id=${propId}`;
    const priceFormatted = card.startingPriceFormatted || (card.startingPrice ? `${Number(card.startingPrice).toLocaleString('en-US')} ريال` : (card.priceFormatted || ''));
    const cardImg = card.mainImage || (Array.isArray(card.images) && card.images[0]) || card.image || 'assets/images/about-luxury-villa.webp';

    return `
      <div class="property-card group bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col text-right hover:-translate-y-1">
        <!-- صورة غلاف المشروع (صورة ابوت) -->
        <div class="relative w-full aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-neutral-900">
          <img src="${cardImg}" alt="${card.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy">
          <div class="absolute top-3.5 right-3.5 flex items-center gap-2">
            <span class="bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">${badgeText}</span>
            <span class="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-emerald-200/50">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ${statusText}
            </span>
          </div>
          ${card.district ? `
          <div class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-xl flex items-center gap-1.5">
            <i class="fas fa-map-marker-alt text-amber-400 text-[10px]"></i>
            <span>${card.district}</span>
          </div>` : ''}
        </div>

        <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h4 class="text-base sm:text-lg font-black text-neutral-900 group-hover:text-amber-600 transition-colors mb-2 leading-snug">
              ${card.title}
            </h4>
            
            ${card.tagline ? `
            <p class="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              ${card.tagline}
            </p>` : ''}
          </div>

          <!-- معلومات المشروع المجمعة (بدون شريط مواصفات الشقق الفردية) -->
          <div class="flex items-center justify-between py-2.5 px-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs">
            <div class="flex items-center gap-2 font-bold text-neutral-700">
              <i class="fas fa-layer-group text-amber-500"></i>
              <span>${card.unitsCount || 'نماذج متعددة'}</span>
            </div>
            <div class="flex items-center gap-1.5 text-neutral-500 font-medium">
              <i class="fas fa-map-marker-alt text-amber-500"></i>
              <span>${card.district || ''}</span>
            </div>
          </div>

          <!-- السعر وزر المعاينة -->
          <div class="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
            <div>
              <span class="text-[11px] text-neutral-400 block font-medium">السعر يبدأ من :</span>
              <span class="text-base sm:text-lg font-black text-neutral-900 font-sans">
                ${priceFormatted.replace(' ريال', '')} <span class="text-xs font-bold text-amber-600 font-cairo">ريال</span>
              </span>
            </div>
            <a href="${targetUrl}" class="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 group-hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md">
              <span>معاينة المشروع</span>
              <i class="fas fa-arrow-left text-[10px] transform group-hover:-translate-x-1 transition-transform"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  };

  // ================= 2. تحميل وعرض كروت المشاريع مقسمة حسب الأحياء من projects.json =================
  let allPropertiesData = [];
  const districtsConfig = [
    { key: 'mushrifah', name: 'حي مشرفة', filter: p => Boolean(p.district && p.district.includes('مشرفة')) },
    { key: 'hamraa', name: 'حي الحمراء', filter: p => Boolean(p.district && p.district.includes('الحمراء')) },
    { key: 'rawdah', name: 'حي الروضة', filter: p => Boolean(p.district && p.district.includes('الروضة')) },
    { key: 'sharafiyah', name: 'حي الشرفية', filter: p => Boolean(p.district && p.district.includes('الشرفية')) },
    { key: 'zahraa', name: 'حي الزهراء', filter: p => Boolean(p.district && p.district.includes('الزهراء')) },
    { key: 'darb-alharamain', name: 'درب الحرمين', filter: p => Boolean(p.district && (p.district.includes('الحرمين') || p.district.includes('درب'))) }
  ];

  const loadPropertiesData = async () => {
    try {
      const resProjects = await fetch(`assets/data/projects.json?t=${Date.now()}`, { cache: 'no-store' });
      let projectsList = [];

      if (resProjects && resProjects.ok) {
        projectsList = await resProjects.json();
      }

      // قراءة كروت الهوم سواء من كائن مقسم أو مصفوفة مباشرة
      const homeList = Array.isArray(projectsList) ? projectsList : (projectsList.homeProjects || []);
      allPropertiesData = homeList;

      districtsConfig.forEach(dist => {
        const gridEl = document.getElementById(`${dist.key}-cards-grid`);
        const sectionEl = document.getElementById(`district-${dist.key}`);
        if (!gridEl) return;

        let matched = homeList.filter(p => !p.hideFromGrid && dist.filter(p));

        // إبقاء جميع أقسام الأحياء ظاهرة دوماً
        if (sectionEl) {
          sectionEl.style.display = '';
        }

        dist.items = matched;
        gridEl.innerHTML = matched.slice(0, 3)
          .map(card => renderCardHTML(card, dist.name))
          .join('');

        const loadMoreBtn = document.getElementById(`load-more-${dist.key}-btn`);
        const loadMoreContainer = loadMoreBtn ? loadMoreBtn.parentElement : null;
        const loadMoreText = document.getElementById(`load-more-${dist.key}-text`);
        const loadMoreIcon = document.getElementById(`load-more-${dist.key}-icon`);
        let isExpanded = false;
        let extraElements = [];

        // إخفاء زر عرض المزيد إذا كان عدد كروت الحي 3 أو أقل
        if (loadMoreContainer) {
          if (matched.length <= 3) {
            loadMoreContainer.style.display = 'none';
          } else {
            loadMoreContainer.style.display = 'flex';
          }
        }

          if (loadMoreBtn && matched.length > 3) {
            loadMoreBtn.addEventListener('click', () => {
              if (!isExpanded) {
                const extraCards = dist.items.slice(3);

                extraCards.forEach((card, idx) => {
                  const temp = document.createElement('div');
                  temp.innerHTML = renderCardHTML(card, dist.name);
                  const cardEl = temp.firstElementChild;
                  cardEl.classList.add('opacity-0', 'translate-y-4', 'scale-95');
                  cardEl.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                  gridEl.appendChild(cardEl);
                  extraElements.push(cardEl);

                  setTimeout(() => {
                    cardEl.classList.remove('opacity-0', 'translate-y-4', 'scale-95');
                    cardEl.classList.add('opacity-100', 'translate-y-0', 'scale-100');
                  }, 80 * (idx + 1));
                });

                isExpanded = true;
                if (loadMoreText) loadMoreText.textContent = 'عرض أقل';
                if (loadMoreIcon) loadMoreIcon.className = 'fas fa-chevron-up text-[11px] text-amber-500 group-hover:-translate-y-0.5 transition-transform';
              } else {
                extraElements.forEach((el) => {
                  el.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
                  el.classList.add('opacity-0', 'translate-y-4', 'scale-95');
                  setTimeout(() => {
                    if (el.parentNode) el.parentNode.removeChild(el);
                  }, 350);
                });
                extraElements = [];
                isExpanded = false;
                if (loadMoreText) loadMoreText.textContent = `عرض المزيد من مشاريع ${dist.name}`;
                if (loadMoreIcon) loadMoreIcon.className = 'fas fa-chevron-down text-[11px] text-amber-500 group-hover:translate-y-0.5 transition-transform';
              }
            });
          }
        });
    } catch (e) {
      console.warn('Could not load properties from json, fallback static used.', e);
    }
  };

  // تشغيل تحميل كروت الصفحة الرئيسية فقط إذا كنا في الصفحة الرئيسية
  if (document.getElementById('mushrifah-cards-grid')) {
    await loadPropertiesData();
  }

  // ================= 3. تحميل بيانات العقار وسلايدر الصور في صفحة التفاصيل (Dynamic Property Details) =================
  const mainImage = document.getElementById('main-property-image');
  const thumbnailsContainer = document.getElementById('thumbnails-container');

  if (mainImage && thumbnailsContainer) {
    // قراءة معرف العقار من الرابط ?id=AQ-10001 أو ?id=10001 أو ?id=2
    const urlParams = new URLSearchParams(window.location.search);
    const rawIdParam = (urlParams.get('id') || '').trim();

    let propertiesData = [];
    try {
      const res = await fetch(`../assets/data/projects.json?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        propertiesData = await res.json();
      }
    } catch (e) {
      console.warn('Could not load projects.json dynamically, fallback applied', e);
    }

    // قراءة مصفوفة تفاصيل الوحدات
    const allUnits = Array.isArray(propertiesData) ? propertiesData : (propertiesData.unitDetails || []);

    // مطابقة العقار المطلوب بواسطة كود الإعلان أو الـ id
    let currentProp = allUnits.find(p => {
      const pIdStr = String(p.id).toLowerCase();
      const pAdStr = String(p.adNumber || '').toLowerCase();
      const searchStr = rawIdParam.toLowerCase();
      const searchWithAQ = searchStr.startsWith('aq-') ? searchStr : `aq-${searchStr}`;
      
      return pIdStr === searchStr || 
             pAdStr === searchStr || 
             pAdStr === searchWithAQ || 
             pIdStr === searchWithAQ ||
             pIdStr.includes(searchStr) ||
             searchStr.includes(pIdStr);
    });

    if (!currentProp && allUnits.length > 0) {
      currentProp = allUnits[0];
    }

    // تجهيز معرض صور الوحدة من بياناتها
    let galleryImages = (currentProp && Array.isArray(currentProp.images) && currentProp.images.length > 0)
      ? currentProp.images.map(img => `../${String(img).replace(/^(\.\.\/)+/, '')}`)
      : (currentProp && currentProp.mainImage ? [`../${String(currentProp.mainImage).replace(/^(\.\.\/)+/, '')}`] : ['../assets/images/about-luxury-villa.webp']);

    if (currentProp) {
      // تحديث عناصر الصفحة ببيانات العقار من الـ JSON
      const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el && text !== undefined) el.textContent = text;
      };

      document.title = `${currentProp.title} | عقار جدة`;
      setText('prop-breadcrumb-district', currentProp.district);
      
      const categoryLink = document.getElementById('prop-breadcrumb-category');
      if (categoryLink) {
        const catName = currentProp.categoryName || (currentProp.category === 'roofs' ? 'الروف والبنتهاوس' : (currentProp.category === 'houses' ? 'المنازل والفلل' : 'الشقق'));
        categoryLink.textContent = catName;
        // ربط الرابط بالقسم المناسب في الرئيسية
        if (currentProp.category === 'roofs') {
          categoryLink.href = '../#roofs-showcase';
        } else if (currentProp.category === 'apartments') {
          categoryLink.href = '../#apartments-showcase';
        } else {
          categoryLink.href = '../#properties';
        }
      }

      setText('prop-ad-number-badge', `#${currentProp.adNumber}`);
      setText('prop-license-badge', `ترخيص إعلاني موثق فال: ${currentProp.licenseNumber}`);
      setText('prop-status-badge', currentProp.status);
      setText('prop-purpose-badge', currentProp.purpose);

      // زر نسخ رقم الإعلان
      const copyBtn = document.getElementById('copy-ad-number-btn');
      const copyIcon = document.getElementById('copy-ad-icon');
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(`#${currentProp.adNumber}`);
            if (copyIcon) {
              copyIcon.className = 'fas fa-check text-emerald-600 text-xs';
              setTimeout(() => {
                copyIcon.className = 'far fa-copy text-xs';
              }, 2000);
            }
          } catch (e) {
            console.error('Failed to copy', e);
          }
        });
      }

      // معالج زر مشاركة رابط العقار الذكي
      const shareBtn = document.getElementById('share-property-btn');
      const shareIcon = document.getElementById('share-property-icon');
      const shareText = document.getElementById('share-property-text');
      if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
          const shareUrl = `${window.location.origin}${window.location.pathname}?id=${currentProp.adNumber || currentProp.id}`;
          const shareData = {
            title: `${currentProp.title} | عقار جدة`,
            text: `تفاصيل العقار الموثق (${currentProp.adNumber || currentProp.id}) في أرقى أحياء جدة:`,
            url: shareUrl
          };

          if (navigator.share) {
            try {
              await navigator.share(shareData);
            } catch (err) {
              if (err.name !== 'AbortError') console.error('Share failed', err);
            }
          } else {
            try {
              await navigator.clipboard.writeText(shareUrl);
              if (shareIcon && shareText) {
                shareIcon.className = 'fas fa-check text-xs text-emerald-600';
                shareText.textContent = 'تم النسخ!';
                setTimeout(() => {
                  shareIcon.className = 'fas fa-share-alt text-xs text-amber-500';
                  shareText.textContent = 'مشاركة';
                }, 2000);
              }
            } catch (err) {
              console.error('Clipboard failed', err);
            }
          }
        });
      }
      setText('prop-price-val', currentProp.price.toLocaleString('en-US'));
      
      // التعامل مع الخصم والعروض في صفحة العقار
      const discountContainer = document.getElementById('prop-discount-container');
      const originalPriceEl = document.getElementById('prop-original-price');
      const discountTag = document.getElementById('prop-discount-tag');

      if (discountContainer && originalPriceEl) {
        if (currentProp.originalPrice && currentProp.originalPrice > currentProp.price) {
          originalPriceEl.textContent = `${currentProp.originalPrice.toLocaleString('en-US')} ريال`;
          if (discountTag && currentProp.discountBadge) {
            discountTag.querySelector('span').textContent = currentProp.discountBadge;
          }
          discountContainer.classList.remove('hidden');
        } else {
          discountContainer.classList.add('hidden');
        }
      }

      setText('prop-title', currentProp.title);
      setText('prop-location', `جدة — ${currentProp.district}، ${currentProp.street}`);
      setText('prop-rating', `${currentProp.rating} (${currentProp.reviewsCount} تقييم)`);
      setText('prop-date', `تاريخ النشر: ${currentProp.publishedDate}`);

      if (currentProp.description) {
        const p1El = document.getElementById('prop-desc-p1');
        const p2El = document.getElementById('prop-desc-p2');
        const warrantyEl = document.getElementById('prop-desc-warranty');

        if (p1El) {
          const p1 = (currentProp.description.p1 || '').trim();
          if (p1) { p1El.textContent = p1; p1El.classList.remove('hidden'); }
          else { p1El.classList.add('hidden'); }
        }
        if (p2El) {
          const p2 = (currentProp.description.p2 || '').trim();
          if (p2) { p2El.textContent = p2; p2El.classList.remove('hidden'); }
          else { p2El.classList.add('hidden'); }
        }
        if (warrantyEl) {
          const warranty = (currentProp.description.warranty || '').trim();
          if (warranty && warranty !== '—') {
            warrantyEl.innerHTML = `<span class="font-bold block mb-1">الضمانات والتراخيص:</span>${warranty}`;
            warrantyEl.classList.remove('hidden');
          } else {
            warrantyEl.classList.add('hidden');
          }
        }
      }

      if (currentProp.advertiser) {
        setText('prop-advertiser-name', currentProp.advertiser.name);
        setText('prop-advertiser-license', currentProp.advertiser.license);
        const logoEl = document.getElementById('prop-advertiser-logo');
        if (logoEl && currentProp.advertiser.logo) {
          logoEl.src = `../${String(currentProp.advertiser.logo).replace(/^(\.\.\/)+/, '')}`;
        }
      }

      // تحديث رابط الخريطة
      const mapIframe = document.getElementById('prop-map-iframe');
      if (mapIframe && currentProp.location && currentProp.location.mapEmbedUrl) {
        mapIframe.src = currentProp.location.mapEmbedUrl;
      }
      setText('prop-map-district-label', `${currentProp.district} — جدة`);

      // تحديث شبكة المواصفات الفنية Specs (إظهار البنود المتوفرة فقط وإخفاء أي قيمة فارغة)
      // دالة لتحديث شبكة المواصفات الفنية
      const renderSpecs = (specsObj) => {
        const specsContainer = document.getElementById('specs-grid-container');
        if (!specsContainer || !specsObj) return;

        const specDefinitions = [
          { key: 'totalArea', label: 'المساحة', fontSans: true },
          { key: 'roof', label: 'السطح' },
          { key: 'bedrooms', label: 'غرف النوم' },
          { key: 'bathrooms', label: 'دورات المياه' },
          { key: 'livingRooms', label: 'صالة المعيشة' },
          { key: 'diningRooms', label: 'غرفة الطعام' },
          { key: 'kitchens', label: 'المطبخ' },
          { key: 'balconies', label: 'البلكونة' },
          { key: 'maidRoom', label: 'غرفة العاملة' },
          { key: 'driverRoom', label: 'غرفة السائق' },
          { key: 'storage', label: 'المخزن' },
          { key: 'elevator', label: 'المصعد' },
          { key: 'statusNote', label: 'حالة العقار' }
        ];

        const validSpecsHTML = specDefinitions
          .map(def => {
            let val = specsObj[def.key];
            if (val === undefined || val === null) return '';
            const trimmed = String(val).trim();
            if (trimmed === '' || trimmed === '—' || trimmed === '-' || trimmed === 'null' || trimmed === 'undefined') {
              return '';
            }
            return `
              <div class="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 transition-all hover:bg-neutral-100/70">
                <span class="text-neutral-400 block mb-1 text-xs">${def.label}</span>
                <span class="font-bold text-neutral-900 text-base ${def.fontSans ? 'font-sans' : ''}">${trimmed}</span>
              </div>
            `;
          })
          .filter(Boolean)
          .join('');

        specsContainer.innerHTML = validSpecsHTML;
      };

      // تحديث شبكة المواصفات الفنية Specs الأولية
      if (currentProp.specs) {
        renderSpecs(currentProp.specs);
      }

      // تحديث المميزات والتجهيزات Features (إخفاء السكشن بالكامل إذا لم تكن متوفرة)
      const featuresSection = document.getElementById('prop-features-section');
      const featuresContainer = document.getElementById('features-grid-container');
      const rawFeatures = Array.isArray(currentProp.features) ? currentProp.features : [];
      const validFeatures = rawFeatures.filter(f => f && f.name && String(f.name).trim() !== '' && String(f.name).trim() !== '—');

      if (featuresContainer) {
        if (validFeatures.length > 0) {
          featuresContainer.innerHTML = validFeatures.map(f => `
            <div class="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 text-neutral-800">
              <i class="${f.icon || 'fas fa-check-circle'} text-amber-600 text-sm"></i>
              <span>${f.name.trim()}</span>
            </div>
          `).join('');
          if (featuresSection) featuresSection.classList.remove('hidden');
        } else {
          featuresContainer.innerHTML = '';
          if (featuresSection) featuresSection.classList.add('hidden');
        }
      }

      // تحديث الصور
      if (Array.isArray(currentProp.images) && currentProp.images.length > 0) {
        galleryImages = currentProp.images.map(img => img.startsWith('../') ? img : `../${img}`);
      }
    }

    // إعداد وتشغيل سلايدر الصور
    const prevBtn = document.getElementById('gallery-prev-btn');
    const nextBtn = document.getElementById('gallery-next-btn');
    const progressBar = document.getElementById('gallery-progress-bar');
    const currentIndexLabel = document.getElementById('gallery-current-index');
    const totalCountLabel = document.getElementById('gallery-total-count');

    let currentIndex = 0;
    const intervalTime = 3000; // 3 ثوانٍ
    let sliderTimer = null;

    const setupGallery = (images) => {
      if (!Array.isArray(images) || images.length === 0) return;
      galleryImages = images.map(img => img.startsWith('../') ? img : `../${img}`);
      currentIndex = 0;
      if (totalCountLabel) totalCountLabel.textContent = galleryImages.length;

      const thumbnailsWrapper = document.getElementById('thumbnails-wrapper');
      const counterBadge = document.getElementById('gallery-counter-badge') || (currentIndexLabel ? currentIndexLabel.parentElement : null);

      if (galleryImages.length <= 1) {
        if (thumbnailsWrapper) thumbnailsWrapper.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (progressBar && progressBar.parentElement) progressBar.parentElement.style.display = 'none';
        if (counterBadge) counterBadge.style.display = 'none';
        
        mainImage.src = galleryImages[0];
        mainImage.style.opacity = '1';
        return;
      }

      if (thumbnailsWrapper) thumbnailsWrapper.style.display = '';
      if (prevBtn) prevBtn.style.display = '';
      if (nextBtn) nextBtn.style.display = '';
      if (progressBar && progressBar.parentElement) progressBar.parentElement.style.display = '';
      if (counterBadge) counterBadge.style.display = '';

      // بناء المصغرات في الشريط المتحرك
      thumbnailsContainer.innerHTML = '';
      galleryImages.forEach((imgSrc, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `flex-shrink-0 w-20 sm:w-24 md:w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
          idx === 0 ? 'ring-2 ring-amber-500 scale-[1.02] shadow-sm opacity-100' : 'opacity-60 hover:opacity-100 border border-neutral-200'
        }`;
        thumb.innerHTML = `<img src="${imgSrc}" alt="مصغر ${idx + 1}" class="w-full h-full object-cover">`;
        
        thumb.addEventListener('click', () => {
          goToSlide(idx);
          restartAutoPlay();
        });

        thumbnailsContainer.appendChild(thumb);
      });

      updateSliderUI();
      restartAutoPlay();
    };

    const updateSliderUI = () => {
      if (!galleryImages || galleryImages.length === 0) return;
      mainImage.style.opacity = '0.3';
      setTimeout(() => {
        mainImage.src = galleryImages[currentIndex];
        mainImage.style.opacity = '1';
      }, 150);

      if (currentIndexLabel) currentIndexLabel.textContent = currentIndex + 1;

      const thumbs = thumbnailsContainer.children;
      for (let i = 0; i < thumbs.length; i++) {
        if (i === currentIndex) {
          thumbs[i].className = 'flex-shrink-0 w-20 sm:w-24 md:w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ring-2 ring-amber-500 scale-[1.02] shadow-sm opacity-100';
        } else {
          thumbs[i].className = 'flex-shrink-0 w-20 sm:w-24 md:w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 opacity-60 hover:opacity-100 border border-neutral-200';
        }
      }

      const activeThumb = thumbs[currentIndex];
      const wrapper = document.getElementById('thumbnails-wrapper');
      if (activeThumb && wrapper) {
        if (window.innerWidth >= 768) {
          const topOffset = activeThumb.offsetTop - (wrapper.clientHeight / 2) + (activeThumb.clientHeight / 2);
          wrapper.scrollTo({ top: topOffset, behavior: 'smooth' });
        } else {
          const leftOffset = activeThumb.offsetLeft - (wrapper.clientWidth / 2) + (activeThumb.clientWidth / 2);
          wrapper.scrollTo({ left: leftOffset, behavior: 'smooth' });
        }
      }
    };

    const animateProgressBar = () => {
      if (!progressBar) return;
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${intervalTime}ms linear`;
        progressBar.style.width = '100%';
      });
    };

    const nextSlide = () => {
      if (!galleryImages || galleryImages.length === 0) return;
      currentIndex = (currentIndex + 1) % galleryImages.length;
      updateSliderUI();
    };

    const prevSlide = () => {
      if (!galleryImages || galleryImages.length === 0) return;
      currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
      updateSliderUI();
    };

    const goToSlide = (idx) => {
      currentIndex = idx;
      updateSliderUI();
    };

    const restartAutoPlay = () => {
      clearInterval(sliderTimer);
      animateProgressBar();
      sliderTimer = setInterval(() => {
        nextSlide();
        animateProgressBar();
      }, intervalTime);
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        restartAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        restartAutoPlay();
      });
    }

    mainImage.parentElement.addEventListener('mouseenter', () => {
      clearInterval(sliderTimer);
      if (progressBar) progressBar.style.transition = 'none';
    });

    mainImage.parentElement.addEventListener('mouseleave', () => {
      restartAutoPlay();
    });

    // تشغيل المعرض الافتراضي
    setupGallery(galleryImages);

    // ================= معالج النماذج المتعددة للمشاريع (Models Switcher) =================
    if (currentProp && Array.isArray(currentProp.models) && currentProp.models.length > 0) {
      const modelsWrapper = document.getElementById('prop-models-wrapper');
      const modelsContainer = document.getElementById('prop-models-container');
      const currentModelBadge = document.getElementById('prop-current-model-badge');

      if (modelsWrapper && modelsContainer) {
        modelsWrapper.classList.remove('hidden');
        modelsContainer.innerHTML = '';

        let activeModelId = currentProp.models[0].id;

        const selectModel = (model) => {
          activeModelId = model.id;

          // تحديث شارة النموذج الحالي
          if (currentModelBadge) {
            currentModelBadge.textContent = model.name;
          }

          // تحديث العنوان
          if (model.title) {
            const titleEl = document.getElementById('prop-title');
            if (titleEl) titleEl.textContent = model.title;
          }

          // تحديث السعر
          if (model.price) {
            const priceValEl = document.getElementById('prop-price-val');
            if (priceValEl) priceValEl.textContent = Number(model.price).toLocaleString('en-US');
          }

          // تحديث المواصفات الفنية للنموذج المختار
          // نأخذ مواصفات المبنى العامة فقط، ونستبدل بالكامل مواصفات الوحدة الخاصة بالنموذج
          const buildingSpecs = {
            age: currentProp.specs ? currentProp.specs.age : '',
            streetWidth: currentProp.specs ? currentProp.specs.streetWidth : '',
            furnished: currentProp.specs ? currentProp.specs.furnished : '',
            facade: currentProp.specs ? currentProp.specs.facade : '',
            falNumber: currentProp.falNumber || (currentProp.specs ? currentProp.specs.falNumber : ''),
            licenseNumber: currentProp.licenseNumber || (currentProp.specs ? currentProp.specs.licenseNumber : '')
          };
          const modelSpecificSpecs = Object.assign({}, buildingSpecs, model.specs || {});
          renderSpecs(modelSpecificSpecs);

          // تحديث صور المعرض
          if (Array.isArray(model.images) && model.images.length > 0) {
            setupGallery(model.images);
          } else if (model.mainImage) {
            setupGallery([model.mainImage]);
          }

          // تحديث حالة الأزرار (Active State)
          Array.from(modelsContainer.children).forEach(btn => {
            const isCurrent = btn.dataset.modelId === model.id;
            const iconEl = btn.querySelector('.model-icon');
            const titleEl = btn.querySelector('.model-title');
            const typeBadge = btn.querySelector('.model-badge');
            const areaSpan = btn.querySelector('.model-area-tag');

            if (isCurrent) {
              btn.className = 'group relative flex flex-col justify-between p-3.5 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/25 ring-2 ring-amber-500 scale-[1.02] transition-all duration-200 cursor-pointer text-right';
              if (iconEl) iconEl.className = 'model-icon text-amber-200 text-sm';
              if (titleEl) titleEl.className = 'model-title font-bold text-xs text-white block mt-1.5 truncate';
              if (typeBadge) typeBadge.className = 'model-badge text-[10px] text-amber-100 bg-white/15 px-2 py-0.5 rounded-md inline-block self-start';
              if (areaSpan) areaSpan.className = 'model-area-tag text-[11px] text-amber-100 font-sans font-bold mt-2 pt-1.5 border-t border-white/20 block';
            } else {
              btn.className = 'group relative flex flex-col justify-between p-3.5 rounded-2xl bg-neutral-50/80 hover:bg-white text-neutral-800 border border-neutral-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer text-right';
              if (iconEl) iconEl.className = 'model-icon text-amber-600 group-hover:text-amber-700 text-sm transition-colors';
              if (titleEl) titleEl.className = 'model-title font-bold text-xs text-neutral-800 group-hover:text-amber-600 block mt-1.5 truncate transition-colors';
              if (typeBadge) typeBadge.className = 'model-badge text-[10px] text-neutral-500 bg-neutral-200/60 px-2 py-0.5 rounded-md inline-block self-start';
              if (areaSpan) areaSpan.className = 'model-area-tag text-[11px] text-neutral-500 group-hover:text-neutral-800 font-sans font-bold mt-2 pt-1.5 border-t border-neutral-200/60 block';
            }
          });
        };

        // إنشاء أزرار النماذج الستة A, B, C, D وملحق 1 وملحق 2 بتصميم بطاقات فخمة ومتناسقة
        currentProp.models.forEach((m, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.dataset.modelId = m.id;
          const isInitial = idx === 0;
          const isAnnex = m.id.startsWith('annex');

          btn.className = isInitial
            ? 'group relative flex flex-col justify-between p-3.5 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/25 ring-2 ring-amber-500 scale-[1.02] transition-all duration-200 cursor-pointer text-right'
            : 'group relative flex flex-col justify-between p-3.5 rounded-2xl bg-neutral-50/80 hover:bg-white text-neutral-800 border border-neutral-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer text-right';

          btn.innerHTML = `
            <div>
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <span class="model-badge text-[10px] ${isInitial ? 'text-amber-100 bg-white/15' : 'text-neutral-500 bg-neutral-200/60'} px-2 py-0.5 rounded-md inline-block self-start font-medium">
                  ${m.badge || (isAnnex ? 'ملحق روف' : 'شقة سكنية')}
                </span>
                <i class="model-icon fas ${isAnnex ? 'fa-home' : 'fa-building'} ${isInitial ? 'text-amber-200' : 'text-amber-600'} text-xs"></i>
              </div>
              <span class="model-title font-bold text-xs ${isInitial ? 'text-white' : 'text-neutral-800 group-hover:text-amber-600'} block truncate" title="${m.name}">
                ${m.name}
              </span>
            </div>
            ${m.specs && m.specs.totalArea ? `
              <span class="model-area-tag text-[11px] ${isInitial ? 'text-amber-100 border-white/20' : 'text-neutral-500 group-hover:text-neutral-800 border-neutral-200/60'} font-sans font-bold mt-2 pt-1.5 border-t block">
                ${m.specs.totalArea}
              </span>
            ` : ''}
          `;

          btn.addEventListener('click', () => {
            selectModel(m);
          });

          modelsContainer.appendChild(btn);
        });

        // تفعيل أول نموذج كنموذج افتراضي عند الفتح
        selectModel(currentProp.models[0]);
      }
    }

    // ================= توليد قسم الضمانات المعتمدة للمشروع =================
    const warrantiesSection = document.getElementById('prop-warranties-section');
    const warrantiesContainer = document.getElementById('prop-warranties-container');
    if (warrantiesSection && warrantiesContainer) {
      if (Array.isArray(currentProp.warranties) && currentProp.warranties.length > 0) {
        warrantiesSection.classList.remove('hidden');
        warrantiesContainer.innerHTML = currentProp.warranties.map(w => `
          <div class="p-3.5 sm:p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 flex items-center gap-3.5 hover:bg-amber-50/40 hover:border-amber-200 transition-all duration-200">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-xs">
              <i class="${w.icon || 'fas fa-shield-alt'} text-base"></i>
            </div>
            <div class="text-right">
              <span class="text-xs text-neutral-500 block">${w.title}</span>
              <span class="text-sm font-black text-neutral-900 font-sans">${w.duration}</span>
            </div>
          </div>
        `).join('');
      } else {
        warrantiesSection.classList.add('hidden');
      }
    }

    // ================= 3.5. توليد كروت الترشيحات الذكية الأفقية حسب السعر المقارب =================
    const recSection = document.getElementById('recommendations-section');
    const recContainer = document.getElementById('recommendations-container');
    const recScrollLeft = document.getElementById('rec-scroll-left');
    const recScrollRight = document.getElementById('rec-scroll-right');

    if (recContainer && allUnits.length > 0) {
      const currentPrice = Number(currentProp.price) || 600000;
      const currentId = String(currentProp.id || currentProp.adNumber || '');

      // استبعاد العقار الحالي وترتيب بقية العقارات حسب قرب السعر
      const otherProps = allUnits.filter(p => {
        const otherId = String(p.id || p.adNumber || '');
        return otherId !== currentId;
      });

      // خوارزمية قياس الفارق السعري
      otherProps.sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        const diffA = Math.abs(priceA - currentPrice);
        const diffB = Math.abs(priceB - currentPrice);
        return diffA - diffB;
      });

      // اختيار أفضل 6 ترشيحات مقترحة
      const recommendedProps = otherProps.slice(0, 6);

      if (recommendedProps.length > 0) {
        recContainer.innerHTML = recommendedProps.map(item => {
          const s = item.specs || {};
          const area = s.totalArea || s.area || '—';
          const beds = s.bedrooms || s.rooms || '—';
          const baths = s.bathrooms || '—';
          const itemImg = item.mainImage || (Array.isArray(item.images) && item.images[0]) || 'assets/images/about-luxury-villa.webp';
          const linkUrl = `../property/?id=${item.id || item.adNumber}`;
          const badgeTxt = item.badge || item.categoryName || 'شقة تمليك';
          const formattedPrice = (item.priceFormatted || `${Number(item.price).toLocaleString('en-US')} ريال`).replace(' ريال', '');

          return `
            <div class="flex-shrink-0 w-[280px] sm:w-[320px] snap-start group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col text-right">
              <div class="relative w-full aspect-[4/3] overflow-hidden bg-neutral-900">
                <img src="../${itemImg.replace(/^(\.\.\/)+/, '')}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy">
                <div class="absolute top-3 right-3 flex items-center gap-1.5">
                  <span class="bg-neutral-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">${badgeTxt}</span>
                </div>
                ${item.district ? `
                <div class="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <i class="fas fa-map-marker-alt text-amber-400 text-[9px]"></i>
                  <span>${item.district}</span>
                </div>` : ''}
              </div>
              <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span class="text-[10px] text-neutral-400 block mb-1">كود #${item.adNumber || item.id}</span>
                  <h4 class="text-sm font-bold text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-1" title="${item.title}">
                    ${item.title}
                  </h4>
                </div>
                <div class="grid grid-cols-3 gap-1.5 py-2 px-1.5 bg-neutral-50 rounded-xl text-center border border-neutral-100 text-[11px]">
                  <div><span class="text-[9px] text-neutral-400 block">المساحة</span><span class="font-bold text-neutral-900 font-sans">${area}</span></div>
                  <div><span class="text-[9px] text-neutral-400 block">الغرف</span><span class="font-bold text-neutral-900">${beds}</span></div>
                  <div><span class="text-[9px] text-neutral-400 block">الحمامات</span><span class="font-bold text-neutral-900">${baths}</span></div>
                </div>
                <div class="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-neutral-400 block">السعر</span>
                    <span class="text-sm sm:text-base font-black text-neutral-900 font-sans">${formattedPrice} <span class="text-[10px] font-bold text-amber-600 font-cairo">ريال</span></span>
                  </div>
                  <a href="${linkUrl}" class="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 group-hover:bg-amber-600 group-hover:text-white text-neutral-900 rounded-xl text-xs font-bold transition-all">
                    <span>التفاصيل</span>
                    <i class="fas fa-arrow-left text-[9px]"></i>
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // أزرار التحكم بالتمرير الأفقي
        if (recScrollRight) {
          recScrollRight.addEventListener('click', () => {
            recContainer.scrollBy({ left: 320, behavior: 'smooth' });
          });
        }
        if (recScrollLeft) {
          recScrollLeft.addEventListener('click', () => {
            recContainer.scrollBy({ left: -320, behavior: 'smooth' });
          });
        }
      }
    }

    // إظهار محتوى صفحة العقار بسلاسة فور اكتمال تعبئة البيانات لمنع وميض البيانات القديمة
    const propMainContent = document.getElementById('property-main-content');
    if (propMainContent) {
      propMainContent.classList.add('loaded');
    }
  }

  // ================= 4. تحسين استهلاك المعالج وظهور الفيديو بالتدريج (Fade-in) =================
  const heroVideo = document.getElementById('hero-bg-video');
  if (heroVideo) {
    // أنيميشن الظهور التدريجي السلس فور بدء تشغيل الإطارات الأولى
    const revealVideo = () => {
      heroVideo.classList.remove('opacity-0', 'scale-105');
      heroVideo.classList.add('opacity-90', 'scale-100');
    };

    if (heroVideo.readyState >= 2) {
      revealVideo();
    } else {
      heroVideo.addEventListener('playing', revealVideo, { once: true });
      heroVideo.addEventListener('loadeddata', revealVideo, { once: true });
      // خطة احتياطية في حال تأخر حدث التشغيل
      setTimeout(revealVideo, 800);
    }

    // إيقاف الفيديو عند التمرير لتوفير المعالج وإعادة تشغيله عند العودة
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            heroVideo.play().catch(() => {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.1 });
      videoObserver.observe(heroVideo);
    }
  }
});

