; ============================================================
;  Personalizzazioni NSIS per CAD 2D
;  Incluso automaticamente da electron-builder (build/installer.nsh)
; ============================================================

; Rende l'installer "DPI aware": su schermi 4K / HiDPI l'interfaccia viene
; scalata da NSIS in base al DPI di sistema (testo e controlli nitidi e di
; dimensione corretta) invece di essere ingrandita sfocata da Windows.
!macro customHeader
  ManifestDPIAware true
!macroend

; Forza l'installazione PER TUTTI GLI UTENTI (per-machine) e salta la pagina
; di scelta "per tutti / solo per me". Senza questo, l'installer mostra quella
; pagina e ricade sul default per-utente (C:\Users\...\AppData\Local\Programs).
; Con isForceMachineInstall=1 elevazione UAC + default C:\Program Files.
!macro customInstallMode
  StrCpy $isForceMachineInstall "1"
!macroend

; Forza comunque il percorso predefinito su C:\Program Files\CAD 2D
; (sovrascrive eventuali percorsi memorizzati nel registro).
!macro customInit
  StrCpy $INSTDIR "$PROGRAMFILES64\CAD 2D"
!macroend
