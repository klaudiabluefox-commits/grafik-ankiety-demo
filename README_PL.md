# GRAFIK Ankiety 0.7 — podgląd GitHub Pages

Ta paczka bazuje na interfejsie GRAFIK Ankiety 0.6. Nie zawiera nazwisk ani zgłoszeń.

## Publikacja na GitHub Pages
1. Utwórz **publiczne** repozytorium GitHub, np. `grafik-ankiety-demo`.
2. Prześlij **zawartość tego folderu** do głównego katalogu repozytorium (`index.html`, `app.js`, `style.css`, `admin.html`, `.nojekyll`). Nie przesyłaj baz SQLite, plików `.env`, haseł ani danych pracowników.
3. Wejdź w **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Wybierz gałąź `main`, folder `/(root)` i kliknij Save.
5. Po publikacji adres ma postać `https://TWOJ-LOGIN.github.io/grafik-ankiety-demo/`.

## Co działa
- Kalendarz, polskie święta, blokada świąt, sobotnie święta i propozycja wolnego, wielokrotne zaznaczanie, kopiowanie godzin i statusów.
- Testowy eksport CSV na **urządzeniu osoby wypełniającej**. Nie jest potwierdzona zgodność kolumn z importerem desktopowego GRAFIKU.

## Czego NIE ma
- Wysyłania odpowiedzi na serwer, wspólnej bazy, logowania, edycji zgłoszenia po wysłaniu i panelu z prawdziwymi zgłoszeniami.
- GitHub Pages nie obsługuje Python/SQLite. Panel admina jest tylko stroną informacyjną.

**Nie udostępniaj tej wersji do zbierania prawdziwych danych pracowników.** To publiczny podgląd i test funkcjonalności w przeglądarce.


## Zmiana 0.8
Po otwarciu formularza automatycznie pokazuje się kolejny miesiąc kalendarzowy (np. w listopadzie 2026 — grudzień 2026). Strzałki nadal umożliwiają zmianę miesiąca.
