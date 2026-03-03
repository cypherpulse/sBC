;; This contract implements the SIP-010 community-standard Fungible Token trait.
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Define the FT – internal name changed to bradley-token
(define-fungible-token bradley-token u1000000000000000)  ;; max supply = 1,000,000 tokens × 10^6

;; ────────────────────────────────────────────────
;; Errors
;; ────────────────────────────────────────────────
(define-constant ERR_OWNER_ONLY          (err u100))
(define-constant ERR_NOT_TOKEN_OWNER     (err u101))
(define-constant ERR_INVALID_AMOUNT      (err u102))
(define-constant ERR_MAX_SUPPLY_REACHED  (err u103))
(define-constant ERR_PAYMENT_FAILED      (err u104))

;; ────────────────────────────────────────────────
;; Constants
;; ────────────────────────────────────────────────
(define-constant CONTRACT_OWNER   tx-sender)
(define-constant TOKEN_URI        u"https://hiro.so")   ;; change to your real metadata URL later
(define-constant TOKEN_NAME       "Bradley Token")
(define-constant TOKEN_SYMBOL     "sBC")
(define-constant TOKEN_DECIMALS   u6)

(define-constant MINT_PRICE_PER_UNIT   u1000000)         ;; 1 STX = 1,000,000 microSTX → 1 full token
(define-constant MAX_SUPPLY_UNITS      u1000000000000000) ;; 1,000,000 tokens × 10^6

;; ────────────────────────────────────────────────
;; Read-only SIP-010 functions
;; ────────────────────────────────────────────────

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance bradley-token who)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply bradley-token)))

(define-read-only (get-name)
  (ok TOKEN_NAME))

(define-read-only (get-symbol)
  (ok TOKEN_SYMBOL))

(define-read-only (get-decimals)
  (ok TOKEN_DECIMALS))

(define-read-only (get-token-uri)
  (ok (some TOKEN_URI)))

;; ────────────────────────────────────────────────
;; Public functions
;; ────────────────────────────────────────────────

;; Anyone can mint – but must pay 1 STX per full token (pro-rated)
(define-public (mint (amount uint) (recipient principal))
  (let
    (
      (cost (* amount MINT_PRICE_PER_UNIT))
      (current-supply (ft-get-supply bradley-token))
      (new-supply (+ current-supply amount))
    )

    ;; Basic validations
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (<= new-supply MAX_SUPPLY_UNITS) ERR_MAX_SUPPLY_REACHED)

    ;; Pay the deployer in STX
    (try! (stx-transfer? cost tx-sender CONTRACT_OWNER))

    ;; Mint the tokens to the recipient
    (ft-mint? bradley-token amount recipient)
  )
)

;; Standard SIP-010 transfer (unchanged)
(define-public (transfer
    (amount uint)
    (sender principal)
    (recipient principal)
    (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender))
      ERR_NOT_TOKEN_OWNER)
    (try! (ft-transfer? bradley-token amount sender recipient))
    (match memo
      to-print (print to-print)
      0x)
    (ok true)))