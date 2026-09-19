/* ==========================================================================
   موقع د. معتز محمود رياض — استشاري جراحة العظام
   JavaScript خالص بدون مكتبات وبدون Backend.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- الإعدادات (عدّل هنا عند الحاجة) ---------- */
  const CONFIG = {
    // رقم واتساب بالصيغة الدولية بدون + وبدون أصفار: 20 (مصر) + 1554764748
    whatsappNumber: '201554764748',
    doctorGreeting: 'السلام عليكم د. معتز،',
    generalMessage: 'السلام عليكم د. معتز، أرغب في الاستفسار عن حجز موعد.'
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const whatsappUrl = (message) =>
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

  /* ---------- 1) سنة الحقوق ---------- */
  function initYear() {
    const year = String(new Date().getFullYear());
    $$('[data-year]').forEach((el) => { el.textContent = year; });
  }

  /* ---------- 2) روابط واتساب العامة (رسالة ترحيب جاهزة) ---------- */
  function initWhatsappLinks() {
    $$('[data-wa]').forEach((link) => { link.href = whatsappUrl(CONFIG.generalMessage); });
  }

  /* ---------- 3) قائمة الموبايل ---------- */
  function initMenu() {
    const toggle = $('.nav-toggle');
    const nav = $('#site-nav');
    if (!toggle || !nav) return;

    const setOpen = (open, returnFocus = false) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      if (!open && returnFocus) toggle.focus();
    };
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // إغلاق القائمة عند اختيار رابط
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    // إغلاق بمفتاح Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) setOpen(false, true);
    });

    // إغلاق عند الضغط خارج القائمة
    document.addEventListener('click', (event) => {
      if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    // إغلاق تلقائي عند الانتقال لشاشة كبيرة
    const desktop = window.matchMedia('(min-width: 1101px)');
    const onChange = (event) => { if (event.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- 4) تحديث القسم النشط أثناء التمرير ---------- */
  function initScrollSpy() {
    const links = $$('.site-nav a[href^="#"]');
    const linkById = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const sections = $$('main section[id]').filter((section) => linkById.has(section.id));
    const header = $('.site-header');
    if (!sections.length) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const offset = (header ? header.offsetHeight : 72) + 120;
      let current = null;

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= offset) current = section;
      });

      // عند نهاية الصفحة نعتبر آخر قسم هو النشط
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = sections[sections.length - 1];

      links.forEach((link) => {
        const active = current && link.getAttribute('href') === `#${current.id}`;
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);
    update();
  }

  /* ---------- 5) نموذج الحجز → رسالة واتساب ---------- */
  function initBookingForm() {
    const form = $('#booking-form');
    if (!form) return;

    const fields = {
      name: $('#f-name'),
      phone: $('#f-phone'),
      service: $('#f-service'),
      notes: $('#f-notes')
    };
    const status = $('.form-status', form);

    const messages = {
      name: 'اكتب اسمك الكامل.',
      phone: 'اكتب رقم هاتف صحيحًا يتكون من 8 إلى 15 رقمًا.',
      service: 'اختر الخدمة المطلوبة.'
    };

    // تحويل الأرقام العربية/الفارسية إلى أرقام لاتينية
    const toLatinDigits = (value) => value
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

    const cleanPhone = (value) => toLatinDigits(value).replace(/[\s\-().]/g, '');
    const cleanText = (value) => value.trim().replace(/\s+/g, ' ');

    const validators = {
      name: (value) => cleanText(value).length >= 3,
      phone: (value) => /^\+?\d{8,15}$/.test(cleanPhone(value)),
      service: (value) => value.trim() !== ''
    };

    const setError = (key, message) => {
      const output = $(`#err-${key}`);
      if (output) output.textContent = message || '';
      if (message) fields[key].setAttribute('aria-invalid', 'true');
      else fields[key].removeAttribute('aria-invalid');
    };

    // إزالة رسالة الخطأ فور تصحيح الحقل
    Object.keys(validators).forEach((key) => {
      const eventName = key === 'service' ? 'change' : 'input';
      fields[key].addEventListener(eventName, () => {
        if (fields[key].getAttribute('aria-invalid') === 'true' && validators[key](fields[key].value)) {
          setError(key, '');
        }
      });
    });

    const openExternal = (url) => {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault(); // منع الإرسال التقليدي
      status.replaceChildren();

      let firstInvalid = null;
      Object.keys(validators).forEach((key) => {
        const valid = validators[key](fields[key].value);
        setError(key, valid ? '' : messages[key]);
        if (!valid && !firstInvalid) firstInvalid = fields[key];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const notes = cleanText(fields.notes.value);
      const message = [
        CONFIG.doctorGreeting,
        'أرغب في حجز موعد.',
        '',
        `الاسم: ${cleanText(fields.name.value)}`,
        `رقم الهاتف: ${cleanPhone(fields.phone.value)}`,
        `الخدمة المطلوبة: ${fields.service.value}`,
        `وصف الحالة: ${notes || 'لم يُذكر'}`
      ].join('\n');

      const url = whatsappUrl(message);
      openExternal(url);

      const text = document.createTextNode('تم تجهيز رسالتك. اضغط «إرسال» داخل واتساب لإكمال طلب الحجز. ');
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.textContent = 'إذا لم يُفتح واتساب، اضغط هنا.';
      status.append(text, fallback);
    });
  }

  /* ---------- التشغيل ---------- */
  initYear();
  initWhatsappLinks();
  initMenu();
  initScrollSpy();
  initBookingForm();
})();
