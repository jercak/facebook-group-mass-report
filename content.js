(() => {
  'use strict';

  let stopped = false;
  let running = false;
  let dynamicDialogDelay = 10000;

  const DRZEWO_ZGLOSZEN = {
    'Nagość lub aktywność seksualna': {
      'Udostępnianie prywatnych lub erotycznych obrazów': {
        podpowody2: [
          'Ktoś grozi udostępnieniem prywatnych lub erotycznych obrazów',
          'Zostały udostępnione prywatne lub erotyczne obrazy'
        ],
        wymagaWieku: true
      },
      'Wykorzystywanie seksualne': { wymagaWieku: true },
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
      'Nękanie lub niechciane kontakty': { wymagaKto: true, wymagaWieku: true },
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
      'Broń': {}, 'Wyroby alkoholowe': {}, 'Wyroby tytoniowe': {}, 'Hazard': {}, 'Zwierzęta': {}
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
    'Spam': {}, 'Fałszywe informacje': {}, 'Własność intelektualna': {},
    'Zgłoś jako zawartość niezgodną z prawem': {
      'Własność intelektualna': {}, 'Zniesławienie': {},
      'Prośba o usunięcie danych osobowych zgodnie z RODO': {},
      'Zawartość jest niezgodna z prawem z innego powodu (na przykład mowa nienawiści, nękanie)': {}
    }
  };

  const KTO = ['Ja', 'Znajomy', 'Nie znam tej osoby'];
  const WIEK = ['Tak', 'Nie'];
  const losowyElement = arr => arr[Math.floor(Math.random() * arr.length)];

  function generujLosowyWybor() {
    const kluczePowodow = Object.keys(DRZEWO_ZGLOSZEN);
    const powod = losowyElement(kluczePowodow);
    const gałąź = DRZEWO_ZGLOSZEN[powod];
    const podpowody1 = Object.keys(gałąź || {});
    
    let podpowod = '';
    let podpowod2 = '';
    let kto = '';
    let wiek = '';

    if (podpowody1.length > 0) {
      podpowod = losowyElement(podpowody1);
      const daneP1 = gałąź[podpowod] || {};

      const podpowody2 = daneP1.podpowody2 || [];
      if (podpowody2.length > 0) {
        podpowod2 = losowyElement(podpowody2);
      }

      const czyKto = (powod === 'Nękanie lub prześladowanie' && podpowod === 'Nękanie lub niechciane kontakty');
      if (czyKto) {
        kto = losowyElement(KTO);
      }

      let czyWiek = false;
      if (daneP1.wymagaWieku) {
        czyWiek = true;
      } else if (powod === 'Oszustwo lub podszywanie się pod inną osobę' && podpowod2 === daneP1.wiekDlaPodpowodu2) {
        czyWiek = true;
      } else if (czyKto) {
        czyWiek = true;
      }

      if (czyWiek) {
        wiek = losowyElement(WIEK);
      }
    }

    return { powod, podpowod, podpowod2, kto, wiek };
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const AFTER_CLICK_DELAY = 1500;

  function status(text) {
    console.log('[Facebook Report QA]', text);
    try {
      browser.runtime.sendMessage({ type: 'STATUS', text }).catch(() => {});
    } catch (_) {}
  }

  function normalizeText(text) {
    return String(text || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function jestWidoczny(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function znajdzAktualnyDialog() {
    const dialogi = [...document.querySelectorAll('[role="dialog"]')];
    const widoczne = dialogi.filter(jestWidoczny);
    return widoczne.length ? widoczne[widoczne.length - 1] : null;
  }

  function znajdzDokladnyTekst(kontener, tekst) {
    if (!kontener) return null;
    const szukany = normalizeText(tekst);
    const elementy = [...kontener.querySelectorAll('*')];
    for (const element of elementy) {
      if (element.children.length !== 0) continue;
      if (normalizeText(element.textContent) === szukany) return element;
    }
    return null;
  }

  function znajdzTekstWAktualnymWidoku(tekst) {
    const dialog = znajdzAktualnyDialog();
    if (dialog) {
      const element = znajdzDokladnyTekst(dialog, tekst);
      if (element) return { element, kontener: dialog };
    }
    const element = znajdzDokladnyTekst(document.body, tekst);
    if (element && jestWidoczny(element)) return { element, kontener: document.body };
    return null;
  }

  function znajdzPrzycisk(element) {
    if (!element) return null;
    const przycisk = element.closest('[role="button"]');
    if (przycisk) return przycisk;
    let rodzic = element.parentElement;
    for (let i = 0; rodzic && i < 10; i++) {
      const role = rodzic.getAttribute('role');
      if (role === 'button' || role === 'option' || role === 'menuitem') return rodzic;
      rodzic = rodzic.parentElement;
    }
    return element;
  }

  async function kliknijOpcje(tekst) {
    status(`Szukam opcji: „${tekst}”…`);
    const start = Date.now();
    let znaleziono = null;

    while (!stopped && Date.now() - start < 15000) {
      znaleziono = znajdzTekstWAktualnymWidoku(tekst);
      if (znaleziono) break;
      await sleep(300);
    }

    if (stopped) throw new Error('Test zatrzymany.');
    if (!znaleziono) throw new Error(`Nie znaleziono opcji: „${tekst}”`);

    const przycisk = znajdzPrzycisk(znaleziono.element);
    if (!przycisk) throw new Error(`Znaleziono tekst „${tekst}”, ale brak elementu do kliknięcia.`);

    try { przycisk.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (_) {}
    await sleep(500);
    if (stopped) throw new Error('Test zatrzymany.');

    status(`Klikam: „${tekst}”…`);
    przycisk.click();
    await sleep(AFTER_CLICK_DELAY);
  }

  async function czekajNaFormularz() {
    status('Czekam na pojawienie się formularza…');
    const start = Date.now();
    while (!stopped && Date.now() - start < 15000) {
      const dialog = znajdzAktualnyDialog();
      if (dialog) {
        status(`Formularz wykryty. Czekam ${dynamicDialogDelay / 1000} sekund na załadowanie opcji…`);
        await sleep(dynamicDialogDelay);
        if (stopped) throw new Error('Test zatrzymany.');
        const aktualny = znajdzAktualnyDialog();
        if (aktualny) return aktualny;
      }
      await sleep(250);
    }
    if (stopped) throw new Error('Test zatrzymany.');
    throw new Error('Nie znaleziono widocznego formularza.');
  }

  async function czekajNa(selector, timeout = 15000) {
    const start = Date.now();
    while (!stopped && Date.now() - start < timeout) {
      const visible = [...document.querySelectorAll(selector)].find(jestWidoczny);
      if (visible) return visible;
      await sleep(250);
    }
    if (stopped) throw new Error('Test zatrzymany.');
    throw new Error(`Nie znaleziono widocznego elementu: ${selector}`);
  }

  async function wykonajPojedynczeZgloszenie(wybor) {
    status('Szukam menu grupy…');
    const menuWiecej = await czekajNa('[role="button"][aria-label="Więcej"]');
    if (stopped) return;

    status('Znaleziono menu „Więcej”. Otwieram…');
    menuWiecej.click();
    await sleep(1500);

    if (stopped) return;
    status('Szukam „Zgłoś grupę”…');
    await kliknijOpcje('Zgłoś grupę');

    if (stopped) return;
    await czekajNaFormularz();
    status(`Wybieram powód: ${wybor.powod}`);
    await kliknijOpcje(wybor.powod);

    if (wybor.podpowod && wybor.podpowod.trim() !== '') {
      if (stopped) return;
      await czekajNaFormularz();
      status(`Wybieram szczegół: ${wybor.podpowod}`);
      await kliknijOpcje(wybor.podpowod);
    }

    if (wybor.podpowod2 && wybor.podpowod2.trim() !== '') {
      if (stopped) return;
      await czekajNaFormularz();
      status(`Wybieram konkretny problem: ${wybor.podpowod2}`);
      await kliknijOpcje(wybor.podpowod2);
    }

    if (wybor.kto && wybor.kto.trim() !== '') {
      if (stopped) return;
      await czekajNaFormularz();
      status(`Wybieram osobę: ${wybor.kto}`);
      await kliknijOpcje(wybor.kto);
    }

    if (wybor.wiek && wybor.wiek.trim() !== '') {
      if (stopped) return;
      await czekajNaFormularz();
      status(`Wybieram odpowiedź o wiek: ${wybor.wiek}`);
      await kliknijOpcje(wybor.wiek);
    }

    if (stopped) return;
    await czekajNaFormularz();
    status('Wysyłam zgłoszenie (klikam „Prześlij”)…');
    await kliknijOpcje('Prześlij');

    if (stopped) return;
    await czekajNaFormularz();
    status('Klikam „Dalej”…');
    await kliknijOpcje('Dalej');

    if (stopped) return;
    await czekajNaFormularz();
    status('Klikam końcowe „Gotowe”…');
    await kliknijOpcje('Gotowe');
  }

  async function rozpocznSciezke(bazowyWybor, liczbaPowtorzen, trybLosowy) {
    if (running) return;
    running = true;
    stopped = false;

    try {
      for (let i = 1; i <= liczbaPowtorzen; i++) {
        if (stopped) break;

        // Jeśli włączony jest tryb losowy, dla każdego powtórzenia generujemy nową, spójną gałąź
        const aktualnyWybor = trybLosowy ? generujLosowyWybor() : bazowyWybor;

        status(`Rozpoczynam cykl ${i} z ${liczbaPowtorzen} (Powód: ${aktualnyWybor.powod})…`);
        await wykonajPojedynczeZgloszenie(aktualnyWybor);
        if (stopped) break;

        if (i < liczbaPowtorzen) {
          status(`Zgłoszenie ${i} ukończone. Czekam 3 sekundy…`);
          await sleep(3000);
        }
      }
      status(!stopped ? 'Wszystkie zgłoszenia ukończone!' : 'Zatrzymano.');
    } catch (error) {
      status(error?.message === 'Test zatrzymany.' ? 'Zatrzymano.' : `Błąd: ${error.message}`);
    } finally {
      running = false;
    }
  }

  try {
    browser.runtime.onMessage.addListener(message => {
      if (!message) return;
      if (message.type === 'STOP_QA') {
        stopped = true;
        status('Zatrzymywanie…');
      }
      if (message.type === 'START_QA') {
        if (message.dialogDelay) dynamicDialogDelay = message.dialogDelay;
        rozpocznSciezke(message.wybor || {}, message.powtorzenia || 1, message.trybLosowy || false);
      }
    });
  } catch (_) {}
})();