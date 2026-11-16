# GRAFIK Ankiety 0.9 — GitHub Pages + Google Drive (test)

## 1. Apps Script
W istniejącym projekcie Google Apps Script zastąp cały plik `Code.gs` kodem z paczki. Funkcja `testZapisuCSV` i Anna Testowa nie będą już istnieć. Zapisz.

## 2. Wdrożenie
Kliknij **Wdróż → Nowe wdrożenie → Aplikacja internetowa**. Uruchamiaj jako **Ja**, dostęp **Każdy** (jeżeli opcja jest dostępna). Zatwierdź uprawnienia i skopiuj URL kończący się na `/exec`. UWAGA: publiczny endpoint może być spamowany i zużywać limit Dysku — używaj tylko do krótkich testów na fikcyjnych danych, nie udostępniaj szeroko.

## 3. Konfiguracja GitHub
W pliku `config.js` wpisz URL jako wartość `window.GRAFIK_APPS_SCRIPT_URL`. Zastąp pliki repozytorium zawartością tej paczki, wykonaj commit i push. Odśwież stronę (Ctrl+F5).

## 4. Test
Wpisz fikcyjne imię i nazwisko, zaznacz dni i kliknij **Wyślij ankietę**. Sprawdź folder na Dysku Google i w razie problemów **Apps Script → Wykonania**. Strona nie ma wiarygodnego potwierdzenia zapisu, więc przed ponowieniem sprawdź Dysk.

## Ograniczenia
Każde wysłanie tworzy nowy plik z losowym identyfikatorem. Brak nadpisywania zgłoszeń, weryfikacji tożsamości i zabezpieczonego panelu administracyjnego. `admin.html` jest informacyjne. Do prawdziwych danych pracowników niezbędna jest akceptacja organizacji, uwierzytelnianie, zabezpieczenia przed nadużyciami i procedury RODO.
