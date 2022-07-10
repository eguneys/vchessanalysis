import { createEffect, createSignal, createMemo } from 'solid-js'
import { Board, MobileSituation } from 'lchessanalysis'
import { read, write, owrite } from './play'

let preset_fens = {
  'startpos': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  'empty': '8/8/8/8/8/8/8/8 w - - 0 1'
}

let _board = createSignal(Board.from_pieses([]), { equals: false})
let _turn = createSignal('w')
let _orientation = createSignal('w')
let _preset = createSignal('empty')
let _mode = createSignal('fen')

let m_turn = createMemo(() => read(_turn))
let m_pieses = createMemo(() => read(_board).pieses)

let m_orientation = createMemo(() => read(_orientation))
let m_preset = createMemo(() => read(_preset))

let m_mode = createMemo(() => read(_mode))

let m_fen = createMemo(() => [read(_board).fen, m_turn()].join(' '))
let m_situation = createMemo(() => MobileSituation.from_fen(m_fen()))

export function make_hooks() {
  return {
    on_user_ods(piese: string) {

      let [piece, o] = piese.split('@')
      return m_situation().o_ds(o)
    },
    on_user_in(piese: string) {
      write(_board, _ => _.in(piese))
    },
    on_user_out(_piese: string) {
      let _ = _piese.split('@')
      let pos = _[_.length - 1]
      write(_board, _ => _.out(pos))
    },
    on_orientation(orientation: string) {
      owrite(_orientation, orientation)
    },
    on_preset(preset: string) {
      owrite(_preset, preset)
    },
    on_mode(mode: string) {
      owrite(_mode, mode)
    }
  }
}


export function make_user(analysis: Analysis) {
  createEffect(() => {
    analysis.pieses = m_pieses()
  })

  createEffect(() => {
    let preset_fen = preset_fens[m_preset()]
    if (preset_fen) {
      owrite(_board, Board.from_fen(preset_fen.split(' ')[0]))
    }
  })

  createEffect(() => {
    analysis.orientation = m_orientation()
  })


  createEffect(() => {
    analysis.drops.mode = m_mode()
  })
}
