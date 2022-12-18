interface TipsData {
  title: string
  pages: {
    image?: string
    text: string
    link?: {
      y?: number
      caption: string
      url: string
    }
  }[]
}

interface LevelData {
  title: string
  tiles: number[][]
  items: number[][]
}

interface EntryData {
  id: string
  uid: string
  name: string
  replayId: string
  score: number
  type: string
  registeredAt: Date
}

interface ReplayData {
  id: string
  score: number
  type: string
  uid: string
  log: string
}
