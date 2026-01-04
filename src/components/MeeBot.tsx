import React, { useEffect, useState } from 'react'

const MeeBot: React.FC = () => {
  const [messages] = useState<string[]>([
    'สวัสดีจาก MeeBot 👋',
    'I can help you stake and perform rituals.'
  ])

  useEffect(() => {
    // placeholder: in future we can poll for events or chat messages
  }, [])

  return (
    <aside style={{ border: '1px solid #eee', padding: 12 }}>
      <h3>MeeBot</h3>
      <ul>
        {messages.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </aside>
  )
}

export default MeeBot
