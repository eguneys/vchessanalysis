import { createEffect, createSignal, createMemo } from 'solid-js'
import { Board } from 'lchessanalysis'
import { read, write, owrite } from './play'

let preset_fens = {
  'startpos': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  'empty': '8/8/8/8/8/8/8/8'
}

let _analysis = createSignal({
  mode: 'move',
  orientation: 'w'
}, { equals: false })

let _board = createSignal(Board.from_pieses([]), { equals: false})



export function make_hooks() {
  return {
    on_user_in(piese: string) {
      write(_board, _ => _.in(piese))
    },
    on_user_out(_piese: string) {
      let _ = _piese.split('@')
      let pos = _[_.length - 1]
      write(_board, _ => _.out(pos))
    },
    on_orientation(orientation: string) {
      write(_analysis, _ => _.orientation = orientation)
    },
    on_preset(preset: string) {
      write(_analysis, _ => _.preset = preset)
    },
    on_mode(mode: string) {
      write(_analysis, _ => _.mode = mode)
    }
  }
}


export function make_user(analysis: Analysis) {
  let m_pieses = createMemo(() => read(_board).pieses)

  let m_orientation = createMemo(() => read(_analysis).orientation)
  let m_preset = createMemo(() => read(_analysis).preset)

  let m_mode = createMemo(() => read(_analysis).mode)

  createEffect(() => {
    analysis.pieses = m_pieses()
  })

  createEffect(() => {
    let preset_fen = preset_fens[m_preset()]
    if (preset_fen) {
      owrite(_board, Board.from_fen(preset_fen))
    }
  })

  createEffect(() => {
    analysis.orientation = m_orientation()
  })


  createEffect(() => {
    analysis.drops.mode = m_mode()
  })
}
