import { onMount } from 'solid-js'
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


const App = analysis => (props) => {

  return (<vchessana>
      <VBoard/>
      <VFens drops={analysis.drops}/>
      </vchessana>)
}

const VFens = props => {
  return (<div class='vfen-wrap'>
      <vfens>
        <For each={[1,2,3]}>{ fen =>
          <VFen fen={fen}/>
        }</For>
      </vfens>
      <VDrops drops={props.drops}/>
    </div>)
}

const VFen = props => {

  return (<vfen>
   <fen>"FENFENFENFENFENFENEFE"</fen> 
   <VReplay/>
      </vfen>)
}

const VDrops = props => {

  return (<div class={props.drops.klass}>
    <div class='vhead' onClick={props.drops.toggle_head} >
      <span>Drops</span>
    </div>
    <vdrops>
    </vdrops>
      </div>)
}

const VReplay = props => {
  let $ref

  onMount(() => {
    let api = VChessreplay($ref, {})
    
    })

  return (<div ref={$ref} class='vreplay-wrap'></div>)
 
}

const VBoard = props => {

  let $ref

  onMount(() => {
      let api = VChessboard($ref, {})
      let darks = dark_squares.map(_ => `dark@${_}`)
      let lights = light_squares.map(_ => `light@${_}`)
      api.squares = [...darks, ...lights]
   })

  return (<div ref={$ref} class='vboard-wrap'></div>)
}



export default App
