const DRZEWO_ZGLOSZEN = {
  'Nagość lub aktywność seksualna': {
    'Udostępnianie prywatnych lub erotycznych obrazów': {
      podpowody2: [
        'Ktoś grozi udostępnieniem prywatnych lub erotycznych obrazów',
        'Zostały udostępnione prywatne lub erotyczne obrazy'
      ],
      wymagaWieku: true
    },
    'Wykorzystywanie seksualne': {
      wymagaWieku: true
    },
    'Nagość lub aktywność seksualna osób dorosłych': {
      podpowody2: [
        'Wygląda to na prostytucję',
        'Wygląda to na wykorzystywanie seksualne',
        'Żadne z powyższych'
      ]
    },
    'Nagość dzieci': {
      podpowody2: [
        'Możliwe wykorzystywanie seksualne dziecka',
        'Nagość dzieci'
      ]
    }
  },
  'Nękanie lub prześladowanie': {
    'Nękanie lub niechciane kontakty': {
      wymagaKto: true,
      wymagaWieku: true
    },
    'Udostępnianie prywatnych lub erotycznych obrazów': {
      podpowody2: [
        'Ktoś grozi udostępnieniem prywatnych lub erotycznych obrazów',
        'Zostały udostępnione prywatne lub erotyczne obrazy'
      ],
      wymagaWieku: true
    },
    'Spam': {}
  },
  'Samobójstwo, zachowania autodestrukcyjne lub zaburzenia odżywiania': {
    'Samobójstwo lub samookaleczenie': { wymagaWieku: true },
    'Zaburzenia odżywiania': { wymagaWieku: true }
  },
  'Przemoc, nienawiść lub wykorzystywanie': {
    'Realne zagrożenie': {},
    'Pewna osoba jest wykorzystywana': {
      podpowody2: [
        'Wygląda to na wykorzystywanie seksualne',
        'Wygląda to na handel ludźmi w celu wykorzystywania seksualnego lub w innym celu'
      ],
      wymagaWieku: true
    },
    'Wygląda to na terroryzm': {},
    'Wezwanie do przemocy': {},
    'Wygląda na przestępczość zorganizowaną': {},
    'Promowanie nienawiści': {
      podpowody2: [
        'Materiały przedstawiają zorganizowaną grupę propagującą nienawiść',
        'Publikowanie mowy nienawiści'
      ]
    },
    'Pokazywanie przemocy, śmierci lub poważnego uszczerbku na zdrowiu': {},
    'Znęcanie się nad dziećmi': {},
    'Znęcanie się nad zwierzętami': {}
  },
  'Sprzedaż lub promocja produktów podlegających ograniczeniom': {
    'Narkotyki': {
      podpowody2: [
        'Silnie uzależniające narkotyki, np. kokaina, heroina lub fentanyl',
        'Leki na receptę',
        'Inne leki'
      ]
    },
    'Broń': {},
    'Wyroby alkoholowe': {},
    'Wyroby tytoniowe': {},
    'Hazard': {},
    'Zwierzęta': {}
  },
  'Oszustwo lub podszywanie się pod inną osobę': {
    'Oszustwo': {
      podpowody2: [
        'Oszustwo dotyczące finansów lub tożsamości',
        'Oszustwo mające na celu udostępnienie prywatnych lub erotycznych obrazów',
        'Oszustwo mające na celu wykorzystywanie ludzi w pracy lub w innym kontekście'
      ],
      wiekDlaPodpowodu2: 'Oszustwo mające na celu udostępnienie prywatnych lub erotycznych obrazów'
    },
    'Wygląda na podszywanie się pod inną osobę': {}
  },
  'Spam': {},
  'Fałszywe informacje': {},
  'Własność intelektualna': {},
  'Zgłoś jako zawartość niezgodną z prawem': {
    'Własność intelektualna': {},
    'Zniesławienie': {},
    'Prośba o usunięcie danych osobowych zgodnie z RODO': {},
    'Zawartość jest niezgodna z prawem z innego powodu (na przykład mowa nienawiści, nękanie)': {}
  }
};

const KTO = ['Ja', 'Znajomy', 'Nie znam tej osoby'];
const WIEK = ['Tak', 'Nie'];

const $ = id => document.getElementById(id);

function fill(element, values) {
  element.replaceChildren(...values.map(value => new Option(value, value)));
}

fill($('powod'), Object.keys(DRZEWO_ZGLOSZEN));
fill($('kto'), KTO);
fill($('wiek'), WIEK);

function updateUI() {
  const powod = $('powod').value;
  const gałąźPowodu = DRZEWO_ZGLOSZEN[powod] || {};
  const podpowody1 = Object.keys(gałąźPowodu);
  const maPodpowody1 = podpowody1.length > 0;

  $('podpowodWrap').classList.toggle('hidden', !maPodpowody1);
  if (!maPodpowody1) {
    $('podpowod2Wrap').classList.add('hidden');
    $('ktoWrap').classList.add('hidden');
    $('wiekWrap').classList.add('hidden');
    return;
  }

  const podpowod = $('podpowod').value;
  const danePodpowodu = gałąźPowodu[podpowod] || {};

  const podpowody2 = danePodpowodu.podpowody2 || [];
  const maPodpowody2 = podpowody2.length > 0;
  $('podpowod2Wrap').classList.toggle('hidden', !maPodpowody2);

  const podpowod2 = $('podpowod2').value;

  const czyKto = (powod === 'Nękanie lub prześladowanie' && podpowod === 'Nękanie lub niechciane kontakty');
  $('ktoWrap').classList.toggle('hidden', !czyKto);

  let czyWiek = false;
  if (danePodpowodu.wymagaWieku) {
    czyWiek = true;
  } else if (powod === 'Oszustwo lub podszywanie się pod inną osobę' && podpowod2 === danePodpowodu.wiekDlaPodpowodu2) {
    czyWiek = true;
  } else if (czyKto) {
    czyWiek = true;
  }

  $('wiekWrap').classList.toggle('hidden', !czyWiek);
}

// Obsługa ukrywania pól manualnych, gdy zaznaczono tryb losowy
$('trybLosowy').addEventListener('change', () => {
  const isLosowy = $('trybLosowy').checked;
  $('manualnePola').style.opacity = isLosowy ? '0.4' : '1';
  $('manualnePola').style.pointerEvents = isLosowy ? 'none' : 'auto';
});

$('powod').addEventListener('change', () => {
  const powod = $('powod').value;
  const podpowody1 = Object.keys(DRZEWO_ZGLOSZEN[powod] || {});
  fill($('podpowod'), podpowody1);
  
  const aktualnyP1 = $('podpowod').value;
  const daneP1 = DRZEWO_ZGLOSZEN[powod][aktualnyP1] || {};
  fill($('podpowod2'), daneP1.podpowody2 || []);

  updateUI();
});

$('podpowod').addEventListener('change', () => {
  const powod = $('powod').value;
  const podpowod = $('podpowod').value;
  const daneP1 = DRZEWO_ZGLOSZEN[powod][podpowod] || {};
  fill($('podpowod2'), daneP1.podpowody2 || []);
  updateUI();
});

$('podpowod2').addEventListener('change', updateUI);
$('kto').addEventListener('change', updateUI);

const startPowod = $('powod').value;
const startP1 = Object.keys(DRZEWO_ZGLOSZEN[startPowod] || {});
fill($('podpowod'), startP1);
if (startP1.length > 0) {
  const daneStart = DRZEWO_ZGLOSZEN[startPowod][startP1[0]] || {};
  fill($('podpowod2'), daneStart.podpowody2 || []);
}
updateUI();

async function send(message) {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.id) throw new Error('Nie znaleziono aktywnej karty.');
  try {
    return await browser.tabs.sendMessage(tabs[0].id, message);
  } catch (error) {
    throw new Error('Nie można połączyć się ze skryptem na tej karcie. Odśwież stronę Facebooka i spróbuj ponownie.');
  }
}

function setStatus(text) {
  const element = $('statusText');
  if (element) element.textContent = text;
}

// Funkcja pomocnicza do losowania elementu z tablicy
const losowyElement = arr => arr[Math.floor(Math.random() * arr.length)];

$('start').addEventListener('click', async () => {
  $('start').disabled = true;
  $('stop').disabled = false;
  setStatus('Uruchamianie…');

  const countInput = parseInt($('powtorzenia').value, 10);
  const powtorzenia = isNaN(countInput) || countInput < 1 ? 1 : countInput;
  const delayInput = parseInt($('dialogDelayInput').value, 10);
  const dialogDelayMs = (isNaN(delayInput) || delayInput < 1 ? 10 : delayInput) * 1000;
  const isTrybLosowy = $('trybLosowy').checked;

  let wybraneZgłoszenie = {};

  if (isTrybLosowy) {
    // 1. Losujemy główny powód
    const kluczePowodow = Object.keys(DRZEWO_ZGLOSZEN);
    const wylosowanyPowod = losowyElement(kluczePowodow);
    wybraneZgłoszenie.powod = wylosowanyPowod;

    // 2. Pobieramy podpowody dla tego konkretnego powodu i losujemy jeden (jeśli istnieją)
    const gałąź = DRZEWO_ZGLOSZEN[wylosowanyPowod];
    const podpowody1 = Object.keys(gałąź || {});
    
    if (podpowody1.length > 0) {
      const wylosowanyP1 = losowyElement(podpowody1);
      wybraneZgłoszenie.podpowod = wylosowanyP1;
      const daneP1 = gałąź[wylosowanyP1] || {};

      // 3. Sprawdzamy czy gałąź ma 3 poziom (podpowod2) i losujemy poprawny
      const podpowody2 = daneP1.podpowody2 || [];
      if (podpowody2.length > 0) {
        wybraneZgłoszenie.podpowod2 = losowyElement(podpowody2);
      } else {
        wybraneZgłoszenie.podpowod2 = '';
      }

      // 4. Sprawdzamy czy gałąź wymaga pola "Kto"
      const czyKto = (wylosowanyPowod === 'Nękanie lub prześladowanie' && wylosowanyP1 === 'Nękanie lub niechciane kontakty');
      if (czyKto) {
        wybraneZgłoszenie.kto = losowyElement(KTO);
      } else {
        wybraneZgłoszenie.kto = '';
      }

      // 5. Sprawdzamy czy gałąź wymaga wieku
      let czyWiek = false;
      if (daneP1.wymagaWieku) {
        czyWiek = true;
      } else if (wylosowanyPowod === 'Oszustwo lub podszywanie się pod inną osobę' && wybraneZgłoszenie.podpowod2 === daneP1.wiekDlaPodpowodu2) {
        czyWiek = true;
      } else if (czyKto) {
        czyWiek = true;
      }

      if (czyWiek) {
        wybraneZgłoszenie.wiek = losowyElement(WIEK);
      } else {
        wybraneZgłoszenie.wiek = '';
      }

    } else {
      wybraneZgłoszenie.podpowod = '';
      wybraneZgłoszenie.podpowod2 = '';
      wybraneZgłoszenie.kto = '';
      wybraneZgłoszenie.wiek = '';
    }
  } else {
    // Tryb manualny (pobiera z zaznaczonych list)
    wybraneZgłoszenie = {
      powod: $('powod').value,
      podpowod: $('podpowodWrap').classList.contains('hidden') ? '' : $('podpowod').value,
      podpowod2: $('podpowod2Wrap').classList.contains('hidden') ? '' : $('podpowod2').value,
      kto: $('ktoWrap').classList.contains('hidden') ? '' : $('kto').value,
      wiek: $('wiekWrap').classList.contains('hidden') ? '' : $('wiek').value
    };
  }

  try {
    await send({
      type: 'START_QA',
      wybor: wybraneZgłoszenie,
       trybLosowy: isTrybLosowy, // Przekazujemy flage do content.js żeby losował w każdej iteracji pętli
      powtorzenia: powtorzenia,
      dialogDelay: dialogDelayMs
    });
    setStatus('Test uruchomiony.');
  } catch (error) {
    setStatus(`Błąd: ${error.message}`);
    $('start').disabled = false;
    $('stop').disabled = true;
  }
});

$('stop').addEventListener('click', async () => {
  try { await send({ type: 'STOP_QA' }); } catch (_) {}
  setStatus('Zatrzymano.');
  $('start').disabled = false;
  $('stop').disabled = true;
});

browser.runtime.onMessage.addListener(message => {
  if (message?.type === 'STATUS') setStatus(message.text);
});