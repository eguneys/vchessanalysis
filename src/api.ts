import { createEffect, createSignal, createMemo } from 'solid-js'
import { Board } from 'lchessanalysis'
import { read, write, owrite } from './play'


let _board = createSignal(Board.from_pieses([]), { equals: false})



export function make_hooks() {
  return {
    on_user_in(piese: string) {
      write(_board, _ => _.in(piese))
    },
    on_user_out(piese: string) {
      write(_board, _ => _.out(piese))
    }
  }
}


export function make_user(analysis: Analysis) {
  let m_pieses = createMemo(() => read(_board).pieses)

  createEffect(() => {
    analysis.pieses = m_pieses()
  })
}
