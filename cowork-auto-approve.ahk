#Requires AutoHotkey v2.0
#SingleInstance Force
SendMode("Input")
CoordMode("Mouse", "Screen")
CoordMode("Pixel", "Screen")

; ================================================================
; Claude Cowork Auto-Approve (AutoHotkey v2)
; ----------------------------------------------------------------
; Automatycznie klika przycisk "Allow this action" w panelu
; rozszerzenia Claude w Chrome, zeby nie trzeba bylo potwierdzac
; kazdego klikniecia recznie.
;
; JAK UZYWAC (pierwszy raz):
;   1. Otworz Chrome i przypnij panel Claude Cowork po prawej.
;   2. Wywolaj jakas akcje w Cowork, zeby pojawil sie guzik
;      "Allow this action".
;   3. Najedz MYSZKA na sam srodek tego guzika (nie klikaj).
;   4. Wcisnij F9 -> skrypt zapisze pozycje i kolor tla przycisku
;      do pliku cowork-config.ini obok skryptu.
;   5. Wcisnij F8 -> auto-approve WLACZONY. Od teraz gdy w tym
;      pikselu pojawi sie ten sam kolor (czyli przycisk), skrypt
;      sam na niego kliknie i wroci myszka na poprzednia pozycje.
;
; HOTKEYS (dzialaja globalnie, ale klikamy TYLKO gdy Chrome aktywny):
;   F9        Kalibracja: zapamietaj pozycje + kolor pod kursorem
;   F8        Wlacz / wylacz auto-approve
;   F7        Pokaz status
;   Ctrl+F8   EMERGENCY STOP (zamyka skrypt natychmiast)
;   Ctrl+Alt+Shift+Q  dubler dla Ctrl+F8
;
; ZABEZPIECZENIA:
;   - Chrome musi ISTNIEC (moze byc w tle — wtedy skrypt kliknie
;     i PRZYWROCI poprzednie aktywne okno, zebys nie stracil focusa).
;   - Jesli Chrome jest przykryty innym oknem — piksel NIE zgodzi sie
;     z kalibrowanym kolorem, wiec skrypt sam z siebie nie kliknie.
;   - WYKRYWANIE KRAWEDZI: klika TYLKO gdy piksel DOPIERO ZMIENIL
;     stan na kalibrowany kolor (guzik sie POJAWIL). Nie klika gdy
;     piksel caly czas ma ten kolor (np. kolor tla paska bocznego).
;   - RETRY FALLBACK: jesli guzik pasuje juz od 30 s (czyli nasz pierwszy
;     klik nie trafil i Cowork dalej czeka na potwierdzenie) — sprobuj
;     kliknac ponownie. Powtarza sie az piksel znikne.
;   - Tolerancja koloru +/- 20 (scisle dopasowanie).
;   - Double-check po 120 ms (ignoruje chwilowe animacje).
;   - Po kliknieciu przywraca pozycje myszy i poprzednie okno.
;   - Cooldown 1.0 s miedzy klikami (ochrona przed spam-klikiem).
; ================================================================

global g_enabled := false
global g_x := 0
global g_y := 0
global g_color := 0
global g_cfg := A_ScriptDir . "\cowork-config.ini"
global g_was_matching := false  ; edge-detection: czy ostatni check pasowal?
global g_tol := 20              ; tolerancja koloru (scislejsza niz wczesniej)
global g_match_started_ms := 0  ; timestamp kiedy piksel zaczal pasowac (do retry fallback)
global g_retry_after_ms := 30000  ; po ilu ms ponowic klik jesli guzik dalej pasuje (30 s)

; Wczytaj zapisana kalibracje (jesli istnieje plik)
if FileExist(g_cfg) {
    g_x := Integer(IniRead(g_cfg, "calibration", "x", 0))
    g_y := Integer(IniRead(g_cfg, "calibration", "y", 0))
    g_color := Integer(IniRead(g_cfg, "calibration", "color", 0))
}

UpdateTrayTip()
SetTimer(CheckAndClick, 500)

CheckAndClick(*) {
    global g_enabled, g_x, g_y, g_color, g_tol, g_was_matching, g_match_started_ms, g_retry_after_ms
    if (!g_enabled) {
        g_was_matching := false  ; reset stanu gdy wylaczony
        g_match_started_ms := 0
        return
    }
    if (g_x = 0 && g_y = 0)
        return
    ; Chrome musi ISTNIEC, ale nie musi byc aktywne
    if (!WinExist("ahk_exe chrome.exe"))
        return

    cur := PixelGetColor(g_x, g_y, "RGB")
    is_matching := ColorsMatch(cur, g_color, g_tol)

    ; Jesli nie pasuje — guzika nie ma, zeruj stan
    if (!is_matching) {
        g_was_matching := false
        g_match_started_ms := 0
        return
    }

    ; Piksel pasuje. Dwa scenariusze klikniecia:
    ;   A) Edge trigger — poprzednio NIE pasowal (guzik wlasnie sie pojawil)
    ;   B) Retry fallback — pasuje juz od >30s (nasz klik nie trafil, Cowork dalej czeka)
    now := A_TickCount
    should_click := false

    if (!g_was_matching) {
        ; Scenariusz A: edge trigger
        should_click := true
        g_match_started_ms := now
    } else {
        ; Scenariusz B: retry fallback po timeoucie
        elapsed := now - g_match_started_ms
        if (elapsed >= g_retry_after_ms) {
            should_click := true
            g_match_started_ms := now  ; reset licznika — za 30s sprobujemy znow
            TrayTip("Guzik dalej widoczny po " . Round(elapsed/1000) . "s — retry", "Claude Cowork")
        }
    }

    if (!should_click)
        return

    ; Stabilizacja — ignoruj chwilowe animacje
    Sleep(120)
    cur2 := PixelGetColor(g_x, g_y, "RGB")
    if (!ColorsMatch(cur2, g_color, g_tol))
        return

    DoSafeClick(g_x, g_y)

    ; Zaznacz ze juz klikneli smy w to pojawienie sie guzika
    g_was_matching := true

    ; Krotki cooldown (ochrona przed podwojnym klikiem)
    Sleep(1000)
}

DoSafeClick(x, y) {
    ; Zapisz aktualne aktywne okno + pozycje myszy
    prevHwnd := 0
    try prevHwnd := WinGetID("A")
    MouseGetPos(&ox, &oy)

    ; Klik — moze aktywowac Chrome, przywrocimy focus ponizej
    Click(x, y)
    Sleep(40)
    MouseMove(ox, oy, 0)

    ; Przywroc poprzednie okno jesli focus zostal przejety
    if (prevHwnd) {
        Sleep(80)
        try {
            if (WinGetID("A") != prevHwnd && WinExist("ahk_id " . prevHwnd))
                WinActivate("ahk_id " . prevHwnd)
        }
    }
}

F9:: {
    global g_x, g_y, g_color, g_cfg
    MouseGetPos(&mx, &my)
    mc := PixelGetColor(mx, my, "RGB")
    g_x := mx
    g_y := my
    g_color := mc
    IniWrite(g_x, g_cfg, "calibration", "x")
    IniWrite(g_y, g_cfg, "calibration", "y")
    IniWrite(g_color, g_cfg, "calibration", "color")
    TrayTip("Skalibrowano: " mx "," my " kolor " HexColor(mc), "Claude Cowork")
    UpdateTrayTip()
}

F8:: {
    global g_enabled, g_x, g_y
    if (g_x = 0 && g_y = 0) {
        MsgBox("Najpierw najedz na guzik 'Allow this action' i wcisnij F9.", "Brak kalibracji", "IconX")
        return
    }
    g_enabled := !g_enabled
    UpdateTrayTip()
    status := g_enabled ? "WLACZONE" : "WYLACZONE"
    TrayTip("Auto-approve " status, "Claude Cowork")
}

F7:: {
    global g_enabled, g_x, g_y, g_color
    status := g_enabled ? "WLACZONE" : "WYLACZONE"
    MsgBox("Stan: " status "`nPozycja: " g_x ", " g_y "`nKolor: " HexColor(g_color), "Status Claude Cowork", "Iconi")
}

^F8:: EmergencyStop()
^!+q:: EmergencyStop()

EmergencyStop() {
    global g_enabled
    g_enabled := false
    TrayTip("EMERGENCY STOP", "Claude Cowork")
    Sleep(1000)
    ExitApp()
}

ColorsMatch(c1, c2, tol) {
    r1 := (c1 >> 16) & 0xFF, g1 := (c1 >> 8) & 0xFF, b1 := c1 & 0xFF
    r2 := (c2 >> 16) & 0xFF, g2 := (c2 >> 8) & 0xFF, b2 := c2 & 0xFF
    return (Abs(r1 - r2) <= tol) && (Abs(g1 - g2) <= tol) && (Abs(b1 - b2) <= tol)
}

HexColor(c) {
    return "0x" . SubStr("00000" . Format("{:X}", c), -5)
}

UpdateTrayTip() {
    global g_enabled, g_x, g_y
    status := g_enabled ? "ON" : "OFF"
    calib := (g_x = 0 && g_y = 0) ? " [brak kalibracji]" : ""
    A_IconTip := "Claude Cowork Auto-Approve [" status "]" calib
}
