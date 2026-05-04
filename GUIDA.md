# 📖 Guida all'uso — Bar Gestionale

## Indice
1. [Avvio del sistema](#1-avvio-del-sistema)
2. [Vista Tavoli](#2-vista-tavoli)
3. [POS — Comande e pagamenti](#3-pos--comande-e-pagamenti)
4. [Menu & Ricette](#4-menu--ricette)
5. [Ingredienti](#5-ingredienti)
6. [Magazzino](#6-magazzino)
7. [Fornitori](#7-fornitori)
8. [Storico ordini](#8-storico-ordini)
9. [Stampa scontrino](#9-stampa-scontrino)
10. [Backup del database](#10-backup-del-database)
11. [Manutenzione e aggiornamenti](#11-manutenzione-e-aggiornamenti)

---

## 1. Avvio del sistema

### Avvio automatico (consigliato)
Se il servizio systemd è configurato, il backend parte **automaticamente** ad ogni accensione del PC.
Non devi fare nulla — apri il browser e vai su:

```
http://localhost:8000
```

oppure, se sei su un altro dispositivo sulla stessa rete:

```
http://<IP-del-server>:8000
```

Per trovare l'IP del server:
```bash
ip a | grep "inet " | grep -v 127.0.0.1
```

### Avvio manuale (sviluppo)
Se il servizio systemd non è attivo, avvia il backend a mano:

```bash
cd /opt/bar-gestionale
.venv/bin/python -m backend.main
```

Oppure dalla cartella di sviluppo:
```bash
cd ~/Desktop/bar-gestionale
source .venv/bin/activate
python -m backend.main
```

### Controllare lo stato del servizio
```bash
# Stato
sudo systemctl status bar-gestionale

# Avvia
sudo systemctl start bar-gestionale

# Riavvia (dopo aggiornamenti)
sudo systemctl restart bar-gestionale

# Ferma
sudo systemctl stop bar-gestionale

# Leggi i log in tempo reale
journalctl -u bar-gestionale -f
```

### Installazione su tablet / telefono (PWA)
L'app può essere installata come app nativa su qualsiasi dispositivo:
- **Android (Chrome)**: menu ⋮ → *Aggiungi a schermata Home*
- **iOS (Safari)**: icona condividi → *Aggiungi a schermata Home*

Si aprirà a schermo intero senza barra del browser, ottimale per uso da bancone.

---

## 2. Vista Tavoli

La schermata principale mostra la **mappa dei tavoli** con il loro stato:

| Colore | Stato | Significato |
|--------|-------|-------------|
| 🟢 Verde | Libero | Nessuna comanda aperta |
| 🔴 Rosso | Occupato | Comanda aperta in corso |
| 🟡 Giallo | Riservato | Tavolo bloccato manualmente |

### Aprire un tavolo
1. Clicca su un tavolo **libero**
2. Inserisci il numero di coperti
3. Premi **Apri tavolo** → vai automaticamente al POS

### Riaprire una comanda
- Clicca su un tavolo **occupato** → vai direttamente al POS con la comanda esistente

### Aggiornare la mappa
- Premi il bottone **↻ Aggiorna** in alto a destra

---

## 3. POS — Comande e pagamenti

### Aggiungere prodotti
1. Seleziona una categoria dal filtro in alto (o lascia *Tutti*)
2. Clicca sul prodotto per aggiungerlo alla comanda
3. Se il prodotto ha modifiche abilitate, si apre un popup per inserire **quantità e note** (es. "senza ghiaccio")

### Prodotto fuori menù
- Premi **+ Fuori menù** per aggiungere un articolo non presente nel catalogo
- Inserisci nome, prezzo e quantità manualmente

### Rimuovere un articolo
- Premi la **✕** accanto all'articolo nella colonna destra

### Incassare
1. Premi **Incassa** (si attiva quando ci sono articoli)
2. Scegli il metodo: **Contanti**, **Carta** o **Voucher**
3. Con i contanti: inserisci l'importo ricevuto → il sistema calcola automaticamente il **resto**
4. Applica uno sconto opzionale (in percentuale o importo fisso)
5. Premi **Conferma pagamento**
6. Il tavolo torna automaticamente libero
7. Si apre il dialog per **stampare lo scontrino** (opzionale)

### Annullare un ordine
- Premi **Annulla ordine** → il tavolo viene liberato senza registrare pagamento

---

## 4. Menu & Ricette

### Aggiungere un prodotto
1. Vai su **Menu & Ricette**
2. Premi **+ Nuovo prodotto**
3. Compila: nome, categoria, prezzo di vendita, descrizione
4. Attiva *Permetti modifiche* se il prodotto può avere varianti (es. cocktail personalizzabili)
5. Premi **Salva**

### Modificare un prodotto
- Clicca su **Modifica** sulla card del prodotto

### Gestire le ricette
- Dalla scheda prodotto puoi associare gli **ingredienti** con le quantità usate
- Questo permette al magazzino di scalare automaticamente le scorte ad ogni vendita

---

## 5. Ingredienti

- Lista di tutti gli ingredienti usati nelle ricette
- Per ogni ingrediente: nome, unità di misura, costo unitario
- Premi **+ Nuovo ingrediente** per aggiungerne uno
- Gli ingredienti sono collegati al magazzino: modificare il costo qui aggiorna il valore delle scorte

---

## 6. Magazzino

### Dashboard scorte
In alto sono visibili i KPI:
- 🔴 **Critici** — sotto la soglia minima
- 🟡 **In esaurimento** — vicini alla soglia
- 🟢 **OK** — scorte sufficienti
- ⚪ **Non monitorati** — senza soglia impostata
- **Valore scorte** — valore totale del magazzino

### Movimentare le scorte
1. Cerca l'ingrediente con la barra di ricerca
2. Premi **Movimenta**
3. Scegli il tipo di operazione:
   - **Carico** — aggiungi scorta (es. dopo un acquisto)
   - **Scarico** — rimuovi scorta (es. scarto)
   - **Rettifica** — imposta la quantità esatta (es. dopo inventario)
4. Inserisci quantità e nota opzionale
5. Puoi anche aggiornare la **soglia minima** per ricevere l'avviso di riordino

---

## 7. Fornitori

### Aggiungere un fornitore
1. Premi **+ Nuovo fornitore**
2. Compila ragione sociale, referente, telefono, email
3. Premi **Crea fornitore**

### Associare ingredienti a un fornitore
1. Clicca sulla card del fornitore per aprire il **dettaglio**
2. Nella sezione *Aggiungi ingrediente*, seleziona l'ingrediente e inserisci il prezzo per unità
3. Premi **Associa**

Questo ti permette di sapere da quale fornitore acquistare ogni ingrediente e a quale prezzo.

---

## 8. Storico ordini

### Filtrare gli ordini
- **Dal / Al** — intervallo di date (default: oggi)
- **Stato** — tutti, solo chiusi, solo annullati
- Premi **Cerca** per applicare i filtri
- Premi **Reset** per tornare al giorno corrente

### Riepilogo giornaliero
In cima ai risultati appaiono automaticamente:
- Numero di ordini chiusi e annullati
- **Totale lordo** (prima degli sconti)
- **Totale netto** (dopo gli sconti) — il dato rilevante per la cassa

### Dettaglio ordine
- Premi **Dettaglio** su qualsiasi riga per vedere:
  - Lista articoli con quantità e prezzi
  - Sconto applicato
  - Metodo di pagamento usato

---

## 9. Stampa scontrino

Dopo aver confermato un pagamento, appare il bottone **🖨 Stampa scontrino**.

Lo scontrino contiene:
- Data e ora
- Numero tavolo
- Lista articoli con quantità e totale
- Eventuale sconto
- Totale netto
- Metodo di pagamento

In stampa vengono nascosti automaticamente sidebar, bottoni e tutta l'interfaccia — viene stampato solo lo scontrino.

> **Stampanti termiche**: usa il browser di sistema e seleziona la stampante termica. Imposta la larghezza pagina a 58mm o 80mm nelle impostazioni di stampa.

---

## 10. Backup del database

Il database (`bar.db`) contiene **tutti i dati**: ordini, prodotti, ingredienti, fornitori.

### Backup manuale
```bash
/opt/bar-gestionale/scripts/backup.sh
```

Il backup viene salvato in `/opt/bar-gestionale/db/backups/` con nome `bar_YYYYMMDD_HHMMSS.db`.

### Backup automatico (cron)
Il backup è configurato per girare ogni notte alle 03:00:

```bash
# Controlla se il cron è attivo
crontab -l

# Se non c'è, aggiungilo
crontab -e
# Aggiungi la riga:
# 0 3 * * * /opt/bar-gestionale/scripts/backup.sh >> /var/log/bar-backup.log 2>&1
```

### Ripristinare un backup
```bash
# Ferma il server
sudo systemctl stop bar-gestionale

# Sostituisci il database
cp /opt/bar-gestionale/db/backups/bar_YYYYMMDD_HHMMSS.db /opt/bar-gestionale/db/bar.db

# Riavvia
sudo systemctl start bar-gestionale
```

### Pulizia automatica
I backup più vecchi di **30 giorni** vengono eliminati automaticamente dallo script.

---

## 11. Manutenzione e aggiornamenti

### Aggiornare l'app (da GitHub)
```bash
cd /opt/bar-gestionale
git pull
sudo systemctl restart bar-gestionale
```

### Controllare i log
```bash
# Log in tempo reale
journalctl -u bar-gestionale -f

# Ultimi 50 log
journalctl -u bar-gestionale -n 50 --no-pager
```

### Reset completo del database (⚠️ distrugge tutti i dati)
```bash
sudo systemctl stop bar-gestionale
rm /opt/bar-gestionale/db/bar.db
sudo systemctl start bar-gestionale
# Il DB viene ricreato vuoto all'avvio
```
