import { createEffect, createSignal, createMemo } from 'solid-js'
import { Board, MobileSituation } from 'lchessanalysis'
import { read, write, owrite } from './play'

let preset_fens = {
  'startpos': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  'empty': '8/8/8/8/8/8/8/8 w - - 0 1'
}

let _situation = createSignal(MobileSituation.from_fen(preset_fens['empty']))

let m_situation = createMemo(() => read(_situation))

let m_board = createMemo(() => m_situation().board)

let _turn = createSignal('w')
let _orientation = createSignal('w')
let _preset = createSignal('empty')
let _mode = createSignal('fen')

let m_turn = createMemo(() => read(_turn))
let m_pieses = createMemo(() => m_board().pieses)

let m_orientation = createMemo(() => read(_orientation))
let m_preset = createMemo(() => read(_preset))

let m_mode = createMemo(() => read(_mode))


export function make_hooks() {
  return {
    can_user_od(od: OD) {
      return m_situation().ods.includes(od)
    },
    on_user_od(od: string) {
      return owrite(_situation, _ => _.od(od)[0])
    },
    on_user_ods(piese: string) {

      let [piece, o] = piese.split('@')
      return m_situation().o_ds(o)
    },
    on_user_in(piese: string) {
      owrite(_situation, _ => _.with_board(_ => {
        _.in(piese) 
        return _
      }))
    },
    on_user_out(_piese: string) {
      let _ = _piese.split('@')
      let pos = _[_.length - 1]

      owrite(_situation, _ => _.with_board(_ => {
        _.out(pos) 
        return _
      }))
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
      owrite(_situation, _ => _.with_board(_ => Board.from_fen(preset_fen.split(' ')[0])))
    }
  })

  createEffect(() => {
    analysis.orientation = m_orientation()
  })


  createEffect(() => {
    analysis.drops.mode = m_mode()
  })
}
