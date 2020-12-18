# StadreinigerKS
Widget um die möchten Abholtermine der Stadtreiniger anzuzeigen

![](widget.jpeg)

### Konfiguration
Das Widget benötigt die bmsLocationId. Diese kann mit folgenden Schritten ermittelt werden.

1. Öffne die Webseite https://insert-it.de/BMSAbfallkalenderKassel/ 
2. Gebe dort deine Strasse und Hausnummer ein
3. Es erscheint nun ein Kalender
4. In der URL (Adresszeile des Browsers) findet du nun einen Parameter ...bmsLocationId=
5. Die dort genannte Zahl is die notwendige ID ( z.B. 104242 für den Kirchweg 17)
6. Diese Nummer wird nun als Paremeter in der Widget-Konfiguration eingetragen

![](config.jpeg)


### Known Bugs
Es gibt leider nur ein Icon der Stadtreinierger auf hellem Hintergrund.
Dies wird nur angezeigt, wenn man sich nicht im Tagmodus befindet.
Im Dunkelmodus wird auf ein Icon verzichtet.
Wer ganz auf ein Icon verzichten möchte, muss im Code faviconURL = "" setzen


### ChangeLog
- 2020-12-18 initial version
