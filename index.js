/**
 * Alt Motors Togo - Module Estimer & Vendre ma voiture
 * Logic & Interactions
 */

// Application State
const state = {
  currentStep: 1,
  car: {
    brand: '',
    model: '',
    year: '',
    mileage: 0,
    fuel: 'Essence',
    transmission: 'Automatique',
    condition: 'Excellent',
    photos: []
  },
  estimation: {
    basePrice: 0,
    minPrice: 0,
    maxPrice: 0,
    saleOption: 'RACHAT_CASH'
  },
  appointment: {
    name: '',
    phone: '',
    email: '',
    location: '',
    date: '',
    time: '09:00'
  }
};

// DOM Content Loaded Initializer
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('car-year').max = new Date().getFullYear();
  setupEventListeners();
  setMinRdvDate();
});

// Set Minimum Date for RDV (Today)
function setMinRdvDate() {
  const dateInput = document.getElementById('rdv-date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Buttons
  document.getElementById('btn-to-step-2').addEventListener('click', goToStep2);
  document.getElementById('btn-back-to-step-1').addEventListener('click', () => switchStep(1));
  document.getElementById('btn-to-step-3').addEventListener('click', () => switchStep(3));
  document.getElementById('btn-back-to-step-2').addEventListener('click', () => switchStep(2));
  document.getElementById('btn-submit-final').addEventListener('click', submitFinal);

  // Drag and Drop Upload
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('bg-slate-100');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('bg-slate-100');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('bg-slate-100');
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelect();
    }
  });
}

// File Selection Handler
function handleFileSelect() {
  const fileInput = document.getElementById('file-input');
  const previewContainer = document.getElementById('photos-preview');
  previewContainer.innerHTML = '';

  if (fileInput.files.length > 0) {
    previewContainer.classList.remove('hidden');
    Array.from(fileInput.files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgWrapper = document.createElement('div');
          imgWrapper.className = 'relative h-16 rounded overflow-hidden border border-slate-200';
          imgWrapper.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover" />`;
          previewContainer.appendChild(imgWrapper);
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Step Switcher UI
function switchStep(stepNumber) {
  state.currentStep = stepNumber;

  // Toggle Content Visibility
  document.getElementById('step-1-content').classList.toggle('hidden', stepNumber !== 1);
  document.getElementById('step-2-content').classList.toggle('hidden', stepNumber !== 2);
  document.getElementById('step-3-content').classList.toggle('hidden', stepNumber !== 3);

  // Update Stepper Progress Line
  const progressLine = document.getElementById('step-line-progress');
  if (stepNumber === 1) progressLine.style.width = '0%';
  if (stepNumber === 2) progressLine.style.width = '50%';
  if (stepNumber === 3) progressLine.style.width = '100%';

  // Update Step Dots & Labels
  updateStepDot(1, stepNumber >= 1, stepNumber === 1);
  updateStepDot(2, stepNumber >= 2, stepNumber === 2);
  updateStepDot(3, stepNumber >= 3, stepNumber === 3);

  window.scrollTo({ top: 180, behavior: 'smooth' });
}

function updateStepDot(num, isActive, isCurrent) {
  const dot = document.getElementById(`step-dot-${num}`);
  const label = document.getElementById(`step-label-${num}`);

  if (isActive) {
    dot.className = 'w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors';
    label.className = 'text-xs font-semibold text-slate-900 mt-2';
  } else {
    dot.className = 'w-9 h-9 rounded-full bg-white border-2 border-slate-300 text-slate-500 flex items-center justify-center font-bold text-sm transition-colors';
    label.className = 'text-xs font-medium text-slate-500 mt-2';
  }
}

// Validate & Go to Step 2
function goToStep2() {
  const brand = document.getElementById('car-brand').value.trim();
  const model = document.getElementById('car-model').value.trim();
  const year = document.getElementById('car-year').value;
  const numericYear = Number(year);
  const currentYear = new Date().getFullYear();
  const mileage = parseInt(document.getElementById('car-mileage').value) || 0;

  if (!brand || !model || !year || !Number.isInteger(numericYear) || numericYear < 1886 || numericYear > currentYear || !mileage) {
    alert('Veuillez remplir correctement la marque, le modèle, l\'année et le kilométrage.');
    return;
  }

  // Save values into state
  state.car.brand = brand;
  state.car.model = model;
  state.car.year = year;
  state.car.mileage = mileage;
  state.car.fuel = document.getElementById('car-fuel').value;
  state.car.transmission = document.getElementById('car-transmission').value;
  
  const conditionEl = document.querySelector('input[name="car-condition"]:checked');
  state.car.condition = conditionEl ? conditionEl.value : 'Excellent';

  // Calculate Price Estimation
  calculateEstimation();

  // Move to Step 2
  switchStep(2);
}

// Estimation Calculation Engine (Local Togo Market Adjustments)
function calculateEstimation() {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - parseInt(state.car.year));

  // Base values per brand category
  let baseVal = 7500000; 

  const brandUpper = state.car.brand.toUpperCase();
  if (['TOYOTA', 'HYUNDAI', 'KIA', 'NISSAN'].includes(brandUpper)) {
    baseVal = 9500000;
  } else if (['MERCEDES-BENZ', 'BMW', 'LAND ROVER'].includes(brandUpper)) {
    baseVal = 18000000;
  }

  // Depreciation for age (approx 8% per year)
  let depreciated = baseVal * Math.pow(0.92, age);

  // Mileage penalty
  const excessMileage = Math.max(0, state.car.mileage - (age * 15000));
  const mileagePenalty = (excessMileage / 10000) * 200000;
  depreciated -= mileagePenalty;

  // Condition multiplier
  if (state.car.condition === 'Bon') depreciated *= 0.90;
  if (state.car.condition === 'A_reparer') depreciated *= 0.75;

  // Flooring price
  const estimatedBase = Math.max(2500000, Math.round(depreciated / 100000) * 100000);
  const minEst = Math.round((estimatedBase * 0.92) / 100000) * 100000;
  const maxEst = Math.round((estimatedBase * 1.08) / 100000) * 100000;

  state.estimation.basePrice = estimatedBase;
  state.estimation.minPrice = minEst;
  state.estimation.maxPrice = maxEst;

  // Update UI Elements
  document.getElementById('estimated-price').textContent = formatFCFA(estimatedBase);
  document.getElementById('price-range-text').textContent = `Fourchette estimée : ${formatFCFA(minEst)} - ${formatFCFA(maxEst)}`;
}

// Format Numbers to FCFA
function formatFCFA(amount) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

// Select Sale Option Card
function selectSaleOption(option) {
  state.estimation.saleOption = option;

  const cardRachat = document.getElementById('card-option-rachat');
  const cardDepot = document.getElementById('card-option-depot');
  const radioRachat = document.getElementById('radio-rachat');
  const radioDepot = document.getElementById('radio-depot');

  if (option === 'RACHAT_CASH') {
    radioRachat.checked = true;
    cardRachat.className = 'border-2 border-rose-600 bg-rose-50/30 rounded-lg p-4 cursor-pointer relative transition-all';
    cardDepot.className = 'border-2 border-slate-200 hover:border-slate-300 rounded-lg p-4 cursor-pointer relative transition-all';
  } else {
    radioDepot.checked = true;
    cardDepot.className = 'border-2 border-rose-600 bg-rose-50/30 rounded-lg p-4 cursor-pointer relative transition-all';
    cardRachat.className = 'border-2 border-slate-200 hover:border-slate-300 rounded-lg p-4 cursor-pointer relative transition-all';
  }
}

// Final Submit
function submitFinal() {
  const name = document.getElementById('owner-name').value.trim();
  const phone = document.getElementById('owner-phone').value.trim();
  const location = document.getElementById('owner-location').value.trim();
  const rdvDate = document.getElementById('rdv-date').value;
  const rdvTime = document.getElementById('rdv-time').value;

  if (!name || !phone || !location || !rdvDate) {
    alert('Veuillez remplir vos coordonnées et choisir une date de rendez-vous.');
    return;
  }

  state.appointment.name = name;
  state.appointment.phone = phone;
  state.appointment.email = document.getElementById('owner-email').value.trim();
  state.appointment.location = location;
  state.appointment.date = rdvDate;
  state.appointment.time = rdvTime;

  // Build Modal Summary
  document.getElementById('summary-car').textContent = `${state.car.brand} ${state.car.model} (${state.car.year})`;
  document.getElementById('summary-price').textContent = formatFCFA(state.estimation.basePrice);
  document.getElementById('summary-option').textContent = state.estimation.saleOption === 'RACHAT_CASH' ? 'Rachat Cash 24h' : 'Dépôt-Vente Marketplace';
  document.getElementById('summary-rdv').textContent = `${rdvDate} à ${rdvTime}`;

  // Build WhatsApp URL
  const optionLabel = state.estimation.saleOption === 'RACHAT_CASH' ? 'Rachat Cash 24h' : 'Dépôt-Vente';
  const textMessage = `*DEMANDE D'ESTIMATION & VENTE - ALT MOTORS*\n\n` +
    `🚘 *Véhicule :* ${state.car.brand} ${state.car.model} (${state.car.year})\n` +
    `🛣️ *Kilométrage :* ${state.car.mileage.toLocaleString()} km\n` +
    `⛽ *Carburant :* ${state.car.fuel} | *Boîte :* ${state.car.transmission}\n` +
    `🔧 *État :* ${state.car.condition}\n\n` +
    `💰 *Cote estimée :* ${formatFCFA(state.estimation.basePrice)}\n` +
    `🎯 *Option choisie :* ${optionLabel}\n\n` +
    `👤 *Propriétaire :* ${state.appointment.name}\n` +
    `📞 *Téléphone :* +228 ${state.appointment.phone}\n` +
    `📍 *Localisation :* ${state.appointment.location}\n` +
    `📅 *RDV Inspection :* ${state.appointment.date} à ${state.appointment.time}`;

  const encodedMsg = encodeURIComponent(textMessage);
  const waUrl = `https://wa.me/22897759232?text=${encodedMsg}`;

  document.getElementById('btn-whatsapp-redirect').href = waUrl;

  // Show Modal
  document.getElementById('modal-success').classList.remove('hidden');
}

// Close Modal
function closeModal() {
  document.getElementById('modal-success').classList.add('hidden');
  switchStep(1);
}