/**
 * عقار جدة - محرك صفحة المشاريع المتكاملة (Multi-Unit Project Showcase Engine)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. قراءة الـ id من رابط الصفحة
  const urlParams = new URLSearchParams(window.location.search);
  const rawId = (urlParams.get('id') || 'AQ-15001').trim().toLowerCase();

  let projectsData = [];
  try {
    const res = await fetch(`../assets/data/projects.json?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      projectsData = await res.json();
    }
  } catch (e) {
    console.warn('Failed to load projects.json', e);
  }

  // مطابقة المشروع
  const currentProject = projectsData.find(p => {
    const pId = String(p.id || '').toLowerCase();
    const pAd = String(p.adNumber || '').toLowerCase();
    return pId === rawId || pAd === rawId || `aq-${pId}` === rawId || pId === `aq-${rawId}`;
  }) || projectsData[0];

  if (!currentProject) return;

  // دالة مساعدة لتحديث النصوص
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.textContent = text;
  };

  // 2. تحديث بيانات رأس المشروع وكارد التواصل
  document.title = `${currentProject.title} | عقار جدة`;
  setText('proj-title', currentProject.title);
  setText('proj-breadcrumb-district', currentProject.district);
  setText('proj-location', `جدة — ${currentProject.district}، ${currentProject.street}`);
  setText('proj-map-district', `${currentProject.district} — جدة`);
  const statusEl = document.getElementById('proj-status-badge');
  if (statusEl) {
    statusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>${currentProject.status || 'متاح'}</span>`;
  }
  const licenseEl = document.getElementById('proj-license-badge');
  if (licenseEl) {
    licenseEl.innerHTML = `<i class="fas fa-certificate text-neutral-400 text-[10px]"></i><span class="font-sans">ترخيص فال: ${currentProject.licenseNumber || '1200088712'}</span>`;
  }
  setText('proj-ad-number-badge', currentProject.adNumber || currentProject.id);

  // بيانات المعلن لكارد الحجز والتواصل
  const adv = currentProject.advertiser || {
    name: "شركة رسوخ العقارية ",
    license: "وسيط عقاري معتمد — رخصة فال #1200012345",
    phone: "+966566399523",
    whatsapp: "966566399523",
    isVerified: true
  };
  setText('proj-card-advertiser-name', adv.name);
  setText('proj-card-advertiser-license', adv.license);
  setText('proj-card-phone-text', `اتصال هاتفي (${adv.phone ? adv.phone.replace('+966', '0') : '0566399523'})`);
  
  const cardAdvLogo = document.getElementById('proj-card-advertiser-logo');
  if (cardAdvLogo && adv.logo) {
    cardAdvLogo.src = adv.logo.startsWith('../') ? adv.logo : `../${adv.logo}`;
  }
  
  const cardPhoneBtn = document.getElementById('proj-card-phone-btn');
  if (cardPhoneBtn) cardPhoneBtn.href = `tel:${adv.phone || '+966566399523'}`;

  const cardWhatsappBtn = document.getElementById('proj-card-whatsapp-btn');
  if (cardWhatsappBtn) {
    const waNum = (adv.whatsapp || '966566399523').replace(/[^0-9]/g, '');
    cardWhatsappBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(`السلام عليكم، أود الاستفسار وحجز معاينة بخصوص ${currentProject.title}`)}`;
  }

  // تفعيل نموذج حجز موعد المعاينة
  const bookingForm = document.getElementById('proj-booking-form');
  const bookingSuccessMsg = document.getElementById('booking-success-msg');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('booking-name')?.value || '').trim();
      const phone = (document.getElementById('booking-phone')?.value || '').trim();
      if (!name || !phone) return;

      const waNum = (adv.whatsapp || '966566399523').replace(/[^0-9]/g, '');
      const activeModelName = currentProject.models && currentProject.models[activeModelIndex] ? currentProject.models[activeModelIndex].name : '';
      const textMsg = `طلب حجز معاينة ميدانية:%0A• المشروع: ${encodeURIComponent(currentProject.title)}%0A• النموذج: ${encodeURIComponent(activeModelName)}%0A• الاسم: ${encodeURIComponent(name)}%0A• الجوال: ${encodeURIComponent(phone)}`;
      
      if (bookingSuccessMsg) {
        bookingSuccessMsg.classList.remove('hidden');
        setTimeout(() => { bookingSuccessMsg.classList.add('hidden'); }, 6000);
      }
      bookingForm.reset();

      // فتح الواتساب بتفاصيل الطلب مباشرة
      window.open(`https://wa.me/${waNum}?text=${textMsg}`, '_blank');
    });
  }

  // نسخ كود المشروع
  const copyBtn = document.getElementById('copy-proj-code-btn');
  const copyIcon = document.getElementById('copy-proj-icon');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(`#${currentProject.adNumber || currentProject.id}`);
        if (copyIcon) {
          copyIcon.className = 'fas fa-check text-emerald-600 text-xs';
          setTimeout(() => { copyIcon.className = 'far fa-copy text-xs'; }, 2000);
        }
      } catch (err) {}
    });
  }

  // الوصف والخريطة
  if (currentProject.description) {
    setText('proj-desc-p1', currentProject.description.p1 || '');
    setText('proj-desc-p2', currentProject.description.p2 || '');
  } else if (currentProject.overview) {
    setText('proj-desc-p1', currentProject.overview);
    setText('proj-desc-p2', currentProject.tagline || '');
  }
  const mapIframe = document.getElementById('proj-map-iframe');
  if (mapIframe && currentProject.location && currentProject.location.mapEmbedUrl) {
    mapIframe.src = currentProject.location.mapEmbedUrl;
  }

  // 3. بناء الخدمات المشتركة (المميزات العامة)
  const featuresContainer = document.getElementById('proj-features-grid');
  if (featuresContainer && Array.isArray(currentProject.features)) {
    featuresContainer.innerHTML = currentProject.features
      .filter(f => f && (f.name || f.title))
      .map(f => `
        <div class="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 hover:bg-neutral-100/70 transition text-center sm:text-right">
          <i class="${f.icon || 'fas fa-check'} text-amber-600 text-sm sm:text-base shrink-0"></i>
          <span class="text-neutral-800 font-bold text-xs sm:text-sm leading-tight">${f.name || f.title}</span>
        </div>
      `).join('');
  }

  // 4. بناء الضمانات المعتمدة بتصميم فخم ومتناسق
  const warrantiesContainer = document.getElementById('proj-warranties-grid');
  if (warrantiesContainer && Array.isArray(currentProject.warranties)) {
    warrantiesContainer.innerHTML = currentProject.warranties.map(w => `
      <div class="p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-100 hover:border-amber-200 hover:bg-amber-50/40 transition flex items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0">
            <i class="${w.icon || 'fas fa-shield-alt'} text-xs"></i>
          </div>
          <span class="text-xs sm:text-sm font-bold text-neutral-800 leading-snug">${w.title}</span>
        </div>
        <span class="text-xs sm:text-sm font-black text-amber-600 bg-white border border-amber-200/80 px-2.5 py-1 rounded-lg shrink-0 font-sans shadow-2xs whitespace-nowrap">
          ${w.duration}
        </span>
      </div>
    `).join('');
  }

  // 5. محرك النماذج الستة التفاعلي (Models Showcase Engine)
  const models = currentProject.models || [];
  const modelsGrid = document.getElementById('proj-models-grid');
  const mainImg = document.getElementById('proj-main-image');
  const bgBlurImg = document.getElementById('proj-bg-blur-image');
  const mainVideo = document.getElementById('proj-main-video');
  const thumbsContainer = document.getElementById('proj-thumbnails-container');
  const galleryIndexEl = document.getElementById('proj-gallery-index');
  const galleryTotalEl = document.getElementById('proj-gallery-total');
  const specsContainer = document.getElementById('proj-specs-grid');

  let activeModelIndex = 0;
  let activeGalleryImages = [];
  let currentSlideIndex = 0;

  // تعريف قائمة المواصفات للوحدات مع أيقونة مخصصة لكل مواصفة
  const specDefinitions = [
    { key: 'totalArea', label: 'المساحة الإجمالية', icon: 'fas fa-vector-square', fontSans: true },
    { key: 'buildingArea', label: 'مساحة البناء', icon: 'fas fa-chart-area', fontSans: true },
    { key: 'roofArea', label: 'مساحة السطح الخاص', icon: 'fas fa-cloud-sun', fontSans: true },
    { key: 'bedrooms', label: 'عدد غرف النوم', icon: 'fas fa-bed' },
    { key: 'bathrooms', label: 'دورات المياه', icon: 'fas fa-bath' },
    { key: 'livingRooms', label: 'الصالة والمعيشة', icon: 'fas fa-couch' },
    { key: 'diningRooms', label: 'صالة الطعام', icon: 'fas fa-utensils' },
    { key: 'maidRoom', label: 'غرفة الخادمة', icon: 'fas fa-user-friends' },
    { key: 'balconies', label: 'عدد البلكونات', icon: 'fas fa-door-open' },
    { key: 'kitchens', label: 'المطبخ', icon: 'fas fa-sink' },
    { key: 'floors', label: 'الدور / الطابق', icon: 'fas fa-layer-group' }
  ];

  // عناصر التحكم بالفيديو ومعرض الوسائط
  const videoControls = document.getElementById('proj-video-controls');
  const videoPlayToggleBtn = document.getElementById('video-play-toggle-btn');
  const videoPlayIcon = document.getElementById('video-play-icon');
  const videoForwardBtn = document.getElementById('video-forward-btn');
  const videoRewindBtn = document.getElementById('video-rewind-btn');
  const videoMuteBtn = document.getElementById('video-mute-btn');
  const videoMuteIcon = document.getElementById('video-mute-icon');
  const videoFullscreenBtn = document.getElementById('video-fullscreen-btn');
  const prevMediaBtn = document.getElementById('proj-prev-media-btn');
  const nextMediaBtn = document.getElementById('proj-next-media-btn');

  const isVideoFile = (url) => {
    return typeof url === 'string' && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm'));
  };

  const syncPlayIcon = () => {
    if (!videoPlayIcon || !mainVideo) return;
    if (mainVideo.paused) {
      videoPlayIcon.className = 'fas fa-play text-xs mr-0.5';
    } else {
      videoPlayIcon.className = 'fas fa-pause text-xs';
    }
  };

  const updateGalleryUI = (idx) => {
    if (!activeGalleryImages || activeGalleryImages.length === 0) return;
    currentSlideIndex = (idx + activeGalleryImages.length) % activeGalleryImages.length;
    const currentMedia = activeGalleryImages[currentSlideIndex];

    if (isVideoFile(currentMedia)) {
      if (mainImg) mainImg.classList.add('hidden');
      if (mainVideo) {
        if (mainVideo.src !== currentMedia && !mainVideo.src.endsWith(currentMedia.replace(/^\.\.\//, ''))) {
          mainVideo.src = currentMedia;
        }
        mainVideo.classList.remove('hidden');
        mainVideo.play().then(syncPlayIcon).catch(() => syncPlayIcon());
      }
      if (videoControls) {
        videoControls.classList.remove('hidden');
        videoControls.classList.add('flex');
      }
    } else {
      if (mainVideo) {
        mainVideo.pause();
        mainVideo.classList.add('hidden');
        mainVideo.removeAttribute('src');
      }
      if (videoControls) {
        videoControls.classList.add('hidden');
        videoControls.classList.remove('flex');
      }
      if (mainImg) {
        mainImg.src = currentMedia;
        mainImg.classList.remove('hidden');
      }
    }

    if (galleryIndexEl) galleryIndexEl.textContent = currentSlideIndex + 1;

    if (thumbsContainer) {
      Array.from(thumbsContainer.children).forEach((thumb, i) => {
        if (i === currentSlideIndex) {
          thumb.className = 'flex-shrink-0 w-20 sm:w-24 md:w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer ring-2 ring-amber-500 opacity-100 scale-102 transition relative bg-neutral-900';
        } else {
          thumb.className = 'flex-shrink-0 w-20 sm:w-24 md:w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer opacity-70 hover:opacity-100 border border-neutral-200 transition relative bg-neutral-900';
        }
      });
    }
  };

  // ربط أزرار التحكم بالفيديو
  if (mainVideo) {
    mainVideo.addEventListener('play', syncPlayIcon);
    mainVideo.addEventListener('pause', syncPlayIcon);
    mainVideo.addEventListener('ended', syncPlayIcon);

    // النقر على الفيديو نفسه يشغل أو يوقف
    mainVideo.addEventListener('click', () => {
      if (mainVideo.paused) {
        mainVideo.play();
      } else {
        mainVideo.pause();
      }
    });
  }

  if (videoPlayToggleBtn && mainVideo) {
    videoPlayToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mainVideo.paused) {
        mainVideo.play();
      } else {
        mainVideo.pause();
      }
      syncPlayIcon();
    });
  }

  if (videoForwardBtn && mainVideo) {
    videoForwardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mainVideo.currentTime = Math.min(mainVideo.duration || Infinity, mainVideo.currentTime + 5);
    });
  }

  if (videoRewindBtn && mainVideo) {
    videoRewindBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 5);
    });
  }

  if (videoMuteBtn && mainVideo) {
    videoMuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mainVideo.muted = !mainVideo.muted;
      if (videoMuteIcon) {
        videoMuteIcon.className = mainVideo.muted ? 'fas fa-volume-mute text-xs' : 'fas fa-volume-up text-xs';
      }
    });
  }

  if (videoFullscreenBtn && mainVideo) {
    videoFullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mainVideo.requestFullscreen) {
        mainVideo.requestFullscreen();
      } else if (mainVideo.webkitRequestFullscreen) {
        mainVideo.webkitRequestFullscreen();
      }
    });
  }

  // ربط أزرار التنقل بين الصور والوسائط (السابق / التالي)
  if (prevMediaBtn) {
    prevMediaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateGalleryUI(currentSlideIndex - 1);
    });
  }

  if (nextMediaBtn) {
    nextMediaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateGalleryUI(currentSlideIndex + 1);
    });
  }

  const setupModelGallery = (images) => {
    activeGalleryImages = (images && images.length > 0)
      ? images.map(img => img.startsWith('../') ? img : `../${img}`)
      : ['../assets/images/about-luxury-villa.webp'];

    if (galleryTotalEl) galleryTotalEl.textContent = activeGalleryImages.length;
    if (thumbsContainer) {
      thumbsContainer.innerHTML = '';
      activeGalleryImages.forEach((src, i) => {
        const isVid = isVideoFile(src);
        const thumb = document.createElement('div');
        thumb.className = `flex-shrink-0 w-20 sm:w-24 md:w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition relative bg-neutral-900 ${i === 0 ? 'ring-2 ring-amber-500 opacity-100' : 'opacity-70 border border-neutral-200'}`;

        if (isVid) {
          thumb.innerHTML = `
            <video src="${src}#t=0.5" preload="metadata" class="w-full h-full object-cover pointer-events-none opacity-80"></video>
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div class="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-md">
                <i class="fas fa-play text-[10px] mr-0.5"></i>
              </div>
            </div>
            <span class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">فيديو</span>
          `;
        } else {
          thumb.innerHTML = `<img src="${src}" alt="مصغر ${i + 1}" class="w-full h-full object-cover">`;
        }

        thumb.addEventListener('click', () => updateGalleryUI(i));
        thumbsContainer.appendChild(thumb);
      });
    }
    updateGalleryUI(0);
  };

  const selectModel = (model, index) => {
    activeModelIndex = index;

    // تحديث الشارات والنصوص
    setText('proj-active-badge', model.name);
    setText('proj-specs-model-name', model.name);
    setText('proj-image-model-title', model.title || model.name);
    if (model.price) {
      const formattedPrice = Number(model.price).toLocaleString('en-US');
      setText('proj-current-price', formattedPrice);
      setText('proj-card-price-val', formattedPrice);
    }

    // تحديث المواصفات الخاصة بالنموذج
    if (specsContainer && model.specs) {
      let specsHTML = '';
      
      // إضافة نوع وتصنيف الوحدة (شقة أمامية / شقة داخلية / ملحق روف) في بداية المواصفات
      const modelType = model.badge || (model.name && model.name.includes('ملحق') ? 'ملحق روف مستقل' : (model.name && model.name.includes('أمامية') ? 'شقة أمامية' : (model.name && model.name.includes('داخلية') ? 'شقة داخلية' : '')));
      if (modelType) {
        specsHTML += `
          <div class="p-3 sm:p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 hover:bg-amber-100/60 transition text-center sm:text-right">
            <span class="text-amber-700 block mb-1 text-[11px] sm:text-xs font-bold">نوع وتصنيف الوحدة</span>
            <span class="font-bold text-neutral-900 text-xs sm:text-base flex items-center justify-center sm:justify-start gap-1.5">
              <i class="fas fa-home text-amber-600 text-xs"></i>
              ${modelType}
            </span>
          </div>
        `;
      }

      if (Array.isArray(model.specs)) {
        specsHTML += model.specs.map(item => {
          if (!item || !item.label || !item.value) return '';
          return `
            <div class="p-3 sm:p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-neutral-100/70 transition text-center sm:text-right">
              <span class="text-neutral-400 block mb-1 text-[11px] sm:text-xs font-medium">${item.label}</span>
              <span class="font-bold text-neutral-900 text-xs sm:text-base flex items-center justify-center sm:justify-start gap-1.5">
                <i class="fas fa-check-circle text-amber-500 text-xs"></i>
                <span>${item.value}</span>
              </span>
            </div>
          `;
        }).filter(Boolean).join('');
      } else if (typeof model.specs === 'object') {
        specsHTML += specDefinitions.map(def => {
          const val = model.specs[def.key];
          if (!val || String(val).trim() === '') return '';
          return `
            <div class="p-3 sm:p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-neutral-100/70 transition text-center sm:text-right">
              <span class="text-neutral-400 block mb-1 text-[11px] sm:text-xs font-medium">${def.label}</span>
              <span class="font-bold text-neutral-900 text-xs sm:text-base flex items-center justify-center sm:justify-start gap-1.5 ${def.fontSans ? 'font-sans' : ''}">
                <i class="${def.icon || 'fas fa-check'} text-amber-500 text-xs shrink-0"></i>
                <span>${val}</span>
              </span>
            </div>
          `;
        }).filter(Boolean).join('');
      }

      specsContainer.innerHTML = specsHTML;
    }

    // تحديث صور المعرض
    setupModelGallery(model.images || (model.mainImage ? [model.mainImage] : []));

    // تحديث شكل أزرار النماذج
    if (modelsGrid) {
      Array.from(modelsGrid.children).forEach((btn, i) => {
        const modelData = models[i];
        if (modelData && modelData.disabled) return;

        const isCurrent = i === activeModelIndex;
        if (isCurrent) {
          btn.className = 'py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-xl bg-amber-600 text-white font-bold text-[11px] sm:text-sm shadow-md ring-2 ring-amber-500 scale-[1.02] transition-all cursor-pointer text-center';
        } else {
          btn.className = 'py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-xl bg-neutral-50 hover:bg-white text-neutral-800 font-bold text-[11px] sm:text-sm border border-neutral-200/90 hover:border-amber-400 hover:text-amber-600 hover:shadow-sm transition-all cursor-pointer text-center';
        }
      });
    }
  };

  // دالة مساعدة لاختصار اسم الزر (مثل: نموذج A، نموذج B، ملحق A، ملحق B)
  const getShortButtonLabel = (name, fallbackIndex) => {
    if (!name) return `نموذج ${String.fromCharCode(65 + fallbackIndex)}`;
    const trimmed = name.trim();

    // فحص ما إذا كان ملحق روف
    const isRoof = /ملحق|روف/i.test(trimmed);

    // استخراج الحرف اللاتيني أو العربي (A, B, C, D... أ، ب، ج) أو الرقم
    const letterMatch = trimmed.match(/\b([A-Za-z])\b/);
    const letter = letterMatch ? letterMatch[1].toUpperCase() : '';

    if (isRoof) {
      if (letter) return `ملحق ${letter}`;
      // فحص أرقام مثل ملحق 17 أو ملحق 1
      const numMatch = trimmed.match(/\d+/);
      if (numMatch) return `ملحق ${numMatch[0]}`;
      return `ملحق ${String.fromCharCode(65 + fallbackIndex)}`;
    }

    if (letter) {
      return `نموذج ${letter}`;
    }

    // إذا كان يحتوي نموذج مع رقم أو حرف
    const modelMatch = trimmed.match(/نموذج\s*([^\s()]+)/i);
    if (modelMatch) {
      return `نموذج ${modelMatch[1]}`;
    }

    return trimmed;
  };

  // بناء الأزرار الستة للنماذج
  if (modelsGrid && models.length > 0) {
    modelsGrid.innerHTML = '';
    models.forEach((m, idx) => {
      const isDisabled = Boolean(m.disabled);
      const shortLabel = getShortButtonLabel(m.name, idx);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.modelIndex = idx;

      if (isDisabled) {
        btn.disabled = true;
        btn.className = 'py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-xl bg-neutral-100 text-neutral-400 font-bold text-[11px] sm:text-sm border border-neutral-200/60 cursor-not-allowed opacity-60 text-center select-none line-through';
        btn.textContent = shortLabel;
      } else {
        btn.className = 'py-2.5 sm:py-3 px-1.5 sm:px-4 rounded-xl bg-neutral-50 hover:bg-white text-neutral-800 font-bold text-[11px] sm:text-sm border border-neutral-200/90 hover:border-amber-400 hover:text-amber-600 hover:shadow-sm transition-all cursor-pointer text-center';
        btn.textContent = shortLabel;
        btn.addEventListener('click', () => selectModel(m, idx));
      }

      modelsGrid.appendChild(btn);
    });

    // تشغيل أول نموذج متاح (غير معطل) تلقائياً
    const firstAvailableIdx = models.findIndex(m => !m.disabled);
    const initialIdx = firstAvailableIdx !== -1 ? firstAvailableIdx : 0;
    selectModel(models[initialIdx], initialIdx);
  }

  // تفعيل القائمة المنسدلة للشاشات الصغيرة (Mobile Menu Toggle)
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle-btn');
  const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
  const mobileMenuIcon = document.getElementById('mobile-menu-icon');

  if (mobileMenuBtn && mobileMenuDropdown) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileMenuDropdown.classList.contains('hidden');
      if (isHidden) {
        mobileMenuDropdown.classList.remove('hidden');
        if (mobileMenuIcon) {
          mobileMenuIcon.classList.remove('fa-bars');
          mobileMenuIcon.classList.add('fa-times');
        }
      } else {
        mobileMenuDropdown.classList.add('hidden');
        if (mobileMenuIcon) {
          mobileMenuIcon.classList.remove('fa-times');
          mobileMenuIcon.classList.add('fa-bars');
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenuDropdown.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenuDropdown.classList.add('hidden');
        if (mobileMenuIcon) {
          mobileMenuIcon.classList.remove('fa-times');
          mobileMenuIcon.classList.add('fa-bars');
        }
      }
    });
  }

  // إظهار الصفحة بسلاسة فور اكتمال تجهيز كافة البيانات والصور لمنع الوميض أو التراكب
  const mainContentEl = document.getElementById('project-main-content');
  if (mainContentEl) {
    mainContentEl.classList.add('loaded');
  }
});
