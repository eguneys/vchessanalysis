import { createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'


const colors = ['white', 'black']
const roles = ['pawn', 'rook', 'queen', 'bishop', 'knight', 'king']
const pieces = colors.flatMap(color => roles.map(role => [color, role].join(' ')))


export class Analysis {


  constructor() {
  

    this.fens = make_fens(this)

    this.drops = make_drops(this)
  }

}


const make_fen = (analysis: Analysis, fen: Fen) => {

  let _on_hover_off = createSignal(undefined, { equals: false })
  let _moves = createSignal([])

  let m_moves = createMemo(() => { return read(_moves) })

  return {
    fen,
    hover_fen() {
      owrite(_on_hover_off)
    },
    get on_hover_off() {
      return _on_hover_off[0]
    },
    get moves() {
      return m_moves()
    }
  }
}

const make_fens = (analysis: Analysis) => {

  let _fens = createSignal([1,2,3])

  let m_fens = createMemo(mapArray(_fens[0], _ => make_fen(analysis, _)))

  return {
    get fens() {
      return m_fens()
    }
  }
}

const make_piece = (analysis: Analysis, piece: string) => {
  return {
    get klass() {
      return piece
    }
  }
}

const modes = ['', 'Move', 'Fen']
const make_drops = (analysis: Analysis) => {
  
  const _mode = createSignal(1)

  const m_is_open = createMemo(() => {
    return read(_mode) === 2
  })
  
  const m_head_klass = createMemo(() => [
    m_is_open() ? 'open': ''
  ].join(' '))

  const m_mode = createMemo(() => {
    return modes[read(_mode)]
  })

  const _pieces = pieces

  const m_pieces = _pieces.map(_ => make_piece(analysis, _))


  return {
    get mode() {
      return m_mode()
    },
    toggle_head() {
      owrite(_mode, _ => _ === 1 ? 2 : 1)
    },
    get klass() {
      return m_head_klass()
    },
    get pieces() {
      return m_pieces
    }
  }
}
