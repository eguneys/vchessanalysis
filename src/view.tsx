import { onCleanup, on, onMount, createEffect } from 'solid-js'
import VChessboard from 'vchessboard'
import VChessreplay from 'vchessreplay'

const dark_squares = [
'a1', 'a3', 'a5', 'a7',
'b2', 'b4', 'b6', 'b8',
'c1', 'c3', 'c5', 'c7',
'd2', 'd4', 'd6', 'd8',
'e1', 'e3', 'e5', 'e7',
'f2', 'f4', 'f6', 'f8',
'g1', 'g3', 'g5', 'g7',
'h2', 'h4', 'h6', 'h8']

const light_squares = [
'a2', 'a4', 'a6', 'a8',
'b1', 'b3', 'b5', 'b7',
'c2', 'c4', 'c6', 'c8',
'd1', 'd3', 'd5', 'd7',
'e2', 'e4', 'e6', 'e8',
'f1', 'f3', 'f5', 'f7',
'g2', 'g4', 'g6', 'g8',
'h1', 'h3', 'h5', 'h7']


const orientations = { 'w': 'white', 'b': 'black' }
const i_orientations = ['', 'white', 'black']
const i_presets = ['', 'startpos', 'empty']

function unbindable(
  el: EventTarget,
  eventName: string,
  callback: EventListener,
  options?: AddEventListenerOptions
): Unbind {
  el.addEventListener(eventName, callback, options);
  return () => el.removeEventListener(eventName, callback, options);
}

const App = analysis => (props) => {

  let unbinds = [];

  unbinds.push(unbindable(document, 'scroll', () => analysis.onScroll(), { capture: true, passive: true }));
  unbinds.push(unbindable(window, 'resize', () => analysis.onScroll(), { passive: true }));

  onCleanup(() => unbinds.forEach(_ => _()));



  return (<vchessana>
      <div class='drag-overlay'>
      <Show when={analysis.cur_drag_piece}>{ piece =>
      <piece class={piece.klass} style={piece.style}/>
      }</Show>
      </div>
      <VBoard board={analysis.board}/>
      <VFens drops={analysis.drops} fens={analysis.fens}/>
      </vchessana>)
}

const VFens = props => {
  return (<div class='vfen-wrap'>
      <vfens>
        <For each={props.fens.fens}>{ fen =>
          <VFen fen={fen}/>
        }</For>
      </vfens>
      <VDrops drops={props.drops}/>
    </div>)
}

const VFen = props => {

  return (<vfen>
   <fen onMouseOver={props.fen.hover_fen}>{props.fen.fen}</fen> 
   <VReplay moves={props.fen.moves} on_hover_off={props.fen.on_hover_off}/>
      </vfen>)
}

const VDrops = props => {


  return (<div class='vdrops-wrap'>
      
      <vdrops class={props.drops.klass}>
      <div class="control-sets">
    <div>
      <select onChange={_ => props.drops.preset = i_presets[_.target.selectedIndex]}>
       <option selected disabled>Preset</option>
       <option>startpos</option>
       <option>empty</option>
      </select>
      </div>

      <div>
      <select onChange={_ => props.drops.orientation = i_orientations[_.target.selectedIndex]}>
       <option selected disabled>Orientation</option>
       <option>white</option>
       <option>black</option>
      </select>
      </div>
      </div>

      <pieces>
      <For each={props.drops.pieces}>{piece =>
        <piece ref={_ => setTimeout(() => piece.$ref = _)} onMouseDown={_ => piece.mouse_down = true} class={piece.klass}/>
      }</For>
      </pieces>
    </vdrops>
    <div class='vhead' onClick={props.drops.toggle_head} >
      <span class={['mode', props.drops.mode].join(' ')}>{props.drops.mode}</span>
      </div>


      </div>)
}

const VReplay = props => {
  let $ref

  onMount(() => {
    let api = VChessreplay($ref, {})
    //api.moves = props.moves
    createEffect(on(props.on_hover_off, () => {
      api.hover_off()
          }))
    })

  return (<div ref={$ref} class='vreplay-wrap'></div>)
 
}

const VBoard = props => {

  let $ref

  onMount(() => {
      let api = VChessboard($ref, {})
      let darks = dark_squares.map(_ => `dark@${_}`)
      let lights = light_squares.map(_ => `light@${_}`)
      let bases = [...darks, ...lights]

      createEffect(() => {
          api.instant_track = props.board.instant_track
          })
 
      createEffect(() => {
          api.pieses = props.board.pieses
          })
      createEffect(() => {
          api.orientation = props.board.orientation
          })
       
      createEffect(() => {
          let { squares } = props.board

          api.squares = [...bases, ...squares]
          })

      props.board.ref.$ref = $ref

  })

  return (<div ref={$ref} class={['vboard-wrap', orientations[props.board.orientation]].join(' ')}></div>)
}



export default App
