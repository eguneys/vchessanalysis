import { createSignal, createMemo } from 'solid-js'
import { read, write, owrite } from './play'


export class Analysis {


  constructor() {
  

    this.fens = make_fens(this)

    this.drops = make_drops(this)
  }

}

const make_fens = (analysis: Analysis) => {


  return {
    get fens() {
    }
  }
}

const make_drops = (analysis: Analysis) => {
  

  const _is_open = createSignal(false)
  
  const m_head_klass = createMemo(() => [
    'vdrops-wrap',
    read(_is_open) ? 'open': ''
  ].join(' '))



  return {
    toggle_head() {
      owrite(_is_open, _ => !_)
    },
    get klass() {
      return m_head_klass()
    }
  }
}
