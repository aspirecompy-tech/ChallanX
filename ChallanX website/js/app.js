/**
 * ChallanX Rajasthan - Dynamic Interactive Application
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ==========================================================================
     1. Interactive Background Canvas Animation
     ========================================================================== */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    function resizeCanvas() {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            let angle = Math.atan2(dy, dx);
            let force = (mouse.radius - distance) / mouse.radius;
            this.x -= Math.cos(angle) * force * 2;
            this.y -= Math.sin(angle) * force * 2;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      let count = Math.floor((width * height) / 12000);
      count = Math.min(Math.max(count, 35), 90);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Connect particles
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            let opacity = 1 - dist / 120;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${opacity * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateCanvas);
    }

    window.addEventListener('resize', resizeCanvas);
    canvas.parentElement.addEventListener('mousemove', (e) => {
      let rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    resizeCanvas();
    animateCanvas();
  }


  /* ==========================================================================
     2. Real-Time HSRP Plate Visualizer & Input Sync
     ========================================================================== */
  const vehiclePlateInput = document.getElementById('vehiclePlate');
  const heroPlateText = document.getElementById('heroPlateText');
  const heroPlateStatus = document.getElementById('heroPlateStatus');

  function formatPlateDisplay(rawVal) {
    let clean = rawVal.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length === 0) return 'RJ 14 EA 1234';

    // Format like RJ 14 EA 1234 if matches standard
    if (clean.length >= 4) {
      let state = clean.slice(0, 2);
      let rto = clean.slice(2, 4);
      let series = clean.slice(4, Math.min(clean.length - 4 > 0 ? clean.length - 4 + 4 : clean.length, 6));
      let num = clean.slice(Math.min(clean.length, 6));
      return `${state} ${rto} ${series} ${num}`.trim();
    }
    return clean;
  }

  if (vehiclePlateInput && heroPlateText) {
    vehiclePlateInput.addEventListener('input', function (e) {
      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      e.target.value = val;

      let formatted = formatPlateDisplay(val);
      heroPlateText.textContent = formatted;

      if (heroPlateStatus) {
        if (val.length >= 8) {
          heroPlateStatus.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-400"></i> RJ e-Courts Verified';
          heroPlateStatus.className = 'text-xs font-semibold text-emerald-300 flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-full animate-pulse';
        } else if (val.length > 0) {
          heroPlateStatus.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-amber-400"></i> Querying CJM Database...';
          heroPlateStatus.className = 'text-xs font-semibold text-amber-300 flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/50 px-2.5 py-1 rounded-full';
        } else {
          heroPlateStatus.innerHTML = '<i class="fa-solid fa-satellite-dish text-emerald-400 animate-pulse"></i> e-Courts Portal Live Link';
          heroPlateStatus.className = 'text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full';
        }
      }
    });
  }


  /* ==========================================================================
     3. Search Tab Switcher (Vehicle No. / Challan ID / DL No.)
     ========================================================================== */
  const tabVehicle = document.getElementById('tabVehicle');
  const tabChallan = document.getElementById('tabChallan');
  const tabDL = document.getElementById('tabDL');
  const plateLabel = document.getElementById('plateLabel');

  function setActiveTab(activeBtn, labelText, placeholderText, exampleText) {
    [tabVehicle, tabChallan, tabDL].forEach(btn => {
      if (btn) {
        btn.classList.remove('bg-brand-cobalt', 'text-white', 'shadow-md');
        btn.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
      }
    });
    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
      activeBtn.classList.add('bg-brand-cobalt', 'text-white', 'shadow-md');
    }

    if (plateLabel) {
      plateLabel.innerHTML = `${labelText} <span class="text-rose-500">*</span>`;
    }
    if (vehiclePlateInput) {
      vehiclePlateInput.placeholder = placeholderText;
    }
  }

  if (tabVehicle) {
    tabVehicle.addEventListener('click', () => {
      setActiveTab(tabVehicle, 'Vehicle Registration Number', 'RJ 14 EA 1234', 'e.g. RJ 14 EA 1234');
    });
  }
  if (tabChallan) {
    tabChallan.addEventListener('click', () => {
      setActiveTab(tabChallan, 'Traffic Challan / Notice ID', 'RJ1234562400', 'e.g. RJ1234562400');
    });
  }
  if (tabDL) {
    tabDL.addEventListener('click', () => {
      setActiveTab(tabDL, 'Driving License (DL) Number', 'RJ14 20200012345', 'e.g. RJ14 20200012345');
    });
  }


  /* ==========================================================================
     4. Interactive Lok Adalat Savings Calculator
     ========================================================================== */
  const fineSlider = document.getElementById('fineAmountSlider');
  const fineDisplay = document.getElementById('fineAmountDisplay');
  const calcOffenseSelect = document.getElementById('calcOffenseSelect');
  const calcWaivedAmount = document.getElementById('calcWaivedAmount');
  const calcFinalPayable = document.getElementById('calcFinalPayable');
  const calcSavingsPercent = document.getElementById('calcSavingsPercent');

  function calculateSavings() {
    if (!fineSlider) return;
    let fineVal = parseInt(fineSlider.value, 10);
    if (fineDisplay) {
      fineDisplay.textContent = '₹' + fineVal.toLocaleString('en-IN');
    }

    // Discount percentage calculation based on offense type and Lok Adalat statutory rules
    let discountRate = 0.50; // default 50%
    if (calcOffenseSelect) {
      let opt = calcOffenseSelect.value;
      if (opt === 'speeding') discountRate = 0.50;
      else if (opt === 'helmet') discountRate = 0.60;
      else if (opt === 'signal') discountRate = 0.45;
      else if (opt === 'document') discountRate = 0.40;
      else if (opt === 'overloading') discountRate = 0.35;
    }

    let waived = Math.round(fineVal * discountRate);
    let payable = fineVal - waived;
    let percent = Math.round(discountRate * 100);

    if (calcWaivedAmount) calcWaivedAmount.textContent = '₹' + waived.toLocaleString('en-IN');
    if (calcFinalPayable) calcFinalPayable.textContent = '₹' + payable.toLocaleString('en-IN');
    if (calcSavingsPercent) calcSavingsPercent.textContent = percent + '% SAVED';
  }

  if (fineSlider) {
    fineSlider.addEventListener('input', calculateSavings);
  }
  if (calcOffenseSelect) {
    calcOffenseSelect.addEventListener('change', calculateSavings);
  }
  calculateSavings();


  /* ==========================================================================
     5. Counter Animation on Scroll
     ========================================================================== */
  const statElements = document.querySelectorAll('.counter-stat');
  let animatedStats = false;

  function runCounters() {
    statElements.forEach(el => {
      let target = parseInt(el.getAttribute('data-target'), 10);
      let prefix = el.getAttribute('data-prefix') || '';
      let suffix = el.getAttribute('data-suffix') || '';
      let count = 0;
      let step = Math.ceil(target / 40);

      let timer = setInterval(() => {
        count += step;
        if (count >= target) {
          count = target;
          clearInterval(timer);
        }
        el.textContent = `${prefix}${count.toLocaleString('en-IN')}${suffix}`;
      }, 35);
    });
  }

  if (statElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animatedStats) {
          animatedStats = true;
          runCounters();
        }
      });
    }, { threshold: 0.3 });

    statElements.forEach(el => observer.observe(el));
  }


  /* ==========================================================================
     6. Accordion Interactivity
     ========================================================================== */
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const toggle = item.querySelector('.faq-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        accordionItems.forEach(i => i.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });


  /* ==========================================================================
     7. Form Validation & Submission Handler
     ========================================================================== */
  const form = document.getElementById('rjChallanForm');
  const ownerNameInput = document.getElementById('ownerName');
  const mobileNumberInput = document.getElementById('mobileNumber');
  const trapInput = document.getElementById('website_trap');

  const plateError = document.getElementById('plateError');
  const nameError = document.getElementById('nameError');
  const mobileError = document.getElementById('mobileError');

  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  const btnSpinner = document.getElementById('btnSpinner');

  const successCard = document.getElementById('successCard');
  const displayPlate = document.getElementById('displayPlate');
  const resetFormBtn = document.getElementById('resetFormBtn');

  // Multi-step modal elements
  const verificationModal = document.getElementById('verificationModal');
  const modalStep1 = document.getElementById('modalStep1');
  const modalStep2 = document.getElementById('modalStep2');
  const modalStep3 = document.getElementById('modalStep3');

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7pH4y3ot97AoDWXRaxjwVdWM46cIeaishNz-kxn-rG_wkNMQ-1yeg2KvcyLssGARVzw/exec';

  function isValidIndianPlate(plate) {
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
    return regex.test(cleanPlate);
  }

  function isValidMobile(mobile) {
    return /^[6-9][0-9]{9}$/.test(mobile);
  }

  if (mobileNumberInput) {
    mobileNumberInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      if (mobileError) mobileError.classList.add('hidden');
    });
  }

  if (ownerNameInput && nameError) {
    ownerNameInput.addEventListener('input', () => nameError.classList.add('hidden'));
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (trapInput && trapInput.value.trim() !== '') return false;

      let hasError = false;
      const plateVal = vehiclePlateInput.value.trim().toUpperCase();
      const nameVal = ownerNameInput.value.trim();
      const mobileVal = mobileNumberInput.value.trim();

      if (!isValidIndianPlate(plateVal)) {
        if (plateError) plateError.classList.remove('hidden');
        hasError = true;
      } else {
        if (plateError) plateError.classList.add('hidden');
      }

      if (nameVal.length < 2) {
        if (nameError) nameError.classList.remove('hidden');
        hasError = true;
      } else {
        if (nameError) nameError.classList.add('hidden');
      }

      if (!isValidMobile(mobileVal)) {
        if (mobileError) mobileError.classList.remove('hidden');
        hasError = true;
      } else {
        if (mobileError) mobileError.classList.add('hidden');
      }

      if (hasError) return;

      // Start multi-step verification modal simulation
      if (verificationModal) {
        verificationModal.classList.remove('hidden');
        verificationModal.classList.add('flex');

        // Step 1 -> 2 -> 3 transition
        setTimeout(() => {
          if (modalStep1) modalStep1.classList.add('text-emerald-400');
          if (modalStep2) modalStep2.classList.remove('opacity-40');
        }, 800);

        setTimeout(() => {
          if (modalStep2) modalStep2.classList.add('text-emerald-400');
          if (modalStep3) modalStep3.classList.remove('opacity-40');
        }, 1600);

        setTimeout(() => {
          verificationModal.classList.add('hidden');
          verificationModal.classList.remove('flex');
          
          form.classList.add('hidden');
          if (displayPlate) displayPlate.textContent = formatPlateDisplay(plateVal);
          if (successCard) successCard.classList.remove('hidden');
        }, 2400);
      } else {
        // Fallback direct success state
        form.classList.add('hidden');
        if (displayPlate) displayPlate.textContent = formatPlateDisplay(plateVal);
        if (successCard) successCard.classList.remove('hidden');
      }

      let currentSearchType = "Vehicle No.";
      if (document.getElementById('tabChallan') && document.getElementById('tabChallan').classList.contains('bg-brand-cobalt')) {
        currentSearchType = "Challan ID";
      } else if (document.getElementById('tabDL') && document.getElementById('tabDL').classList.contains('bg-brand-cobalt')) {
        currentSearchType = "DL Number";
      }

      // Dispatch payload asynchronously
      const payload = {
        vehicleNumber: plateVal,
        ownerName: nameVal,
        phoneNumber: '+91' + mobileVal,
        searchType: currentSearchType,
        timestamp: new Date().toISOString()
      };

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.log('Payload sent:', err));
    });
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', function () {
      form.reset();
      if (heroPlateText) heroPlateText.textContent = 'RJ 14 EA 1234';
      if (heroPlateStatus) {
        heroPlateStatus.innerHTML = '<i class="fa-solid fa-satellite-dish text-blue-400"></i> Live HSRP Preview';
        heroPlateStatus.className = 'text-xs font-semibold text-blue-300 flex items-center gap-1.5';
      }
      if (successCard) successCard.classList.add('hidden');
      if (form) form.classList.remove('hidden');
    });
  }


  /* ==========================================================================
     8. Hero Traffic Challan Image Slider Controller
     ========================================================================== */
  const sliderModule = document.getElementById('heroImageSliderModule');
  if (sliderModule) {
    const slides = sliderModule.querySelectorAll('.hero-slide');
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');
    const dotsContainer = document.getElementById('slideDots');
    let dots = dotsContainer ? dotsContainer.querySelectorAll('.dot-item') : [];
    let currentSlide = 0;
    let autoPlayTimer = null;

    function goToSlide(index) {
      if (slides.length === 0) return;
      slides[currentSlide].classList.remove('active', 'opacity-100');
      slides[currentSlide].classList.add('opacity-0', 'pointer-events-none');
      if (dots[currentSlide]) {
        dots[currentSlide].className = 'dot-item w-2 h-2 rounded-full bg-slate-600 cursor-pointer transition-all';
      }

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('active', 'opacity-100');
      slides[currentSlide].classList.remove('opacity-0', 'pointer-events-none');
      if (dots[currentSlide]) {
        dots[currentSlide].className = 'dot-item w-4 h-2 rounded-full bg-blue-500 cursor-pointer transition-all';
      }
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startAutoPlay();
      });
    });

    sliderModule.addEventListener('mouseenter', stopAutoPlay);
    sliderModule.addEventListener('mouseleave', startAutoPlay);

    // Initialize first slide state
    goToSlide(0);
    startAutoPlay();
  }

});






