'use strict';

/*
 * Background script rozszerzenia.
 *
 * Content script wysyła STATUS bezpośrednio przez runtime.
 * Nie przekazujemy STATUS ponownie.
 *
 * Dzięki temu nie powstaje problem:
 *
 * "Could not establish connection.
 *  Receiving end does not exist."
 */

browser.runtime.onMessage.addListener(
  message => {

    if (!message) {
      return;
    }

    /*
     * STATUS jest obsługiwany przez popup,
     * jeżeli popup jest aktualnie otwarty.
     *
     * Nie robimy tutaj drugiego sendMessage().
     */
    if (message.type === 'STATUS') {
      return;
    }

  }
);