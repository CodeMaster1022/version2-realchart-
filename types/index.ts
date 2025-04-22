export interface DataPoint {
    time: string
    bpm: number
    isNew: boolean
  }
  
  export interface HeartRateZone {
    min: number
    max: number
    color: string
    label: string
  }
  
  export interface HeartRateStats {
    avg: number
    min: number
    max: number
  }
  