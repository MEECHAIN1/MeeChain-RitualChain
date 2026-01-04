# MeeChain RitualChain
Web3 app แล้ว — wallet connectivity ที่เป็น single source of truth สำหรับทุกโมดูลใน MeeChain
# 🌌 Genesis Protocol Guide: MeeBot Summoning & Ritual Optimization

Welcome to the RitualChain Genesis Protocol V1.0 — where contributors summon MeeBots, earn mystical badges, and optimize their build rituals.

---

## 🧙 MeeBot Summoning Ritual

### 🔮 Interface Overview
- **Theme Prompt**: Describe your MeeBot (e.g., “นักบวชไซเบอร์”, “ออร์คแสงนีออน”)
- **Optional Image Upload**: Add visual inspiration
- **Create MeeBot**: Initiates the summoning ritual

### 🧾 Ritual Feedback
- **RITUAL COMPLETE**: Confirmation of successful summoning
- **Status**: On-Chain
- **Rarity**: Genesis
- **MeeBot ID**: e.g., MeeBot #101 — Neon Cyber Paladin

---

## 🎖️ Contributor Badge System

Action

Badge

Description

Summon 1 MeeBot

Genesis Caller

First ritual complete

Stake MCB

Energy Weaver

Passive yield initiated

View 10 MeeBots

Archive Seeker

Explorer of summoned souls

Perform 5 Rituals

Ritual Adept

Proven mastery of the Genesis Protocol

Mint rare MeeBot

Void Whisperer

Summoned from the deepest layer

⚙️ Build Optimization Rituals

✅ Manual Chunking (vite.config.ts)
-----------
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        ritualCore: [
          '@base-org/account',
          '@coinbase/wallet-sdk',
          '@wagmi/connectors'
        ],
        uiMagic: [
          '@reown/appkit',
          '@reown/appkit-controllers'
        ]
      }
    }
  }
}
--------
✅ Deduplication

resolve: {
  dedupe: ['ox']
}

✅ Dynamic Imports

const SummonMeeBot = React.lazy(() => import('./components/SummonMeeBot'))

📊 Build Metrics

Modules Transformed: 5059

Build Time: ~55 seconds

Chunk Sizes:

ritualCore: 676.52 KB

uiMagic: 653.87 KB

index: 643.50 KB

🧪 Commit Template

feat: summon optimization + ritual chunking

- Added dynamic import for SummonMeeBot
- Manual chunking for ritualCore and uiMagic
- Enhanced Genesis Protocol UI with rarity and on-chain feedback

Let the summoning begin ✨
